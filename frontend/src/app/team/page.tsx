"use client";

import Navbar from "@/components/NavBar";

export default function TeamPage() {
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
