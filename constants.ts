
import { UserRole, User, Learner, School, Project, Reflection } from './types';

export const APP_NAME = "CBC Impact Platform";

export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash-preview-04-17';
export const GEMINI_IMAGE_MODEL = 'imagen-3.0-generate-002';


export const MOCK_USERS: User[] = [
  { id: 'learner1', username: 'Adhiambo Otieno', role: UserRole.LEARNER },
  { id: 'parent1', username: 'Mr. Kamau', role: UserRole.PARENT, childId: 'learner1' },
  { id: 'teacher1', username: 'Ms. Wanjiku', role: UserRole.TEACHER },
  { id: 'learner2', username: 'John Doe', role: UserRole.LEARNER },
  { id: 'parent2', username: 'Mrs. Doe', role: UserRole.PARENT, childId: 'learner2'},
];

export const MOCK_SCHOOLS: School[] = [
    { id: 'school1', name: 'Sunshine Primary School' },
    { id: 'school2', name: 'Elite Academy Kenya' },
];

export const MOCK_LEARNERS: Learner[] = [
  { 
    id: 'learner1', 
    name: 'Adhiambo Otieno', 
    grade: 'Grade 5', 
    school: 'Sunshine Primary School', 
    interests: ['Science', 'Coding', 'Art'], 
    photoUrl: 'https://picsum.photos/seed/learner1/200/200',
    parentId: 'parent1'
  },
  { 
    id: 'learner2', 
    name: 'John Doe', 
    grade: 'Grade 6', 
    school: 'Elite Academy Kenya', 
    interests: ['Mathematics', 'Robotics', 'Music'], 
    photoUrl: 'https://picsum.photos/seed/learner2/200/200',
    parentId: 'parent2'
  },
];

export const MOCK_PROJECTS: Project[] = [
    {
        id: 'project1',
        learnerId: 'learner1',
        title: 'Recycled Materials Art Installation',
        description: 'Created an art piece using recycled plastic bottles and newspapers to highlight environmental conservation.',
        uploadDate: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
        fileUrl: 'https://picsum.photos/seed/project1/300/200'
    },
    {
        id: 'project2',
        learnerId: 'learner1',
        title: 'Simple Calculator App',
        description: 'Developed a basic calculator using Python that can perform addition, subtraction, multiplication, and division.',
        uploadDate: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    },
    {
        id: 'project3',
        learnerId: 'learner2',
        title: 'Automated Plant Watering System',
        description: 'Built a small-scale automated plant watering system using Arduino and sensors.',
        uploadDate: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
        fileUrl: 'https://picsum.photos/seed/project3/300/200'
    }
];

export const MOCK_REFLECTIONS: Reflection[] = [
    {
        id: 'reflection1',
        learnerId: 'learner1',
        text: "Today's science project on recycled art was challenging but fun. I learned a lot about how waste can be repurposed creatively. It was difficult to get the plastic bottles to stick together at first, but I figured out a new technique. I feel proud of what I made and its message.",
        date: new Date(Date.now() - 86400000 * 4).toISOString(), // 4 days ago
    },
    {
        id: 'reflection2',
        learnerId: 'learner2',
        text: "The Arduino project was complex. Debugging the code for the watering system took a lot of time, but seeing it work was very rewarding. I think I need to improve my understanding of C++ syntax. This project showed me the practical side of programming.",
        date: new Date(Date.now() - 86400000 * 9).toISOString(), // 9 days ago
    }
];
    