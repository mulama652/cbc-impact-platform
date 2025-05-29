
import React, { useState, useEffect, useCallback } from 'react';
import { Learner, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/mockDb';
import { Card } from './common/Card';
import { Input } from './common/Input';
import { Button } from './common/Button';
import { LoadingSpinner } from './common/LoadingSpinner';
import { UserIcon, PencilIcon, PlusCircleIcon } from './icons'; // Assuming icons are correctly pathed

interface LearnerProfileProps {
  learnerId?: string; // If provided, displays/edits this specific learner (for teacher/parent view)
}

export const LearnerProfile: React.FC<LearnerProfileProps> = ({ learnerId: propLearnerId }) => {
  const { currentUser } = useAuth();
  const [learner, setLearner] = useState<Learner | null>(null);
  const [editingLearner, setEditingLearner] = useState<Partial<Learner> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [allLearners, setAllLearners] = useState<Learner[]>([]);
  const [selectedLearnerIdForTeacher, setSelectedLearnerIdForTeacher] = useState<string | null>(propLearnerId || null);

  const fetchLearnerData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    if (!currentUser) return;

    try {
      if (currentUser.role === UserRole.TEACHER) {
        const learnersList = await db.getLearners();
        setAllLearners(learnersList);
        if (selectedLearnerIdForTeacher) {
          const specificLearner = await db.getLearnerById(selectedLearnerIdForTeacher);
          setLearner(specificLearner || null);
        } else if (learnersList.length > 0) {
          // setSelectedLearnerIdForTeacher(learnersList[0].id); // Auto-select first learner
          // setLearner(learnersList[0]);
        }
      } else {
        const currentLearnerId = currentUser.role === UserRole.LEARNER ? currentUser.id : currentUser.childId;
        if (currentLearnerId) {
          const fetchedLearner = await db.getLearnerById(currentLearnerId);
          setLearner(fetchedLearner || null);
        } else {
          setError("Learner ID not found for current user.");
        }
      }
    } catch (err) {
      console.error("Error fetching learner data:", err);
      setError("Failed to load learner data.");
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, selectedLearnerIdForTeacher, propLearnerId]);

  useEffect(() => {
    fetchLearnerData();
  }, [fetchLearnerData]);

  const handleEdit = () => {
    if (learner) {
      setEditingLearner({ ...learner, interests: learner.interests ? [...learner.interests] : [] });
      setIsEditing(true);
    } else if (currentUser?.role === UserRole.TEACHER || currentUser?.role === UserRole.PARENT) {
       // Allow adding a new learner if teacher or parent
       setEditingLearner({ name: '', grade: '', school: '', interests: []});
       setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingLearner(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingLearner) return;
    const { name, value } = e.target;
    if (name === "interests") {
        setEditingLearner({ ...editingLearner, interests: value.split(',').map(s => s.trim()) });
    } else {
        setEditingLearner({ ...editingLearner, [name]: value });
    }
  };

  const handleSave = async () => {
    if (!editingLearner || !currentUser) return;
    setIsLoading(true);
    try {
      let savedLearner;
      if (editingLearner.id) { // Existing learner
        savedLearner = await db.updateLearner(editingLearner as Learner);
      } else { // New learner
        const newLearnerData: Omit<Learner, 'id'> = {
            name: editingLearner.name || 'New Learner',
            grade: editingLearner.grade || 'N/A',
            school: editingLearner.school || 'N/A',
            interests: editingLearner.interests || [],
            photoUrl: editingLearner.photoUrl || `https://picsum.photos/seed/${Date.now()}/200/200`,
            parentId: currentUser.role === UserRole.PARENT ? currentUser.id : undefined,
        };
        savedLearner = await db.addLearner(newLearnerData);
      }
      setLearner(savedLearner);
      setIsEditing(false);
      setEditingLearner(null);
      if(currentUser.role === UserRole.TEACHER) await fetchLearnerData(); // Refresh list for teacher
    } catch (err) {
      console.error("Error saving learner data:", err);
      setError("Failed to save learner data.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const canEdit = currentUser?.role === UserRole.TEACHER || (currentUser?.role === UserRole.PARENT && currentUser.childId === learner?.id) || (currentUser?.role === UserRole.LEARNER && currentUser.id === learner?.id) ;

  if (isLoading && !isEditing) return <LoadingSpinner text="Loading profile..."/>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  const renderLearnerCard = (l: Learner) => (
    <Card key={l.id} title={l.name} className="mb-6" actions={
      currentUser?.role === UserRole.TEACHER && (
        <Button onClick={() => {setSelectedLearnerIdForTeacher(l.id); setLearner(l); setIsEditing(false);}} size="sm" variant="ghost">
          View Details
        </Button>
      )
    }>
      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
        <img src={l.photoUrl || 'https://picsum.photos/200'} alt={l.name} className="w-32 h-32 rounded-full object-cover shadow-md" />
        <div className="text-center sm:text-left">
          <p className="text-gray-600"><span className="font-semibold">Grade:</span> {l.grade}</p>
          <p className="text-gray-600"><span className="font-semibold">School:</span> {l.school}</p>
          <p className="text-gray-600"><span className="font-semibold">Interests:</span> {l.interests?.join(', ') || 'Not specified'}</p>
          {currentUser?.role === UserRole.TEACHER && l.parentId && <p className="text-xs text-gray-500 mt-1">Parent ID: {l.parentId}</p>}
        </div>
      </div>
    </Card>
  );

  if (currentUser?.role === UserRole.TEACHER && !selectedLearnerIdForTeacher && !isEditing) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">All Learners</h2>
          <Button onClick={handleEdit} leftIcon={<PlusCircleIcon className="w-5 h-5"/>}>Add New Learner</Button>
        </div>
        {allLearners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allLearners.map(renderLearnerCard)}
          </div>
        ) : <p>No learners found. Add a new learner to get started.</p>}
      </div>
    );
  }


  return (
    <div className="p-4 sm:p-6">
      {currentUser?.role === UserRole.TEACHER && (
         <Button onClick={() => { setSelectedLearnerIdForTeacher(null); setLearner(null); setIsEditing(false);}} className="mb-4">Back to All Learners</Button>
      )}
      {isEditing && editingLearner ? (
        <Card title={editingLearner.id ? "Edit Profile" : "Add New Learner"} className="max-w-2xl mx-auto">
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
            <Input label="Full Name" name="name" value={editingLearner.name || ''} onChange={handleInputChange} required />
            <Input label="Grade" name="grade" value={editingLearner.grade || ''} onChange={handleInputChange} required />
            <Input label="School" name="school" value={editingLearner.school || ''} onChange={handleInputChange} required />
            <Input label="Interests (comma-separated)" name="interests" value={editingLearner.interests?.join(', ') || ''} onChange={handleInputChange} />
            <Input label="Photo URL" name="photoUrl" value={editingLearner.photoUrl || ''} onChange={handleInputChange} placeholder="e.g., https://picsum.photos/seed/username/200" />
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Profile'}</Button>
            </div>
          </form>
        </Card>
      ) : learner ? (
        <Card title="Learner Profile" className="max-w-2xl mx-auto" actions={canEdit && (
            <Button onClick={handleEdit} variant="ghost" leftIcon={<PencilIcon className="w-4 h-4"/>}>Edit Profile</Button>
        )}>
         {renderLearnerCard(learner)}
        </Card>
      ) : (currentUser?.role !== UserRole.TEACHER && (canEdit || currentUser?.role === UserRole.PARENT)) ? (
         <Card title="Learner Profile" className="max-w-2xl mx-auto text-center">
            <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
            <p className="text-gray-600 mb-4">No profile data found. Please add learner details.</p>
            <Button onClick={handleEdit} leftIcon={<PlusCircleIcon className="w-5 h-5"/>}>
                {currentUser?.role === UserRole.PARENT ? "Add Child's Profile" : "Create Your Profile"}
            </Button>
        </Card>
      ) : (
        <p className="text-center text-gray-500">Select a learner to view their profile.</p>
      )}
    </div>
  );
};
    