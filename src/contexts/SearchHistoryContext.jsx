import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';

const SearchHistoryContext = createContext();

export const useSearchHistory = () => useContext(SearchHistoryContext);

export const SearchHistoryProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [searchHistory, setSearchHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    // Load search history on mount
    useEffect(() => {
        if (currentUser) {
            loadSearchHistory();
        } else {
            setSearchHistory([]);
        }
    }, [currentUser]);

    const loadSearchHistory = async () => {
        if (!currentUser) return;

        try {
            setLoading(true);
            const historyRef = collection(db, 'users', currentUser.uid, 'searchHistory');
            const q = query(historyRef, orderBy('createdAt', 'desc'), limit(50));
            const snapshot = await getDocs(q);

            const history = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date()
            }));

            setSearchHistory(history);
        } catch (error) {
            console.error('Error loading search history:', error);
        } finally {
            setLoading(false);
        }
    };

    const addSearch = async (searchData) => {
        if (!currentUser) return;

        try {
            const historyRef = collection(db, 'users', currentUser.uid, 'searchHistory');
            const newSearch = {
                ...searchData,
                createdAt: serverTimestamp()
            };

            await addDoc(historyRef, newSearch);

            // Add to local state immediately
            setSearchHistory(prev => [{
                ...newSearch,
                createdAt: new Date()
            }, ...prev].slice(0, 50)); // Keep only 50 recent items

        } catch (error) {
            console.error('Error adding search:', error);
        }
    };

    const clearHistory = async () => {
        if (!currentUser) return;

        try {
            const historyRef = collection(db, 'users', currentUser.uid, 'searchHistory');
            const snapshot = await getDocs(historyRef);

            const deletePromises = snapshot.docs.map(document =>
                deleteDoc(doc(db, 'users', currentUser.uid, 'searchHistory', document.id))
            );

            await Promise.all(deletePromises);
            setSearchHistory([]);
        } catch (error) {
            console.error('Error clearing history:', error);
        }
    };

    const deleteSearch = async (searchId) => {
        if (!currentUser) return;

        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'searchHistory', searchId));
            setSearchHistory(prev => prev.filter(item => item.id !== searchId));
        } catch (error) {
            console.error('Error deleting search:', error);
        }
    };

    const getRecentSearches = (page, count = 5) => {
        return searchHistory
            .filter(item => item.page === page)
            .slice(0, count);
    };

    const value = {
        searchHistory,
        loading,
        addSearch,
        clearHistory,
        deleteSearch,
        getRecentSearches,
        loadSearchHistory
    };

    return (
        <SearchHistoryContext.Provider value={value}>
            {children}
        </SearchHistoryContext.Provider>
    );
};
