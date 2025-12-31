"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2, PanelLeftClose, Check, DollarSign, Palette, Ruler, Sparkles } from "lucide-react"
import type { Message, ThinkingStep, Filters, FilterPrompt } from "./fashion-agent"
import { Slider } from "@/components/ui/slider"

type ChatPanelProps = {
  messages: Message[]
  onSendMessage: (content: string) => void
  isLoading: boolean
  thinkingSteps: ThinkingStep[]
  onClose: () => void
  filters: Filters
  onFilterChange: (filters: Partial<Filters>) => void
  onResetFilters: () => void
  onNextFilter: () => void
  hasProducts: boolean
  availableBrands: string[]
  availableCategories: string[]
  filterResponses: string[]
  setFilterResponses: React.Dispatch<React.SetStateAction<string[]>>
}

export default function ChatPanel({
  messages,
  onSendMessage,
  isLoading,
  thinkingSteps,
  onClose,
  filters,
  onFilterChange,
  onNextFilter,
  filterResponses,
  setFilterResponses,
}: ChatPanelProps) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, thinkingSteps, filterResponses])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim())
      setInput("")
      setFilterResponses([])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const addFilterResponse = (response: string) => {
    setFilterResponses((prev) => [...prev, response])
  }

  const handlePriceSelect = (range: [number, number]) => {
    onFilterChange({ priceRange: range })
    const priceResponse = generatePriceResponse(range)
    addFilterResponse(priceResponse)
    setTimeout(() => onNextFilter(), 800)
  }

  const toggleColor = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color]
    onFilterChange({ colors: newColors })
    if (!filters.colors.includes(color)) {
      const colorResponse = generateColorResponse(color)
      addFilterResponse(colorResponse)
    }
    setTimeout(() => onNextFilter(), 800)
  }

  const toggleSize = (size: string) => {
    const newSizes = filters.sizes.includes(size) ? filters.sizes.filter((s) => s !== size) : [...filters.sizes, size]
    onFilterChange({ sizes: newSizes })
    if (!filters.sizes.includes(size)) {
      const sizeResponse = generateSizeResponse(size)
      addFilterResponse(sizeResponse)
    }
    setTimeout(() => onNextFilter(), 800)
  }

  const suggestions = [
    "Show me elegant dresses for a wedding",
    "I need comfortable everyday outfits",
    "Help me build a work wardrobe",
    "Find me statement accessories",
  ]

  return (
    <div className="w-full border-r border-border flex flex-col bg-background h-full">
      <div className="flex items-center justify-between px-6 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Fashion Style Assistant</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id}>
              <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>

              {message.role === "assistant" && filterResponses.length > 0 && (
                <div className="mt-4 space-y-3">
                  {filterResponses.map((response, index) => (
                    <div
                      key={index}
                      className="flex justify-start animate-in fade-in slide-in-from-left-4 duration-500"
                    >
                      <div className="bg-accent/50 rounded-2xl px-4 py-2 max-w-[85%] flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 mt-0.5 text-primary flex-shrink-0" />
                        <p className="text-sm text-foreground">{response}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {message.role === "assistant" && message.filterPrompts && (
                <div className="mt-4 space-y-4 ml-2">
                  {message.filterPrompts.map((prompt, index) => (
                    <FilterPromptComponent
                      key={index}
                      prompt={prompt}
                      filters={filters}
                      onPriceSelect={handlePriceSelect}
                      onColorToggle={toggleColor}
                      onSizeToggle={toggleSize}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {thinkingSteps.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl px-4 py-3 max-w-[85%]">
                <div className="space-y-2">
                  {thinkingSteps.map((step) => (
                    <div key={step.id} className="flex items-start gap-2 text-sm">
                      {step.status === "thinking" ? (
                        <Loader2 className="w-4 h-4 mt-0.5 animate-spin flex-shrink-0 text-primary" />
                      ) : (
                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                      )}
                      <span className={step.status === "complete" ? "text-muted-foreground" : "text-foreground"}>
                        {step.step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isLoading && thinkingSteps.length === 0 && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}

          {messages.length === 1 && (
            <div className="space-y-3 mt-8">
              <p className="text-xs text-muted-foreground font-medium">SUGGESTIONS</p>
              <div className="grid gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => onSendMessage(suggestion)}
                    className="text-left text-sm p-3 rounded-xl bg-secondary hover:bg-accent transition-colors"
                    disabled={isLoading}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-border p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your style or what you're looking for..."
            className="min-h-[48px] max-h-[120px] resize-none"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="h-12 w-12 shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

function generatePriceResponse(range: [number, number]): string {
  if (range[1] <= 100) {
    return "Perfect! I'm focusing on budget-friendly pieces under $100. These options offer great value without compromising on style."
  } else if (range[0] >= 300) {
    return "Excellent choice! I'm curating premium pieces in your price range. These items feature exceptional quality and craftsmanship."
  } else {
    return `Great! I've adjusted the selection to show pieces between $${range[0]}-$${range[1]}. This range offers a perfect balance of quality and value.`
  }
}

function generateColorResponse(color: string): string {
  const colorResponses: Record<string, string> = {
    Black: "Classic choice! Black is timeless, versatile, and effortlessly sophisticated.",
    Navy: "Navy is elegant and professional - a wardrobe essential that pairs beautifully with everything.",
    White: "White pieces add freshness and elegance. Perfect for creating crisp, polished looks.",
    Beige: "Beige tones are wonderfully neutral and create soft, sophisticated outfits.",
    Gray: "Gray is understated yet refined - ideal for building a versatile wardrobe.",
    Red: "Bold and confident! Red makes a powerful statement and adds energy to any look.",
    Pink: "Pink brings a feminine, romantic touch. It's both playful and elegant.",
    Blue: "Blue is calming and universally flattering. A great choice for any occasion.",
    Green: "Green adds a fresh, natural element. It's unique yet surprisingly versatile.",
  }
  return colorResponses[color] || `I love ${color}! I'm filtering to show pieces in this beautiful color.`
}

function generateSizeResponse(size: string): string {
  return `Filtering for size ${size}. All pieces shown will be available in your selected size for a perfect fit.`
}

function FilterPromptComponent({
  prompt,
  filters,
  onPriceSelect,
  onColorToggle,
  onSizeToggle,
}: {
  prompt: FilterPrompt
  filters: Filters
  onPriceSelect: (range: [number, number]) => void
  onColorToggle: (color: string) => void
  onSizeToggle: (size: string) => void
}) {
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>([0, 1000])

  if (prompt.type === "price") {
    return (
      <div className="space-y-3 bg-secondary/50 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          <p className="text-sm font-medium">{prompt.label}</p>
        </div>
        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => onPriceSelect([0, 100])}
              className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-colors ${filters.priceRange[0] === 0 && filters.priceRange[1] === 100
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border hover:border-primary"
                }`}
            >
              Under $100
            </button>
            <button
              onClick={() => onPriceSelect([100, 300])}
              className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-colors ${filters.priceRange[0] === 100 && filters.priceRange[1] === 300
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border hover:border-primary"
                }`}
            >
              $100-$300
            </button>
            <button
              onClick={() => onPriceSelect([300, 600])}
              className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-colors ${filters.priceRange[0] === 300 && filters.priceRange[1] === 600
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border hover:border-primary"
                }`}
            >
              $300-$600
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>${localPriceRange[0]}</span>
              <span>${localPriceRange[1]}</span>
            </div>
            <Slider
              value={localPriceRange}
              onValueChange={(value: number[]) => setLocalPriceRange(value as [number, number])}
              onValueCommit={(value: number[]) => onPriceSelect(value as [number, number])}
              min={0}
              max={1000}
              step={50}
              className="w-full"
            />
          </div>
        </div>
      </div>
    )
  }

  if (prompt.type === "color" && prompt.options) {
    return (
      <div className="space-y-3 bg-secondary/50 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary" />
          <p className="text-sm font-medium">{prompt.label}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {prompt.options.map((color) => (
            <button
              key={color}
              onClick={() => onColorToggle(color)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${filters.colors.includes(color)
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border hover:border-primary"
                }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (prompt.type === "size" && prompt.options) {
    return (
      <div className="space-y-3 bg-secondary/50 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Ruler className="w-4 h-4 text-primary" />
          <p className="text-sm font-medium">{prompt.label}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {prompt.options.map((size) => (
            <button
              key={size}
              onClick={() => onSizeToggle(size)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${filters.sizes.includes(size)
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border hover:border-primary"
                }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return null
}
