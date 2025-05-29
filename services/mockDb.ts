
import { Learner, Project, Reflection } from '../types';
import { MOCK_LEARNERS, MOCK_PROJECTS, MOCK_REFLECTIONS } from '../constants';

const LEARNERS_KEY = 'cbc_learners';
const PROJECTS_KEY = 'cbc_projects';
const REFLECTIONS_KEY = 'cbc_reflections';

function initializeData<T,>(key: string, mockData: T[]): T[] {
  const storedData = localStorage.getItem(key);
  if (storedData) {
    return JSON.parse(storedData);
  }
  localStorage.setItem(key, JSON.stringify(mockData));
  return mockData;
}

let learners: Learner[] = initializeData(LEARNERS_KEY, MOCK_LEARNERS);
let projects: Project[] = initializeData(PROJECTS_KEY, MOCK_PROJECTS);
let reflections: Reflection[] = initializeData(REFLECTIONS_KEY, MOCK_REFLECTIONS);

export const db = {
  // Learners
  getLearners: async (): Promise<Learner[]> => learners,
  getLearnerById: async (id: string): Promise<Learner | undefined> => learners.find(l => l.id === id),
  updateLearner: async (updatedLearner: Learner): Promise<Learner> => {
    learners = learners.map(l => l.id === updatedLearner.id ? updatedLearner : l);
    localStorage.setItem(LEARNERS_KEY, JSON.stringify(learners));
    return updatedLearner;
  },
  addLearner: async (newLearner: Omit<Learner, 'id'>): Promise<Learner> => {
    const learnerWithId = { ...newLearner, id: `learner${Date.now()}` };
    learners.push(learnerWithId);
    localStorage.setItem(LEARNERS_KEY, JSON.stringify(learners));
    return learnerWithId;
  },

  // Projects
  getProjectsByLearnerId: async (learnerId: string): Promise<Project[]> => projects.filter(p => p.learnerId === learnerId),
  addProject: async (newProject: Omit<Project, 'id'>): Promise<Project> => {
    const projectWithId = { ...newProject, id: `project${Date.now()}` };
    projects.push(projectWithId);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    return projectWithId;
  },
  updateProject: async (updatedProject: Project): Promise<Project> => {
    projects = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    return updatedProject;
  },
  deleteProject: async (projectId: string): Promise<void> => {
    projects = projects.filter(p => p.id !== projectId);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  },


  // Reflections
  getReflectionsByLearnerId: async (learnerId: string): Promise<Reflection[]> => reflections.filter(r => r.learnerId === learnerId),
  addReflection: async (newReflection: Omit<Reflection, 'id' | 'summary'>): Promise<Reflection> => {
    const reflectionWithId = { ...newReflection, id: `reflection${Date.now()}` };
    reflections.push(reflectionWithId);
    localStorage.setItem(REFLECTIONS_KEY, JSON.stringify(reflections));
    return reflectionWithId;
  },
  updateReflection: async (updatedReflection: Reflection): Promise<Reflection> => {
    reflections = reflections.map(r => r.id === updatedReflection.id ? updatedReflection : r);
    localStorage.setItem(REFLECTIONS_KEY, JSON.stringify(reflections));
    return updatedReflection;
  },
};
    