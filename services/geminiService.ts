
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Learner, Project, Reflection, CareerSuggestion } from '../types';
import { GEMINI_TEXT_MODEL } from '../constants';

// IMPORTANT: This uses process.env.API_KEY. 
// Ensure this environment variable is set in your execution environment.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not found. Gemini API calls will fail.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY! });


export const summarizeReflectionText = async (reflectionText: string): Promise<string> => {
  if (!API_KEY) return "API Key not configured. Summary unavailable.";
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: `Summarize the following student reflection in 2-3 key points, focusing on their learning, challenges, and insights. The reflection is: "${reflectionText}"`,
        config: {
          temperature: 0.5,
          topK: 32,
          topP: 0.9,
        }
    });
    return response.text;
  } catch (error) {
    console.error("Error summarizing reflection:", error);
    return "Could not summarize reflection due to an error.";
  }
};

export const generateCareerSuggestions = async (learner: Learner, projects: Project[], reflections: Reflection[]): Promise<CareerSuggestion[]> => {
  if (!API_KEY) return [{ title: "Career Guidance Unavailable", description: "API Key not configured.", relatedSubjects: [] }];
  
  const projectTitles = projects.map(p => p.title).join(', ');
  const reflectionSnippets = reflections.slice(0, 3).map(r => r.text.substring(0, 100) + (r.summary ? ` (Summary: ${r.summary.substring(0,50)}... )` : '...')).join('; ');

  const prompt = `
    Based on the following learner profile, projects, and reflections, suggest 3-5 potential career pathways suitable for a student in the Kenyan Competency-Based Curriculum (CBC) system.
    For each pathway, provide a title, a brief description (2-3 sentences), and list 2-3 related subjects or skills.
    Format the response as a JSON array of objects, where each object has "title", "description", and "relatedSubjects" (an array of strings) keys.

    Learner Profile:
    - Name: ${learner.name}
    - Grade: ${learner.grade}
    - Interests: ${learner.interests.join(', ')}

    Projects:
    - ${projectTitles || 'No projects submitted yet.'}

    Reflections (Key Themes/Snippets):
    - ${reflectionSnippets || 'No reflections submitted yet.'}

    Example JSON format:
    [
      {
        "title": "Example Career",
        "description": "An example description for this career path.",
        "relatedSubjects": ["Subject A", "Skill B"]
      }
    ]
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            temperature: 0.7,
        }
    });
    
    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const parsedData = JSON.parse(jsonStr);
    if (Array.isArray(parsedData)) {
        return parsedData as CareerSuggestion[];
    }
    return [{ title: "Error", description: "Could not parse career suggestions.", relatedSubjects: [] }];

  } catch (error) {
    console.error("Error generating career suggestions:", error);
    return [{ title: "Error Generating Suggestions", description: "An error occurred while contacting the AI.", relatedSubjects: [] }];
  }
};
    