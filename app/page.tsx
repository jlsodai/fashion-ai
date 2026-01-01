"use client"

import { useState } from "react"
import FashionAgent from "@/components/fashion-agent"
import HomeScreen from "@/components/home-screen"

export default function Home() {
  const [showChat, setShowChat] = useState(false)
  const [initialQuery, setInitialQuery] = useState("")

  const handleStartChat = (query: string) => {
    setInitialQuery(query)
    setShowChat(true)
  }

  if (showChat) {
    return <FashionAgent initialQuery={initialQuery} />
  }

  return <HomeScreen onStartChat={handleStartChat} />
}
