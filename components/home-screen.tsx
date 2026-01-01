"use client"

import type React from "react"

import { useState } from "react"
import { Sparkles, Send, ShoppingBag, Zap } from "lucide-react"
import { Button } from "./ui/button"
import { ThemeToggle } from "./theme-toggle"

interface HomeScreenProps {
  onStartChat: (query: string) => void
}

export default function HomeScreen({ onStartChat }: HomeScreenProps) {
  const [query, setQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onStartChat(query.trim())
    }
  }

  const suggestionPrompts = [
    "Show me elegant dresses for a wedding",
    "I need casual summer outfits under $100",
    "Find me professional workwear",
    "Browse trendy evening wear",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-border/40 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Sparkles className="size-4 text-primary" />
          </div>
          <span className="font-semibold text-lg">StyleAI</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="max-w-4xl w-full space-y-12 text-center">
          {/* Heading */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-sm text-primary mb-4">
              <Sparkles className="size-4" />
              <span>AI-Powered Fashion Discovery</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance">
              Your Personal
              <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Fashion Stylist
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              Discover curated fashion pieces tailored to your style. Chat with our AI to find the perfect outfit for
              any occasion.
            </p>
          </div>

          {/* Input Section */}
          <div className="max-w-2xl mx-auto w-full">
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300" />
                <div className="relative flex items-center bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Describe your style or what you're looking for..."
                    className="flex-1 px-6 py-5 bg-transparent text-base placeholder:text-muted-foreground focus:outline-none"
                  />
                  <Button type="submit" disabled={!query.trim()} className="m-2 rounded-xl px-6 h-12">
                    <Send className="size-4" />
                  </Button>
                </div>
              </div>
            </form>

            {/* Suggestion Prompts */}
            <div className="mt-6 space-y-3">
              <p className="text-sm text-muted-foreground">Try asking:</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {suggestionPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => onStartChat(prompt)}
                    className="group px-4 py-3 text-left text-sm bg-card hover:bg-accent/5 border border-border hover:border-primary/30 rounded-xl transition-all duration-200"
                  >
                    <span className="text-foreground/80 group-hover:text-foreground">{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto pt-12">
            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card/50 border border-border/50">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="size-6 text-primary" />
              </div>
              <h3 className="font-semibold">AI-Powered</h3>
              <p className="text-sm text-muted-foreground text-center">
                Smart recommendations based on your preferences
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card/50 border border-border/50">
              <div className="size-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <ShoppingBag className="size-6 text-accent" />
              </div>
              <h3 className="font-semibold">Curated Selection</h3>
              <p className="text-sm text-muted-foreground text-center">Hand-picked pieces from top fashion retailers</p>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card/50 border border-border/50">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="size-6 text-primary" />
              </div>
              <h3 className="font-semibold">Instant Results</h3>
              <p className="text-sm text-muted-foreground text-center">Get personalized suggestions in seconds</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full px-6 py-6 border-t border-border/40 text-center text-sm text-muted-foreground">
        <p>Powered by AI • Curated with style</p>
      </footer>
    </div>
  )
}
