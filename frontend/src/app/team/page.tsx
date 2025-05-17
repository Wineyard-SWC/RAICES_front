"use client";

import Navbar from "@/components/NavBar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TeamsView from "./components/teamview";

export default function TeamPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    if (!userId) {
      router.push("/login")
    } else {
      setLoading(false)
    }
  }, [router])

  if (loading) {
    return null
  }

  return (
    <>
      <Navbar projectSelected={true} />
      <TeamsView />
    </>
  )
}
