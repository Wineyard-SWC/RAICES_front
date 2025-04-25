"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/NavBar";
import BacklogCard from "./components/BacklogCard";
import { getProjectUserStories } from "@/utils/getProjectUserStories";
import { UserStory } from "@/types/userstory";

export default function DashboardPage() {
  const [backlogItems, setBacklogItems] = useState<UserStory[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);

  // Recuperar el ID del proyecto desde localStorage
  useEffect(() => {
    const storedProjectId = localStorage.getItem("currentProjectId");
    if (storedProjectId) {
      console.log("Project ID retrieved from localStorage:", storedProjectId); // Print the project ID
      setProjectId(storedProjectId);
    } else {
      console.error("No project ID found in localStorage.");
    }
  }, []);

  // Llamar al endpoint para obtener las historias de usuario
  useEffect(() => {
    if (projectId) {
      async function fetchUserStories() {
        try {
          console.log("Fetching user stories for project ID:", projectId); // Print the project ID before fetching
          const stories = await getProjectUserStories(projectId);
          setBacklogItems(stories);
        } catch (error) {
          console.error("Failed to fetch user stories:", error);
        }
      }

      fetchUserStories();
    }
  }, [projectId]);

  return (
    <>
      <Navbar projectSelected={!!projectId} />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800">Product Backlog</h1>
        <p className="text-gray-600 mt-2">Team wide view of all backlog items and their status</p>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search items under review..."
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-bold text-gray-800">Items Under Review</h2>
          <div className="mt-4">
            {backlogItems.length === 0 ? (
              <p className="text-gray-600">No user stories found for this project.</p>
            ) : (
              backlogItems.map((item) => (
                <BacklogCard
                  key={item.id}
                  type="STORY" // Assuming all are stories; adjust if needed
                  priority={item.priority.toLowerCase()} // Convert to lowercase for styling
                  status="In Review" // Adjust based on your data
                  title={item.title}
                  description={item.description}
                  author="Unknown" // Replace with actual author if available
                  reviewer="Unknown" // Replace with actual reviewer if available
                  progress={0} // Replace with actual progress if available
                  comments={0} // Replace with actual comments count if available
                />
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
}