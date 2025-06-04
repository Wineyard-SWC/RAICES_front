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

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/NavBar";
import TeamDetailsView from "../components/teamdetailsview";

export default function TeamDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const { id } = use(params);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return null;
  }

  return (
    <>
      <Navbar projectSelected={true} />
      <TeamDetailsView teamId={id} />
    </>
  );
}