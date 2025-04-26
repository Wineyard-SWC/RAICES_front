"use client";

import Navbar from "@/components/NavBar";

export default function TeamPage() {
  return (
    <>
    <Navbar projectSelected={true} />
    <main className="min-h-screen py-10 bg-[#EBE5EB]/30">        
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800">Team</h1>
        <p className="mt-2 text-gray-600">
          Welcome to your Teams! This is a placeholder page.
        </p>
      </div>
      </main>
    </>
  );
}
