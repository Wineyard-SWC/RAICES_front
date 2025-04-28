"use client";

import Navbar from "@/components/NavBar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TeamPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800">Team</h1>
        <p className="mt-2 text-gray-600">
          Welcome to your Teams! This is a placeholder page.
        </p>
      </main>
    </>
  );
}
