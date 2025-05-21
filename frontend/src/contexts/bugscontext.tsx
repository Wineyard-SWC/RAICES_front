"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import type { Bug } from "@/types/bug"

const DEFAULT_CACHE_MAX_AGE = 30 * 60 * 1000

type BugsByProjectId = Record<string, {
    bugs: Bug[],
    lastFetched: number
}>

type BugContextType = {
    getBugsForProject: (projectId: string) => Bug[]
    isLoading: (projectId: string) => boolean
    hasError: (projectId: string) => string | null
    setBugsForProject: (projectId: string, bugs: Bug[]) => void
    updateBugsForProject: (projectId: string, updateFn: (bugs: Bug[]) => Bug[]) => void
    addBugToProject: (projectId: string, bug: Bug) => void
    updateBugInProject: (projectId: string, bugId: string, updatedBug: Partial<Bug>) => void
    removeBugFromProject: (projectId: string, bugId: string) => void
    loadBugsIfNeeded: (projectId: string, fetchFunction: (projectId: string) => Promise<Bug[]>, maxAgeMs?: number) => Promise<Bug[]>
    refreshBugs: (projectId: string, fetchFunction: (projectId: string) => Promise<Bug[]>) => Promise<Bug[]>
    clearProjectCache: (projectId: string) => void
    clearAllCache: () => void
}

const BugContext = createContext<BugContextType | undefined>(undefined)

export const BugProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [bugsByProject, setBugsByProject] = useState<BugsByProjectId>({})
    const [loadingState, setLoadingState] = useState<Record<string, boolean>>({})
    const [errorState, setErrorState] = useState<Record<string, string | null>>({})

    const getBugsForProject = useCallback((projectId: string): Bug[] => {
        return bugsByProject[projectId]?.bugs || []
    }, [bugsByProject])

    const isLoading = useCallback((projectId: string): boolean => {
        return !!loadingState[projectId]
    }, [loadingState])

    const hasError = useCallback((projectId: string): string | null => {
        return errorState[projectId] || null
    }, [errorState])

    const setBugsForProject = useCallback((projectId: string, bugs: Bug[]) => {
        setBugsByProject(prev => ({
        ...prev,
        [projectId]: {
            bugs,
            lastFetched: Date.now()
        }
        }))
    }, [])

    const updateBugsForProject = useCallback((projectId: string, updateFn: (bugs: Bug[]) => Bug[]) => {
        setBugsByProject(prev => {
            const currentBugs = prev[projectId]?.bugs || []
            return {
                ...prev,
                [projectId]: {
                bugs: updateFn(currentBugs),
                lastFetched: Date.now()
                }
            }
        })
    }, [])

    const addBugToProject = useCallback((projectId: string, bug: Bug) => {
        setBugsByProject(prev => {
            const currentBugs = prev[projectId]?.bugs || []
            return {
                ...prev,
                [projectId]: {
                bugs: [...currentBugs, bug],
                lastFetched: Date.now()
                }
            }
        })
    }, [])

    const updateBugInProject = useCallback((projectId: string, bugId: string, updatedBug: Partial<Bug>) => {
        setBugsByProject(prev => {
            const currentBugs = prev[projectId]?.bugs || []
            const updatedBugs = currentBugs.map(bug =>
                bug.id === bugId ? { ...bug, ...updatedBug } : bug
            )
            return {
                ...prev,
                [projectId]: {
                bugs: updatedBugs,
                lastFetched: Date.now()
                }
            }
        })
    }, [])

    const removeBugFromProject = useCallback((projectId: string, bugId: string) => {
        setBugsByProject(prev => {
        const currentBugs = prev[projectId]?.bugs || []
        return {
            ...prev,
            [projectId]: {
            bugs: currentBugs.filter(bug => bug.id !== bugId),
            lastFetched: Date.now()
            }
        }
        })
    }, [])

    const loadBugsIfNeeded = useCallback(async (projectId: string, fetchFunction: (projectId: string) => Promise<Bug[]>, maxAgeMs = DEFAULT_CACHE_MAX_AGE): Promise<Bug[]> => {
        const cachedData = bugsByProject[projectId]
        const now = Date.now()
        
        if (cachedData?.bugs.length > 0 && (now - cachedData.lastFetched) < maxAgeMs) {
            return cachedData.bugs
        }

        setLoadingState(prev => ({ ...prev, [projectId]: true }))
        setErrorState(prev => ({ ...prev, [projectId]: null }))

        try 
        {
            const fetchedBugs = await fetchFunction(projectId)
            setBugsByProject(prev => ({
                ...prev,
                [projectId]: {
                bugs: fetchedBugs,
                lastFetched: now
                }
            }))
            return fetchedBugs
        } 
        catch (err) 
        {
            const errorMessage = err instanceof Error ? err.message : 'Error loading bugs'
            setErrorState(prev => ({ ...prev, [projectId]: errorMessage }))
            return cachedData?.bugs || []
        } 
        finally 
        {
            setLoadingState(prev => ({ ...prev, [projectId]: false }))
        }
    }, [bugsByProject])

    const refreshBugs = useCallback(async (projectId: string, fetchFunction: (projectId: string) => Promise<Bug[]>): Promise<Bug[]> => {
        setLoadingState(prev => ({ ...prev, [projectId]: true }))
        setErrorState(prev => ({ ...prev, [projectId]: null }))

        try 
        {
            const fetchedBugs = await fetchFunction(projectId)
            setBugsByProject(prev => ({
                ...prev,
                [projectId]: {
                bugs: fetchedBugs,
                lastFetched: Date.now()
                }
            }))
            return fetchedBugs
        } 
        catch (err) 
        {
            const errorMessage = err instanceof Error ? err.message : 'Error refreshing bugs'
            setErrorState(prev => ({ ...prev, [projectId]: errorMessage }))
            return bugsByProject[projectId]?.bugs || []
        } 
        finally 
        {
            setLoadingState(prev => ({ ...prev, [projectId]: false }))
        }
    }, [bugsByProject])

    const clearProjectCache = useCallback((projectId: string) => {
        setBugsByProject(prev => {
            const newState = { ...prev }
            delete newState[projectId]
            return newState
        })

        setErrorState(prev => {
            const newState = { ...prev }
            delete newState[projectId]
            return newState
        })

        setLoadingState(prev => {
            const newState = { ...prev }
            delete newState[projectId]
            return newState
        })
    }, [])

    const clearAllCache = useCallback(() => {
        setBugsByProject({})
        setErrorState({})
        setLoadingState({})
    }, [])

    return (
        <BugContext.Provider value={{
        getBugsForProject,
        isLoading,
        hasError,
        setBugsForProject,
        updateBugsForProject,
        addBugToProject,
        updateBugInProject,
        removeBugFromProject,
        loadBugsIfNeeded,
        refreshBugs,
        clearProjectCache,
        clearAllCache
        }}>
        {children}
        </BugContext.Provider>
    )
}

export const useBugs = (): BugContextType => {
  const context = useContext(BugContext)
  if (!context) {
    throw new Error("useBugs must be used within a BugProvider")
  }
  return context
}
