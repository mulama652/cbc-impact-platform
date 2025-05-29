
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { APP_NAME } from '../constants';
import { UserIcon, AcademicCapIcon, LightBulbIcon, BriefcaseIcon, DocumentTextIcon, LogoutIcon } from './icons';
import { Button } from './common/Button';


interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

export const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const navItems: NavItem[] = [
    { path: '/profile', label: 'Profile', icon: <UserIcon className="w-5 h-5" />, roles: [UserRole.LEARNER, UserRole.PARENT, UserRole.TEACHER] },
    { path: '/projects', label: 'Projects', icon: <AcademicCapIcon className="w-5 h-5" />, roles: [UserRole.LEARNER, UserRole.PARENT, UserRole.TEACHER] },
    { path: '/reflections', label: 'Reflections', icon: <LightBulbIcon className="w-5 h-5" />, roles: [UserRole.LEARNER, UserRole.PARENT, UserRole.TEACHER] },
    { path: '/career', label: 'Career Guidance', icon: <BriefcaseIcon className="w-5 h-5" />, roles: [UserRole.LEARNER] },
    { path: '/learners', label: 'All Learners', icon: <DocumentTextIcon className="w-5 h-5" />, roles: [UserRole.TEACHER] },
  ];

  if (!currentUser) return null;

  const filteredNavItems = navItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <nav className="bg-primary-700 text-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <AcademicCapIcon className="w-8 h-8 text-white" />
            <span className="font-bold text-xl">{APP_NAME}</span>
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600 flex items-center space-x-2 ${
                  location.pathname === item.path ? 'bg-primary-800' : ''
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          <div className="flex items-center">
             <span className="text-sm mr-4 hidden sm:block">Welcome, {currentUser.username}!</span>
            <Button onClick={logout} variant="secondary" size="sm" leftIcon={<LogoutIcon className="w-4 h-4" />}>
              Logout
            </Button>
          </div>
        </div>
      </div>
      {/* Mobile Menu (optional, basic version) */}
      <div className="md:hidden border-t border-primary-600">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        {filteredNavItems.map((item) => (
            <Link
            key={item.path}
            to={item.path}
            className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-600 flex items-center space-x-2 ${
                location.pathname === item.path ? 'bg-primary-800' : ''
            }`}
            >
            {item.icon}
            <span>{item.label}</span>
            </Link>
        ))}
        </div>
      </div>
    </nav>
  );
};
    