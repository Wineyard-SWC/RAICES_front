"use client";

/*
 * TEAM DETAILS PAGE
 * 
 * This is a dynamic route page that displays details for a specific team.
 * The [id] in the folder structure captures the team ID from the URL.
 * 
 * API INTEGRATION NOTES:
 * - This page expects an API endpoint like: GET /api/teams/:id
 * - The endpoint should return team details including:
 *   - Basic team info (name, description)
 *   - Team members list
 *   - Team performance metrics (velocity, tasks completion, etc.)
 * - Authentication is handled via userId in localStorage
 */

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/NavBar";
import TeamDetailsView from "../components/teamdetailsview";

export default function TeamDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { data: session, status } = useSession()
  const { id } = use(params);

  // Verificar si el usuario está autenticado usando NextAuth
  useEffect(() => {
    // If session is still loading, don't do anything yet
    if (status === "loading") return

    // If no session (not authenticated), redirect to login
    if (!session) {
      router.push("/login")
      return
    }
    
    // If we have a session, update userId in your context if needed
    if (session.user?.uid) {
      // If you still need userId in localStorage for backward compatibility
      // This can be removed once all components use session instead
      if (!localStorage.getItem("userId")) {
        localStorage.setItem("userId", session.user.uid)
      }
    }
    
    // User is authenticated, stop loading
    setLoading(false)
  }, [session, status, router])

  // Show loading state while checking session
  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-[#ebe5eb]/30 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#4a2b4a] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <>
      <Navbar projectSelected={true} />
      <TeamDetailsView teamId={id} />
    </>
  );
}