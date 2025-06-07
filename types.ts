
export enum UserRole {
  LEARNER = 'learner',
  PARENT = 'parent',
  TEACHER = 'teacher',
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  childId?: string; // For parents, linking to their child's learner ID
}

export interface Learner {
  id: string;
  name: string;
  grade: string;
  school: string;
  interests: string[];
  photoUrl?: string; // URL to learner's photo
  parentId?: string; // ID of the parent user
  // Add other CBC-relevant fields as needed, e.g., learning areas, competencies
}

export interface Project {
  id: string;
  learnerId: string;
  title: string;
  description: string;
  fileUrl?: string; // URL to uploaded project file (simulated)
  uploadDate: string; // ISO date string
  // CBC relevant: e.g., core competencies demonstrated
}

export interface Reflection {
  id: string;
  learnerId: string;
  text: string;
  date: string; // ISO date string
  summary?: string; // AI-generated summary
  // CBC relevant: e.g., linked learning outcome
}

export interface CareerSuggestion {
  title: string;
  description: string;
  relatedSubjects: string[];
  reasoning?: string; // Why this is suggested
}

export interface School {
  id: string;
  name: string;
}

// Used for Gemini interaction
export interface TextPart {
  text: string;
}
export interface ImagePart {
 inlineData: {
    mimeType: string;
    data: string; // base64 encoded string
  };
}
    