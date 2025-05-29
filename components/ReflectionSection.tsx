
import React, { useState, useEffect, useCallback } from 'react';
import { Reflection, Learner, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/mockDb';
import { summarizeReflectionText } from '../services/geminiService';
import { Card } from './common/Card';
import { TextArea } from './common/TextArea';
import { Button } from './common/Button';
import { LoadingSpinner } from './common/LoadingSpinner';
import { PlusCircleIcon, LightBulbIcon } from './icons';

export const ReflectionSection: React.FC = () => {
  const { currentUser } = useAuth();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [currentLearner, setCurrentLearner] = useState<Learner | null>(null);
  const [allLearners, setAllLearners] = useState<Learner[]>([]);
  const [selectedLearnerForTeacher, setSelectedLearnerForTeacher] = useState<Learner | null>(null);
  
  const [newReflectionText, setNewReflectionText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSummarizing, setIsSummarizing] = useState<string | null>(null); // Stores ID of reflection being summarized
  const [error, setError] = useState<string | null>(null);

  const fetchReflections = useCallback(async (learnerId: string) => {
    setIsLoading(true);
    try {
      const fetchedReflections = await db.getReflectionsByLearnerId(learnerId);
      setReflections(fetchedReflections.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (err) {
      console.error("Error fetching reflections:", err);
      setError("Failed to load reflections.");
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
            await fetchReflections(selectedLearnerForTeacher.id);
        } else {
            setReflections([]);
        }
    } else {
        const learnerIdToFetch = currentUser.role === UserRole.LEARNER ? currentUser.id : currentUser.childId;
        if (learnerIdToFetch) {
            const learner = await db.getLearnerById(learnerIdToFetch);
            setCurrentLearner(learner || null);
            if(learner) await fetchReflections(learner.id); else setReflections([]);
        } else {
            setError("Learner context not found.");
            setReflections([]);
        }
    }
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, selectedLearnerForTeacher, fetchReflections]);


  useEffect(() => {
    determineLearnerContext();
  }, [determineLearnerContext]);

  const handleAddReflection = async () => {
    if (!newReflectionText.trim() || (!currentLearner && currentUser?.role !== UserRole.LEARNER)) return;
    
    const learnerIdForReflection = currentLearner?.id || currentUser?.id;
    if(!learnerIdForReflection) {
        setError("Learner ID is missing for the reflection.");
        return;
    }

    setIsLoading(true);
    try {
      await db.addReflection({
        learnerId: learnerIdForReflection,
        text: newReflectionText,
        date: new Date().toISOString(),
      });
      setNewReflectionText('');
      await fetchReflections(learnerIdForReflection);
    } catch (err) {
      console.error("Error adding reflection:", err);
      setError("Failed to add reflection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarize = async (reflection: Reflection) => {
    if (!reflection.text) return;
    setIsSummarizing(reflection.id);
    try {
      const summary = await summarizeReflectionText(reflection.text);
      const updatedReflection = { ...reflection, summary };
      await db.updateReflection(updatedReflection);
      setReflections(prev => prev.map(r => r.id === reflection.id ? updatedReflection : r));
    } catch (err) {
      console.error("Error summarizing reflection:", err);
      setError(`Failed to summarize reflection ID ${reflection.id}.`);
    } finally {
      setIsSummarizing(null);
    }
  };
  
  const canAddReflection = currentUser?.role === UserRole.LEARNER;

  if (!currentUser) return <LoadingSpinner />;

  if (currentUser.role === UserRole.TEACHER && !selectedLearnerForTeacher) {
    return (
      <div className="p-4 sm:p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Select a Learner to View Reflections</h2>
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
          <LightBulbIcon className="w-7 h-7 mr-2 text-yellow-500"/> 
          {currentLearner ? `${currentLearner.name}'s Reflections` : 'My Reflections'}
        </h2>
        {currentUser?.role === UserRole.TEACHER && (
            <Button onClick={() => setSelectedLearnerForTeacher(null)} variant="ghost">View Other Learners</Button>
        )}
      </div>

      {canAddReflection && (
        <Card title="Write a New Reflection" className="mb-8">
          <TextArea
            label="What did you learn? What challenges did you face? What are your thoughts?"
            value={newReflectionText}
            onChange={(e) => setNewReflectionText(e.target.value)}
            placeholder="Start writing your reflection..."
          />
          <Button onClick={handleAddReflection} disabled={isLoading || !newReflectionText.trim()} className="mt-3" leftIcon={<PlusCircleIcon className="w-5 h-5"/>}>
            {isLoading ? 'Adding...' : 'Add Reflection'}
          </Button>
        </Card>
      )}

      {isLoading && <LoadingSpinner text="Loading reflections..." />}
      {error && <p className="text-red-500 p-4 bg-red-100 rounded-md">{error}</p>}

      {!isLoading && !error && reflections.length === 0 && (
         <div className="text-center py-10">
            <LightBulbIcon className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
            <p className="text-gray-500">No reflections found.</p>
            {canAddReflection && <p className="text-gray-500 mt-2">Share your thoughts by adding a new reflection!</p>}
        </div>
      )}

      {!isLoading && reflections.length > 0 && (
        <div className="space-y-6">
          {reflections.map((reflection) => (
            <Card key={reflection.id} title={`Reflection - ${new Date(reflection.date).toLocaleDateString()}`}>
              <p className="text-gray-700 whitespace-pre-wrap mb-4">{reflection.text}</p>
              {reflection.summary && (
                <div className="mt-3 p-3 bg-primary-50 border border-primary-200 rounded-md">
                  <h4 className="text-sm font-semibold text-primary-700">AI Summary:</h4>
                  <p className="text-sm text-primary-600">{reflection.summary}</p>
                </div>
              )}
              {(currentUser?.role === UserRole.LEARNER || currentUser?.role === UserRole.TEACHER) && !reflection.summary && (
                <Button
                  onClick={() => handleSummarize(reflection)}
                  disabled={isSummarizing === reflection.id}
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                >
                  {isSummarizing === reflection.id ? 'Summarizing...' : 'Summarize with AI'}
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
    