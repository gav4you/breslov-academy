import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { BookOpen, GraduationCap, Users, Menu, X, LogOut, User, Plug, Beaker, ChevronDown, Settings, BookMarked, Search, Archive } from 'lucide-react';
import { canCreateCourses } from '@/components/utils/permissions';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import ThemeToggle from '@/components/theme/ThemeToggle';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import SchoolSwitcher from '@/components/school/SchoolSwitcher';
import CommandPalette from '@/components/navigation/CommandPalette';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSchool, setActiveSchool] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [isSchoolAdmin, setIsSchoolAdmin] = useState(false);
  const [canTeach, setCanTeach] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        loadSchoolData(currentUser);
      } catch (error) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const loadSchoolData = async (currentUser) => {
    try {
      // Get user memberships
      const userMemberships = await base44.entities.SchoolMembership.filter({
        user_email: currentUser.email
      });
      setMemberships(userMemberships);

      // Get active school
      const activeSchoolId = localStorage.getItem('active_school_id');
      if (activeSchoolId) {
        const schools = await base44.entities.School.filter({ id: activeSchoolId });
        if (schools.length > 0) {
          setActiveSchool(schools[0]);
          
          // Check if admin
          const membership = userMemberships.find(m => m.school_id === activeSchoolId);
          setIsSchoolAdmin(membership?.role === 'OWNER' || membership?.role === 'ADMIN');
          setCanTeach(membership ? canCreateCourses(membership.role) : false);
        }
      }
    } catch (error) {
      console.error('Error loading school data:', error);
    }
  };

  const handleSchoolChange = async (schoolId) => {
    // Update preference
    const prefs = await base44.entities.UserSchoolPreference.filter({
      user_email: user.email
    });

    if (prefs.length > 0) {
      await base44.entities.UserSchoolPreference.update(prefs[0].id, {
        active_school_id: schoolId,
        updated_at: new Date().toISOString()
      });
    } else {
      await base44.entities.UserSchoolPreference.create({
        user_email: user.email,
        active_school_id: schoolId,
        updated_at: new Date().toISOString()
      });
    }

    localStorage.setItem('active_school_id', schoolId);
  };

  // Determine audience
  const userAudience = isSchoolAdmin ? 'admin' : (canTeach ? 'teacher' : 'student');

  // Core navigation - minimal and focused
  const coreNavigation = [
    { name: 'Dashboard', path: 'Dashboard', icon: BookOpen },
    { name: 'Courses', path: 'Courses', icon: GraduationCap },
    { name: 'Reader', path: 'Reader', icon: BookMarked },
    { name: 'Community', path: 'Feed', icon: Users },
    { name: 'Search', path: 'SchoolSearch', icon: Search },
    ...(canTeach ? [{ name: 'Teach', path: 'Teach', icon: GraduationCap }] : []),
    ...(canTeach ? [{ name: 'Analytics', path: 'TeachAnalytics', icon: GraduationCap }] : []),
  ];

  // Labs features - advanced/experimental
  const labsFeatures = [
    { name: 'Language Learning', path: 'Languages', icon: BookOpen },
    { name: 'Study Sets', path: 'StudySets', icon: BookOpen },
    { name: 'Challenges', path: 'Challenges', icon: BookOpen },
    { name: 'Achievements', path: 'Achievements', icon: BookOpen },
    { name: 'Live Streams', path: 'LiveStreams', icon: BookOpen },
    { name: 'Analytics', path: 'Analytics', icon: BookOpen },
    { name: 'Career Paths', path: 'CareerPaths', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <style>{`
        :root {
          --primary-navy: #0f172a;
          --primary-gold: #d4af37;
          --accent-blue: #1e40af;
        }
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        
        h1, h2, h3, h4 {
          font-family: 'Crimson Text', serif;
        }
        
        body {
          font-family: 'Inter', sans-serif;
        }
      `}</style>

      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={createPageUrl('Dashboard')} className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-amber-500/50 transition-all">
                <BookOpen className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Breslov Academy</h1>
                <p className="text-xs text-amber-400">Torah of Rebbe Nachman</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {coreNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.path;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.path)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-amber-500 text-slate-900 shadow-lg'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{item.name}</span>
                  </Link>
                );
              })}

              {/* Labs Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-700">
                    <Beaker className="w-4 h-4 mr-2" />
                    Labs
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>Experimental Features</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {labsFeatures.map((feature) => (
                    <DropdownMenuItem key={feature.name} asChild>
                      <Link to={createPageUrl(feature.path)} className="cursor-pointer">
                        {feature.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Vault Link */}
              <Link
                to={createPageUrl('Vault')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  currentPageName === 'Vault'
                    ? 'bg-amber-500 text-slate-900 shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Archive className="w-4 h-4" />
                <span className="font-medium text-sm">Vault</span>
              </Link>

              {/* Command Palette */}
              <CommandPalette audience={userAudience} />
            </nav>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-2">
              {user && (
                <>
                  <SchoolSwitcher 
                    activeSchool={activeSchool}
                    memberships={memberships}
                    onSchoolChange={handleSchoolChange}
                    isAdmin={isSchoolAdmin}
                  />
                  <NotificationCenter user={user} />
                  <ThemeToggle userEmail={user.email} />
                  <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="text-slate-300">
                              <User className="w-4 h-4 mr-2" />
                              {user.full_name}
                              <ChevronDown className="w-3 h-3 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                              <div className="text-sm">{user.full_name}</div>
                              <div className="text-xs text-slate-500">{user.email}</div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link to={createPageUrl('Portfolio')}>Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={createPageUrl('Integrations')}>Integrations</Link>
                            </DropdownMenuItem>
                            {isSchoolAdmin && (
                              <DropdownMenuItem asChild>
                                <Link to={createPageUrl('SchoolAdmin')}>School Admin</Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem asChild>
                              <Link to={createPageUrl('Vault')}>Vault (All Features)</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => base44.auth.logout()}>
                              <LogOut className="w-4 h-4 mr-2" />
                              Sign Out
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-800 border-t border-slate-700">
            <div className="px-4 py-4 space-y-2">
              {coreNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.path;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.path)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                      isActive
                        ? 'bg-amber-500 text-slate-900'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}

              {/* Labs Section */}
              <div className="pt-2 pb-1 px-4">
                <p className="text-xs text-slate-500 font-semibold">LABS</p>
              </div>
              {labsFeatures.map((feature) => (
                <Link
                  key={feature.name}
                  to={createPageUrl(feature.path)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700"
                >
                  <Beaker className="w-5 h-5" />
                  <span className="font-medium">{feature.name}</span>
                </Link>
              ))}

              {/* Other Links */}
              {canTeach && (
                <Link
                  to={createPageUrl('Teach')}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700"
                >
                  <BookMarked className="w-5 h-5" />
                  <span className="font-medium">Teach</span>
                </Link>
              )}
              <Link
                to={createPageUrl('Integrations')}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700"
              >
                <Plug className="w-5 h-5" />
                <span className="font-medium">Integrations</span>
              </Link>
              <Link
                to={createPageUrl('Portfolio')}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700"
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Profile</span>
              </Link>

              {user && (
                <button
                  onClick={() => base44.auth.logout()}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-slate-400 text-sm">
              © 2024 Breslov Academy • Spreading the Torah of Rebbe Nachman of Breslov
            </p>
            <p className="text-slate-500 text-xs mt-2">
              "It is a great mitzvah to always be happy" - Likutey Moharan II:24
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}