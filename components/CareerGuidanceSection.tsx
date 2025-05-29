
import React, { useState, useEffect, useCallback } from 'react';
import { CareerSuggestion, Learner, Project, Reflection, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/mockDb';
import { generateCareerSuggestions } from '../services/geminiService';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { LoadingSpinner } from './common/LoadingSpinner';
import { BriefcaseIcon } from './icons';

export const CareerGuidanceSection: React.FC = () => {
  const { currentUser } = useAuth();
  const [suggestions, setSuggestions] = useState<CareerSuggestion[]>([]);
  const [learner, setLearner] = useState<Learner | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLearnerDataAndGenerateSuggestions = useCallback(async () => {
    if (!currentUser || currentUser.role !== UserRole.LEARNER) {
        setSuggestions([]);
        setError(currentUser ? "Career guidance is available for learners." : "Please log in to view career guidance.");
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetchedLearner = await db.getLearnerById(currentUser.id);
      if (!fetchedLearner) {
        setError("Learner profile not found. Please complete your profile.");
        setSuggestions([]);
        setIsLoading(false);
        return;
      }
      setLearner(fetchedLearner);

      const fetchedProjects = await db.getProjectsByLearnerId(currentUser.id);
      setProjects(fetchedProjects);

      const fetchedReflections = await db.getReflectionsByLearnerId(currentUser.id);
      setReflections(fetchedReflections);
      
      if(fetchedLearner){ // ensure fetchedLearner is not null
        const careerSuggestions = await generateCareerSuggestions(fetchedLearner, fetchedProjects, fetchedReflections);
        setSuggestions(careerSuggestions);
      }

    } catch (err) {
      console.error("Error fetching data or generating suggestions:", err);
      setError("Failed to load career guidance. Please try again.");
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);
  
  useEffect(() => {
    fetchLearnerDataAndGenerateSuggestions();
  }, [fetchLearnerDataAndGenerateSuggestions]);

  if (!currentUser) return <div className="p-6 text-center text-gray-600">Please log in to access career guidance.</div>;
  if (currentUser.role !== UserRole.LEARNER) return <div className="p-6 text-center text-gray-600">Career guidance is available for learners.</div>;


  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
            <BriefcaseIcon className="w-7 h-7 mr-2 text-secondary-600"/>
            Career Pathway Suggestions
        </h2>
        <Button onClick={fetchLearnerDataAndGenerateSuggestions} disabled={isLoading} variant="secondary">
            {isLoading ? 'Refreshing...' : 'Refresh Suggestions'}
        </Button>
      </div>


      {isLoading && <LoadingSpinner text="Generating career suggestions..." />}
      {error && <p className="text-red-500 p-4 bg-red-100 rounded-md">{error}</p>}
      
      {!isLoading && !error && learner && (
          <Card className="mb-6 bg-primary-50 border border-primary-200" title={`Suggestions for ${learner.name}`}>
            <p className="text-sm text-gray-600">Based on your interests: <span className="font-medium">{learner.interests.join(', ')}</span>, your projects, and reflections.</p>
          </Card>
      )}

      {!isLoading && !error && suggestions.length === 0 && !learner && (
         <div className="text-center py-10">
            <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
            <p className="text-gray-500">Please complete your profile, add projects, and write reflections to receive career suggestions.</p>
        </div>
      )}

      {!isLoading && !error && suggestions.length === 0 && learner && (
         <div className="text-center py-10">
            <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
            <p className="text-gray-500">No career suggestions available at the moment. Try refreshing or adding more content to your profile.</p>
        </div>
      )}


      {!isLoading && suggestions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions.map((suggestion, index) => (
            <Card key={index} title={suggestion.title} className="h-full flex flex-col">
              <div className="flex-grow">
                <p className="text-gray-600 text-sm mb-3">{suggestion.description}</p>
                {suggestion.reasoning && <p className="text-xs text-gray-500 italic mb-3">Reasoning: {suggestion.reasoning}</p>}
                <h4 className="text-sm font-semibold text-gray-700 mt-2 mb-1">Related Subjects/Skills:</h4>
                {suggestion.relatedSubjects && suggestion.relatedSubjects.length > 0 ? (
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {suggestion.relatedSubjects.map((subject, i) => (
                      <li key={i}>{subject}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">None specified.</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
    