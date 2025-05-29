
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { APP_NAME } from '../constants';
import { UserIcon } from './icons';

export const LoginModal: React.FC = () => {
  const { login, availableUsers } = useAuth();

  const handleLogin = (userId: string) => {
    login(userId);
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <Card title={`Welcome to ${APP_NAME}`} className="w-full max-w-md">
        <div className="text-center mb-6">
          <AcademicCapIcon className="w-16 h-16 text-primary-600 mx-auto mb-2" />
          <p className="text-gray-600">Please select your role to continue.</p>
        </div>
        <div className="space-y-3">
          {availableUsers.map(user => (
            <Button 
              key={user.id} 
              onClick={() => handleLogin(user.id)} 
              variant="primary" 
              className="w-full justify-start"
              leftIcon={<UserIcon className="w-5 h-5 mr-2"/>}
            >
              Login as {user.username} ({user.role})
            </Button>
          ))}
           <Button 
              onClick={() => handleLogin(UserRole.TEACHER)} 
              variant="secondary" 
              className="w-full justify-start"
              leftIcon={<UserIcon className="w-5 h-5 mr-2"/>}
            >
              Teacher Demo Access
            </Button>
            <Button 
              onClick={() => handleLogin(UserRole.LEARNER)} 
              variant="secondary" 
              className="w-full justify-start"
              leftIcon={<UserIcon className="w-5 h-5 mr-2"/>}
            >
              Learner Demo Access
            </Button>
        </div>
         <p className="mt-4 text-xs text-gray-500 text-center">
            For demonstration purposes, predefined users are available. In a real system, you would have a secure login.
          </p>
      </Card>
    </div>
  );
};

// Adding AcademicCapIcon here due to file structure constraints, ideally it's in icons.tsx
const AcademicCapIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
</svg>
);
    