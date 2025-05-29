
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { LearnerProfile } from './components/LearnerProfile';
import { ProjectSection } from './components/ProjectSection';
import { ReflectionSection } from './components/ReflectionSection';
import { CareerGuidanceSection } from './components/CareerGuidanceSection';
import { UserRole } from './types';
import { APP_NAME } from './constants';


const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/profile" replace />;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to {APP_NAME}, {currentUser.username}!</h1>
      <p className="text-gray-600 mb-6">This is your central hub. Use the navigation bar to explore your profile, projects, reflections, and career guidance.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-primary-700 mb-2">Quick Links</h2>
          <ul className="space-y-2">
            <li><a href="#/profile" className="text-primary-600 hover:underline">My Profile</a></li>
            <li><a href="#/projects" className="text-primary-600 hover:underline">My Projects</a></li>
            <li><a href="#/reflections" className="text-primary-600 hover:underline">My Reflections</a></li>
            {currentUser.role === UserRole.LEARNER && (
              <li><a href="#/career" className="text-primary-600 hover:underline">Career Guidance</a></li>
            )}
          </ul>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-secondary-700 mb-2">Platform Goals</h2>
            <p className="text-gray-600 text-sm">
                {APP_NAME} aims to support the Competency-Based Curriculum by fostering learner agency,
                showcasing achievements, promoting reflective practice, and guiding future pathways.
                We believe in the collaborative power of learners, parents, and teachers.
            </p>
        </div>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <LoginModal />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-0 sm:px-4 py-4 sm:py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<LearnerProfile />} />
          <Route path="/projects" element={<ProjectSection />} />
          <Route path="/reflections" element={<ReflectionSection />} />
          
          {currentUser.role === UserRole.LEARNER && (
            <Route path="/career" element={<CareerGuidanceSection />} />
          )}
          {currentUser.role === UserRole.TEACHER && (
             <Route path="/learners" element={<LearnerProfile />} /> // Teacher views all learners here
          )}
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="bg-gray-200 text-center p-4 text-sm text-gray-600">
        &copy; {new Date().getFullYear()} {APP_NAME}. Empowering CBC.
      </footer>
    </div>
  );
};

export default App;
    