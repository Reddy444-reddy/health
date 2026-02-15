import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';

const HealthDataContext = createContext();

export const useHealthData = () => useContext(HealthDataContext);

export const HealthDataProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);

    // Current health data from the latest report
    const [currentReport, setCurrentReport] = useState(null);

    // Current diet plan
    const [dietPlan, setDietPlan] = useState(null);

    // Health history (past reports)
    const [healthHistory, setHealthHistory] = useState([]);

    // Load latest health data from Firebase when user logs in
    useEffect(() => {
        if (currentUser) {
            loadLatestHealthData();
        } else {
            // Clear data when user logs out
            setCurrentReport(null);
            setDietPlan(null);
            setHealthHistory([]);
            setLoading(false);
        }
    }, [currentUser]);

    const loadLatestHealthData = async () => {
        try {
            setLoading(true);

            // Load latest report
            const reportsRef = collection(db, 'users', currentUser.uid, 'reports');
            const reportsQuery = query(reportsRef, orderBy('createdAt', 'desc'), limit(1));
            const reportsSnapshot = await getDocs(reportsQuery);

            if (!reportsSnapshot.empty) {
                const latestReport = {
                    id: reportsSnapshot.docs[0].id,
                    ...reportsSnapshot.docs[0].data()
                };
                setCurrentReport(latestReport);
            }

            // Load latest diet plan
            const dietRef = collection(db, 'users', currentUser.uid, 'dietPlans');
            const dietQuery = query(dietRef, orderBy('createdAt', 'desc'), limit(1));
            const dietSnapshot = await getDocs(dietQuery);

            if (!dietSnapshot.empty) {
                const latestDiet = {
                    id: dietSnapshot.docs[0].id,
                    ...dietSnapshot.docs[0].data()
                };
                setDietPlan(latestDiet);
            }

            // Load health history (last 10 reports)
            const historyQuery = query(reportsRef, orderBy('createdAt', 'desc'), limit(10));
            const historySnapshot = await getDocs(historyQuery);
            const history = historySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setHealthHistory(history);

        } catch (error) {
            console.error('Error loading health data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Update current report data (called from Analysis page)
    const updateCurrentReport = async (reportData) => {
        try {
            if (!currentUser) return;

            // Save to Firebase
            const reportsRef = collection(db, 'users', currentUser.uid, 'reports');
            const docRef = await addDoc(reportsRef, {
                ...reportData,
                createdAt: serverTimestamp()
            });

            const newReport = {
                id: docRef.id,
                ...reportData,
                createdAt: new Date()
            };

            // Update local state
            setCurrentReport(newReport);

            // Add to history
            setHealthHistory(prev => [newReport, ...prev]);

            return newReport;
        } catch (error) {
            console.error('Error updating report:', error);
            throw error;
        }
    };

    // Update diet plan (called from Diet page)
    const updateDietPlan = async (planData) => {
        try {
            if (!currentUser) return;

            // Save to Firebase
            const dietRef = collection(db, 'users', currentUser.uid, 'dietPlans');
            const docRef = await addDoc(dietRef, {
                ...planData,
                createdAt: serverTimestamp()
            });

            const newPlan = {
                id: docRef.id,
                ...planData,
                createdAt: new Date()
            };

            // Update local state
            setDietPlan(newPlan);

            return newPlan;
        } catch (error) {
            console.error('Error updating diet plan:', error);
            throw error;
        }
    };

    // Get health conditions from the current report
    const getHealthConditions = () => {
        if (!currentReport || !currentReport.conditions) return [];
        return currentReport.conditions;
    };

    // Get needed medical specializations
    const getNeededSpecializations = () => {
        if (!currentReport || !currentReport.specializations) return [];
        return currentReport.specializations;
    };

    // Get dietary restrictions from report
    const getDietaryRestrictions = () => {
        if (!currentReport || !currentReport.dietaryRestrictions) return [];
        return currentReport.dietaryRestrictions;
    };

    // Clear current report and diet plan
    const clearCurrentReport = async () => {
        try {
            // Clear local state
            setCurrentReport(null);
            setDietPlan(null);

            // Note: We're not deleting from Firebase in case user wants to recover
            // If you want to delete from Firebase, add deletion logic here

            return true;
        } catch (error) {
            console.error('Error clearing report:', error);
            throw error;
        }
    };

    // Check if user has recent health data
    const hasRecentHealthData = () => {
        return currentReport !== null;
    };

    const value = {
        // State
        currentReport,
        dietPlan,
        healthHistory,
        loading,

        // Methods
        updateCurrentReport,
        updateDietPlan,
        clearCurrentReport,
        getHealthConditions,
        getNeededSpecializations,
        getDietaryRestrictions,
        hasRecentHealthData,
        reloadHealthData: loadLatestHealthData
    };

    return (
        <HealthDataContext.Provider value={value}>
            {children}
        </HealthDataContext.Provider>
    );
};
