"use client";
// contexts/AppContext.tsx
import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { AppState } from '@/types/appState/appState';
import { AppAction } from '@/types/appState/appActions';
import { appReducer } from '@/reducers/appReducer/appReducer';
import { initialState } from "@/types/appState/appState";
import { useEffect, useState } from 'react';
import { endpoints } from '@/types/appState/appActions';

interface AppContextType {
    state: AppState;
    dispatch: React.Dispatch<AppAction>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const [state, dispatch] = useReducer(appReducer, initialState);
    
    useEffect(() => {
        const pid = state.activeProject;
        if (!pid || !state.projects[pid]) return;

        const abortControllers: AbortController[] = [];


       (Object.entries(endpoints) as
        [keyof typeof endpoints, (pid: string) => string][])
        .forEach(([resource, getUrl]) => {
            const project = state.projects[pid] || { loaded: {} as any };
            if (project.loaded[resource as keyof typeof endpoints]) return;

            const controller = new AbortController();
            abortControllers.push(controller);

            // incrementa contador de cargas
            dispatch({ type: 'INCREMENT_LOADING' });
            fetch(`${API_URL}${getUrl(pid)}`)
            .then(res => res.json())
            .then((data) =>
                dispatch({
                type: 'SET_RESOURCE',
                payload: { projectId: pid, resource: resource, data }
                })
            )
            .catch(err => {
                dispatch({
                    type: 'SET_ERROR',
                    payload: { resource, message: `No se pudieron cargar ${resource}` }
                });
            })
            .finally(() =>
                dispatch({ type: 'DECREMENT_LOADING' })
            );
        });
        
        return () => {
            abortControllers.forEach(c => c.abort());
        };
        }, [state.activeProject, state.projects]);



    return (
     <AppContext.Provider value={{ 
        state,
        dispatch
    }}>
        {children}
     </AppContext.Provider>
    );
};

export const useApp = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp debe usarse dentro de AppProvider');
    }
    return context;
};