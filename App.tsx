import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
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
  const [projectImages, setProjectImages] = React.useState<File[]>([]);

  const handleProjectImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProjectImages(Array.from(e.target.files));
    }
  };

  if (!currentUser) return <Navigate to="/profile" replace />;

  // Role-based dashboard content
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Welcome to {APP_NAME}, {currentUser.username}!
      </h1>
      <p className="text-gray-600 mb-6">
        {currentUser.role === UserRole.PARENT
          ? "You can view your child's profile and projects."
          : currentUser.role === UserRole.TEACHER
          ? "You can view all learners' profiles and projects."
          : "This is your central hub. Use the navigation bar to explore your profile, projects, reflections, and career guidance."
        }
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-primary-700 mb-2">Quick Links</h2>
          <ul className="space-y-2">
            {/* Learner: own info, Parent: child's info, Teacher: all */}
            <li>
              <Link to="/profile" className="text-primary-600 hover:underline">
                {currentUser.role === UserRole.PARENT ? "My Child's Profile" : "My Profile"}
              </Link>
            </li>
            <li>
              <div className="flex flex-col gap-2">
                <Link to="/projects" className="text-primary-600 hover:underline">
                  {currentUser.role === UserRole.PARENT ? "My Child's Projects" : "My Projects"}
                </Link>
                {/* Project image upload for learners only */}
                {currentUser.role === UserRole.LEARNER && (
                  <>
                    <label className="block text-sm text-gray-600 mt-2">
                      Add Project Images:
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleProjectImageUpload}
                        className="block mt-1"
                      />
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {projectImages.map((file, idx) => (
                        <img
                          key={idx}
                          src={URL.createObjectURL(file)}
                          alt={`Project ${idx + 1}`}
                          className="w-16 h-16 object-cover rounded border"
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </li>
            <li>
              <Link to="/reflections" className="text-primary-600 hover:underline">
                My Reflections
              </Link>
            </li>
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

// Landing Page Component
const LandingPage: React.FC = () => {
  const [showLogin, setShowLogin] = React.useState(false);

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1500&q=80')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 to-purple-900/60 z-0"></div>
      <header className="w-full py-6 px-4 flex justify-between items-center bg-white/80 shadow relative z-10">
        <span className="text-2xl font-bold text-primary-700">{APP_NAME}</span>
        <button
          onClick={() => setShowLogin(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition"
        >
          Login
        </button>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 relative z-10">
        <div className="w-full max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
            Empowering Learners, Teachers, and Parents<br />
            <span className="text-primary-200">with CBC Impact Platform</span>
          </h1>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto drop-shadow">
            A modern platform to showcase achievements, foster reflection, and guide future pathways in the Competency-Based Curriculum.
          </p>
          <button
            onClick={() => setShowLogin(true)}
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow hover:bg-primary-700 transition mb-8"
          >
            Get Started
          </button>
        </div>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full mb-16">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-primary-700 mb-2">Showcase Achievements</h2>
            <p className="text-gray-600">Document projects, skills, and milestones. Build a portfolio that grows with you.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-primary-700 mb-2">Reflect & Grow</h2>
            <p className="text-gray-600">Encourage self-reflection and feedback to support continuous learning and improvement.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-primary-700 mb-2">Plan Your Future</h2>
            <p className="text-gray-600">Access career guidance and resources tailored to your interests and strengths.</p>
          </div>
        </section>
      </main>
      <footer className="bg-gray-200/80 text-center p-4 text-sm text-gray-700 relative z-10">
        &copy; {new Date().getFullYear()} {APP_NAME}. Empowering CBC.
      </footer>
      {showLogin && <LoginModal />}
    </div>
  );
};

const App: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // Show landing page for unauthenticated users
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-0 sm:px-4 py-4 sm:py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {/* Role-based routes */}
          {/* Learner: own profile/projects, Parent: child's, Teacher: all */}
          <Route
            path="/profile"
            element={
              currentUser.role === UserRole.PARENT
                ? <LearnerProfile childId={currentUser.childId} />
                : currentUser.role === UserRole.TEACHER
                ? <LearnerProfile showAll={true} />
                : <LearnerProfile />
            }
          />
          <Route
            path="/projects"
            element={
              currentUser.role === UserRole.PARENT
                ? <ProjectSection childId={currentUser.childId} />
                : currentUser.role === UserRole.TEACHER
                ? <ProjectSection showAll={true} />
                : <ProjectSection />
            }
          />
          <Route path="/reflections" element={<ReflectionSection />} />
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
