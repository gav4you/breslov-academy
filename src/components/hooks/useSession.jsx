// Session Management Hook - Single Source of Truth
import { useState, useEffect, createContext, useContext } from 'react';
import { base44 } from '@/api/base44Client';
import { normalizeAudienceFromRole } from '@/components/config/features';
import { isGlobalAdmin as isGlobalAdminByEmail } from '@/components/auth/roles';

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [activeSchool, setActiveSchool] = useState(null);
  const [activeSchoolId, setActiveSchoolId] = useState(null);
  const [activeSchoolSlug, setActiveSchoolSlug] = useState(null);
  const [activeSchoolSource, setActiveSchoolSource] = useState(null); // localStorage | preference | firstMembership | manual
  const [role, setRole] = useState(null);
  const [audience, setAudience] = useState('student');
  const [isGlobalAdmin, setIsGlobalAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      setIsLoading(true);
      const currentUser = await base44.auth.me();
      if (!currentUser) {
        setUser(null);
        setMemberships([]);
        setActiveSchool(null);
        setActiveSchoolId(null);
        setActiveSchoolSlug(null);
        setActiveSchoolSource(null);
        setRole(null);
        setAudience('student');
        setIsGlobalAdmin(false);
        return;
      }
      setUser(currentUser);
      setIsGlobalAdmin(
        isGlobalAdminByEmail(currentUser?.email || '') ||
        String(currentUser?.role || '').toLowerCase() === 'admin'
      );

      // Load memberships
      const userMemberships = await base44.entities.SchoolMembership.filter({
        user_email: currentUser.email
      });
      setMemberships(userMemberships);

      // Load active school (localStorage -> persisted preference -> first membership)
      let preferredSchoolId = null;
      let preferredSource = null;
      try {
        preferredSchoolId = localStorage.getItem('active_school_id');
        preferredSource = preferredSchoolId ? 'localStorage' : null;
      } catch (e) {
        preferredSchoolId = null;
        preferredSource = null;
      }

      if (!preferredSchoolId) {
        try {
          const prefs = await base44.entities.UserSchoolPreference.filter({
            user_email: currentUser.email,
          });
          if (prefs?.[0]?.active_school_id) {
            preferredSchoolId = prefs[0].active_school_id;
            preferredSource = 'preference';
          }
        } catch (e) {
          // optional entity in some workspaces
        }
      }

      const membershipIds = new Set(
        (userMemberships || []).map((m) => m?.school_id).filter(Boolean)
      );

      if (preferredSchoolId && membershipIds.size > 0 && !membershipIds.has(preferredSchoolId)) {
        preferredSchoolId = null;
        preferredSource = null;
      }

      if (!preferredSchoolId && userMemberships.length > 0) {
        preferredSchoolId = userMemberships[0].school_id;
        preferredSource = 'firstMembership';
      }

      setActiveSchoolSource(preferredSource);

      if (preferredSchoolId) {
        try {
          localStorage.setItem('active_school_id', preferredSchoolId);
        } catch (e) {
          // ignore storage failures
        }
        await loadActiveSchool(preferredSchoolId, userMemberships, preferredSource);

        // Reconcile subscriptions (best effort, background)
        try {
          const { reconcileSubscriptions } = await import('../subscriptions/subscriptionEngine');
          reconcileSubscriptions({
            school_id: preferredSchoolId,
            user_email: currentUser.email,
          });
        } catch (e) {
          console.warn('Subscription reconciliation failed:', e);
        }
      } else {
        setActiveSchool(null);
        setActiveSchoolId(null);
        setActiveSchoolSlug(null);
      }
    } catch (error) {
      console.error('Session load error:', error);
      setUser(null);
      setMemberships([]);
      setActiveSchool(null);
      setActiveSchoolId(null);
      setActiveSchoolSlug(null);
      setActiveSchoolSource(null);
      setRole(null);
      setAudience('student');
      setIsGlobalAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadActiveSchool = async (schoolId, userMemberships = memberships, source = activeSchoolSource) => {
    try {
      const schools = await base44.entities.School.filter({ id: schoolId });
      if (schools[0]) {
        setActiveSchool(schools[0]);
        setActiveSchoolId(schoolId);
        setActiveSchoolSlug(schools[0].slug || null);
        if (source) {
          setActiveSchoolSource(source);
        }
        
        // Determine role and audience
        const membership = userMemberships.find(m => m.school_id === schoolId);
        if (membership) {
          const derivedRole = membership.role;
          setRole(derivedRole);
          
          // Smart Context: Check if user intends to view a specific portal
          // and has the permissions to do so.
          const intended = localStorage.getItem('ba_intended_audience');
          const defaultAudience = normalizeAudienceFromRole(derivedRole);
          
          let finalAudience = defaultAudience;

          if (intended) {
            // Allow downgrading context (e.g. Admin -> Student)
            // But prevent upgrading (Student -> Admin) without role
            if (defaultAudience === 'admin') {
               // Admin can be anything
               if (['student', 'teacher', 'admin'].includes(intended)) {
                 finalAudience = intended;
               }
            } else if (defaultAudience === 'teacher') {
               // Teacher can be student or teacher
               if (['student', 'teacher'].includes(intended)) {
                 finalAudience = intended;
               }
            }
            // Student stays student
          }
          
          setAudience(finalAudience);
        }
      } else {
        setActiveSchool(null);
        setActiveSchoolId(null);
        setActiveSchoolSlug(null);
      }
    } catch (error) {
      console.error('Load active school error:', error);
    }
  };

  const changeActiveSchool = async (schoolId) => {
    try {
      localStorage.setItem('active_school_id', schoolId);
    } catch (e) {
      // ignore storage failures
    }
    await loadActiveSchool(schoolId, memberships, 'manual');
    
    // Update preference
    try {
      const prefs = await base44.entities.UserSchoolPreference.filter({
        user_email: user.email
      });
      if (prefs.length > 0) {
        await base44.entities.UserSchoolPreference.update(prefs[0].id, {
          active_school_id: schoolId
        });
      } else {
        await base44.entities.UserSchoolPreference.create({
          user_email: user.email,
          active_school_id: schoolId
        });
      }
    } catch (error) {
      console.error('Update preference error:', error);
    }
    
    // Avoid full reload; react-query + scoped keys already include school_id.
  };

  const value = {
    user,
    memberships,
    activeSchool,
    activeSchoolId,
    activeSchoolSlug,
    activeSchoolSource,
    needsSchoolSelection: memberships.length > 1 && (!activeSchoolId || activeSchoolSource === 'firstMembership'),
    role,
    audience,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: audience === 'admin' || isGlobalAdmin,
    isTeacher: audience === 'teacher' || audience === 'admin' || isGlobalAdmin,
    isStudent: audience === 'student',
    isGlobalAdmin,
    changeActiveSchool,
    refreshSession: loadSession
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};
