
import React, { useState, useEffect, useCallback } from 'react';
import { Project, Learner, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/mockDb';
import { Card } from './common/Card';
import { Input } from './common/Input';
import { TextArea } from './common/TextArea';
import { Button } from './common/Button';
import { LoadingSpinner } from './common/LoadingSpinner';
import { PlusCircleIcon, PencilIcon, TrashIcon, AcademicCapIcon } from './icons';

export const ProjectSection: React.FC = () => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentLearner, setCurrentLearner] = useState<Learner | null>(null);
  const [allLearners, setAllLearners] = useState<Learner[]>([]);
  const [selectedLearnerForTeacher, setSelectedLearnerForTeacher] = useState<Learner | null>(null);

  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async (learnerId: string) => {
    setIsLoading(true);
    try {
      const fetchedProjects = await db.getProjectsByLearnerId(learnerId);
      setProjects(fetchedProjects.sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()));
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const determineLearnerContext = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);

    if (currentUser.role === UserRole.TEACHER) {
        const learnersList = await db.getLearners();
        setAllLearners(learnersList);
        if (selectedLearnerForTeacher) {
            setCurrentLearner(selectedLearnerForTeacher);
            await fetchProjects(selectedLearnerForTeacher.id);
        } else {
             setProjects([]); // Clear projects if no learner selected
        }
    } else {
        const learnerIdToFetch = currentUser.role === UserRole.LEARNER ? currentUser.id : currentUser.childId;
        if (learnerIdToFetch) {
            const learner = await db.getLearnerById(learnerIdToFetch);
            setCurrentLearner(learner || null);
            if(learner) await fetchProjects(learner.id); else setProjects([]);
        } else {
            setError("Learner context not found.");
            setProjects([]);
        }
    }
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, selectedLearnerForTeacher, fetchProjects]);


  useEffect(() => {
    determineLearnerContext();
  }, [determineLearnerContext]);

  const handleAddProject = () => {
    if(!currentLearner && currentUser?.role !== UserRole.LEARNER) {
        setError("Please select a learner first or ensure learner profile exists.");
        return;
    }
    setEditingProject({ learnerId: currentLearner?.id || currentUser?.id, title: '', description: '', uploadDate: new Date().toISOString() });
    setIsFormOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject({...project});
    setIsFormOpen(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    setIsLoading(true);
    try {
        await db.deleteProject(projectId);
        if (currentLearner) {
            await fetchProjects(currentLearner.id);
        } else if (currentUser?.role === UserRole.LEARNER) {
            await fetchProjects(currentUser.id);
        }
    } catch (err) {
        console.error("Error deleting project:", err);
        setError("Failed to delete project.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingProject) return;
    setEditingProject({ ...editingProject, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || (!editingProject.learnerId && !currentLearner)) return;
    
    const learnerIdForProject = editingProject.learnerId || currentLearner?.id;
    if(!learnerIdForProject) {
        setError("Learner ID is missing for the project.");
        return;
    }

    setIsLoading(true);
    try {
      if (editingProject.id) { // Update
        await db.updateProject(editingProject as Project);
      } else { // Create
        await db.addProject({
          ...editingProject,
          learnerId: learnerIdForProject,
          title: editingProject.title || "Untitled Project",
          description: editingProject.description || "",
          uploadDate: new Date().toISOString()
        } as Omit<Project, 'id'>);
      }
      setIsFormOpen(false);
      setEditingProject(null);
      await fetchProjects(learnerIdForProject);
    } catch (err) {
      console.error("Error saving project:", err);
      setError("Failed to save project.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const canManageProjects = currentUser?.role === UserRole.LEARNER; // Only learners can add/edit their projects

  if (!currentUser) return <LoadingSpinner />;

  if (currentUser.role === UserRole.TEACHER && !selectedLearnerForTeacher) {
    return (
      <div className="p-4 sm:p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Select a Learner to View Projects</h2>
        {isLoading && <LoadingSpinner />}
        {error && <p className="text-red-500">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allLearners.map(learner => (
            <Button key={learner.id} onClick={() => setSelectedLearnerForTeacher(learner)} variant="ghost">
              {learner.name}
            </Button>
          ))}
        </div>
         {allLearners.length === 0 && !isLoading && <p>No learners found.</p>}
      </div>
    );
  }


  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
            <AcademicCapIcon className="w-7 h-7 mr-2 text-primary-600"/> 
            {currentLearner ? `${currentLearner.name}'s Projects` : 'My Projects'}
        </h2>
        {canManageProjects && (
          <Button onClick={handleAddProject} leftIcon={<PlusCircleIcon className="w-5 h-5"/>}>
            Add Project
          </Button>
        )}
         {currentUser?.role === UserRole.TEACHER && (
            <Button onClick={() => setSelectedLearnerForTeacher(null)} variant="ghost">View Other Learners</Button>
        )}
      </div>

      {isLoading && <LoadingSpinner text="Loading projects..." />}
      {error && <p className="text-red-500 p-4 bg-red-100 rounded-md">{error}</p>}

      {!isLoading && !error && projects.length === 0 && (
        <div className="text-center py-10">
          <AcademicCapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
          <p className="text-gray-500">No projects uploaded yet.</p>
          {canManageProjects && <p className="text-gray-500 mt-2">Click "Add Project" to get started!</p>}
        </div>
      )}

      {!isLoading && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} title={project.title} className="flex flex-col justify-between">
              <div>
                {project.fileUrl && <img src={project.fileUrl} alt={project.title} className="w-full h-40 object-cover mb-3 rounded"/>}
                <p className="text-gray-600 text-sm mb-2 break-words">{project.description}</p>
                <p className="text-xs text-gray-400">Uploaded: {new Date(project.uploadDate).toLocaleDateString()}</p>
              </div>
              {canManageProjects && project.learnerId === currentUser?.id && (
                <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end space-x-2">
                  <Button onClick={() => handleEditProject(project)} variant="ghost" size="sm" leftIcon={<PencilIcon className="w-4 h-4"/>}>Edit</Button>
                  <Button onClick={() => handleDeleteProject(project.id)} variant="danger" size="sm" leftIcon={<TrashIcon className="w-4 h-4"/>}>Delete</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {isFormOpen && editingProject && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <Card title={editingProject.id ? "Edit Project" : "Add New Project"} className="w-full max-w-lg">
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <Input label="Project Title" name="title" value={editingProject.title || ''} onChange={handleFormChange} required />
              <TextArea label="Description" name="description" value={editingProject.description || ''} onChange={handleFormChange} required />
              <Input label="File URL (Optional)" name="fileUrl" placeholder="https://example.com/image.png" value={editingProject.fileUrl || ''} onChange={handleFormChange} />
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="ghost" onClick={() => {setIsFormOpen(false); setEditingProject(null);}}>Cancel</Button>
                <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save Project"}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
    