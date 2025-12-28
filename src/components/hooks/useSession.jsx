// Session Management Hook - Single Source of Truth
import { useState, useEffect, createContext, useContext } from 'react';
import { base44 } from '@/api/base44Client';
import { normalizeAudienceFromRole } from '../config/features';

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [activeSchool, setActiveSchool] = useState(null);
  const [activeSchoolId, setActiveSchoolId] = useState(null);
  const [role, setRole] = useState(null);
  const [audience, setAudience] = useState('student');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      setIsLoading(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Load memberships
      const userMemberships = await base44.entities.SchoolMembership.filter({
        user_email: currentUser.email
      });
      setMemberships(userMemberships);

      // Load active school
      const storedSchoolId = localStorage.getItem('active_school_id');
      if (storedSchoolId) {
        await loadActiveSchool(storedSchoolId, userMemberships);
      }
    } catch (error) {
      console.error('Session load error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadActiveSchool = async (schoolId, userMemberships = memberships) => {
    try {
      const schools = await base44.entities.School.filter({ id: schoolId });
      if (schools[0]) {
        setActiveSchool(schools[0]);
        setActiveSchoolId(schoolId);
        
        // Determine role and audience
        const membership = userMemberships.find(m => m.school_id === schoolId);
        if (membership) {
          setRole(membership.role);
          setAudience(normalizeAudienceFromRole(membership.role));
        }
      }
    } catch (error) {
      console.error('Load active school error:', error);
    }
  };

  const changeActiveSchool = async (schoolId) => {
    localStorage.setItem('active_school_id', schoolId);
    await loadActiveSchool(schoolId);
    
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
    
    window.location.reload();
  };

  const value = {
    user,
    memberships,
    activeSchool,
    activeSchoolId,
    role,
    audience,
    isLoading,
    isAdmin: audience === 'admin',
    isTeacher: audience === 'teacher' || audience === 'admin',
    isStudent: audience === 'student',
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