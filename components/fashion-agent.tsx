"use client"

import { useState, useRef, useEffect } from "react"
import ChatPanel from "./chat-panel"
import ProductsPanel from "./products-panel"
import ProductDetailModal from "./product-detail-modal"
import CartSidebar from "./cart-sidebar"
import CheckoutModal from "./checkout-modal"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"

export type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  filterPrompts?: FilterPrompt[]
}

export type FilterPrompt = {
  type: "price" | "color" | "size" | "category" | "brand"
  label: string
  options?: string[]
}

export type ThinkingStep = {
  id: string
  step: string
  status: "thinking" | "complete"
}

export type Product = {
  id: string
  name: string
  price: number
  category: string
  image: string
  brand: string
  colors: string[]
  sizes: string[]
  description?: string
  retailers?: Array<{ name: string; logo: string; url: string }>
}

export type Filters = {
  priceRange: [number, number]
  colors: string[]
  sizes: string[]
  categories: string[]
  brands: string[]
}

export default function FashionAgent({ initialQuery }: { initialQuery?: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm your personal fashion stylist. Tell me about your style, occasion, or what you're looking for, and I'll curate the perfect pieces for you.",
    },
  ])

  const [isLoading, setIsLoading] = useState(false)
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([])
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [chatWidth, setChatWidth] = useState(380)
  const [isResizing, setIsResizing] = useState(false)
  const resizeRef = useRef<HTMLDivElement>(null)

  const [filters, setFilters] = useState<Filters>({
    priceRange: [0, 1000],
    colors: [],
    sizes: [],
    categories: [],
    brands: [],
  })

  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [currentFilterStep, setCurrentFilterStep] = useState(0)
  const [filterResponses, setFilterResponses] = useState<string[]>([])
  const [cart, setCart] = useState<
    Array<{ product: Product; quantity: number; selectedSize?: string; selectedColor?: string }>
  >([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const ecommerceMode = process.env.NEXT_PUBLIC_ECOMMERCE_MODE || "full"

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      const newWidth = Math.max(320, Math.min(800, e.clientX))
      setChatWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.style.cursor = "default"
      document.body.style.userSelect = "auto"
    }

    if (isResizing) {
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing])

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSendMessage(initialQuery)
    }
  }, [initialQuery])

  useEffect(() => {
    if (allProducts.length === 0) {
      setFilteredProducts([])
      return
    }

    const filtered = allProducts.filter((product) => {
      // Price filter
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false
      }

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
        return false
      }

      // Brand filter
      if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
        return false
      }

      // Color filter
      if (filters.colors.length > 0) {
        const hasMatchingColor = filters.colors.some((color) => product.colors.includes(color))
        if (!hasMatchingColor) return false
      }

      // Size filter
      if (filters.sizes.length > 0) {
        const hasMatchingSize = filters.sizes.some((size) => product.sizes.includes(size))
        if (!hasMatchingSize) return false
      }

      return true
    })

    setFilteredProducts(filtered)
  }, [filters, allProducts])

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setThinkingSteps([])
    setCurrentFilterStep(0)
    setFilterResponses([])

    const steps = generateThinkingSteps(content)

    // Show thinking steps sequentially
    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 600))
      setThinkingSteps((prev) => [
        ...prev.map((s) => ({ ...s, status: "complete" as const })),
        { id: `step-${i}`, step: steps[i], status: "thinking" as const },
      ])
    }

    // Complete all steps
    await new Promise((resolve) => setTimeout(resolve, 500))
    setThinkingSteps((prev) => prev.map((s) => ({ ...s, status: "complete" as const })))

    // Show final response
    await new Promise((resolve) => setTimeout(resolve, 300))
    const allFilterPrompts = generateFilterPrompts(content)
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: generateResponse(content),
      filterPrompts: allFilterPrompts.length > 0 ? [allFilterPrompts[0]] : undefined,
    }

    setMessages((prev) => [...prev, assistantMessage])
    const generatedProducts = generateProducts(content)
    setAllProducts(generatedProducts)
    setFilteredProducts(generatedProducts)

    setFilters({
      priceRange: [0, 1000],
      colors: [],
      sizes: [],
      categories: [],
      brands: [],
    })

    setIsLoading(false)
    setThinkingSteps([])
  }

  const handleFilterChange = (partialFilters: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...partialFilters }))
  }

  const handleResetFilters = () => {
    setFilters({
      priceRange: [0, 1000],
      colors: [],
      sizes: [],
      categories: [],
      brands: [],
    })
  }

  const handleNextFilter = () => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role !== "assistant") return

    const allFilterPrompts = generateFilterPrompts("")
    const nextStep = currentFilterStep + 1

    if (nextStep < allFilterPrompts.length) {
      setCurrentFilterStep(nextStep)
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          ...lastMessage,
          filterPrompts: [allFilterPrompts[nextStep]],
        }
        return updated
      })
    } else {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          ...lastMessage,
          filterPrompts: undefined,
        }
        return updated
      })
    }
  }

  const addToCart = (product: Product, size?: string, color?: string) => {
    setCart((prev) => {
      const existingItem = prev.find(
        (item) => item.product.id === product.id && item.selectedSize === size && item.selectedColor === color,
      )
      if (existingItem) {
        return prev.map((item) =>
          item.product.id === product.id && item.selectedSize === size && item.selectedColor === color
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }
      return [...prev, { product, quantity: 1, selectedSize: size, selectedColor: color }]
    })
    setIsCartOpen(true)
  }

  const removeFromCart = (productId: string, size?: string, color?: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.selectedSize === size && item.selectedColor === color),
      ),
    )
  }

  const updateCartQuantity = (productId: string, quantity: number, size?: string, color?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color)
      return
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.selectedSize === size && item.selectedColor === color
          ? { ...item, quantity }
          : item,
      ),
    )
  }

  const handleCheckout = () => {
    setIsCartOpen(false)
    setIsCheckoutOpen(true)
  }

  const handleCheckoutComplete = () => {
    setCart([])
    setIsCheckoutOpen(false)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {isChatOpen && (
        <>
          <div style={{ width: `${chatWidth}px` }} className="flex-shrink-0">
            <ChatPanel
              messages={messages}
              isLoading={isLoading}
              thinkingSteps={thinkingSteps}
              onSendMessage={handleSendMessage}
              onClose={() => setIsChatOpen(false)}
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              onNextFilter={handleNextFilter}
              hasProducts={allProducts.length > 0}
              availableBrands={getUniqueBrands(allProducts)}
              availableCategories={getUniqueCategories(allProducts)}
              filterResponses={filterResponses}
              setFilterResponses={setFilterResponses}
            />
          </div>
          <div
            ref={resizeRef}
            className="w-1 bg-border hover:bg-primary/20 cursor-col-resize transition-colors relative group flex-shrink-0"
            onMouseDown={() => setIsResizing(true)}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-1 h-8 bg-primary rounded-full" />
            </div>
          </div>
        </>
      )}

      <ProductsPanel
        products={filteredProducts}
        onOpenCart={() => { }}
        cartItemCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        isChatOpen={isChatOpen}
        onOpenChat={() => setIsChatOpen(true)}
        onProductClick={(product) => {
          setSelectedProduct(product)
          setIsProductModalOpen(true)
        }}
        onAddToCart={addToCart}
        ecommerceMode={ecommerceMode}
      />

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false)
            setSelectedProduct(null)
          }}
          onAddToCart={addToCart}
          ecommerceMode={ecommerceMode}
        />
      )}

      {ecommerceMode === "full" && (
        <div className="fixed top-4 right-4 z-30 flex items-center gap-2">
          <ThemeToggle />
          <Button onClick={() => setIsCartOpen(true)} className="gap-2 shadow-lg" size="lg">
            <ShoppingBag className="w-5 h-5" />
            Cart ({cart.length})
          </Button>
        </div>
      )}

      {ecommerceMode === "full" && (
        <CartSidebar
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateQuantity={updateCartQuantity}
          onRemove={removeFromCart}
          onCheckout={handleCheckout}
        />
      )}

      {ecommerceMode === "full" && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cart={cart}
          onComplete={handleCheckoutComplete}
        />
      )}
    </div>
  )
}

function generateThinkingSteps(userMessage: string): string[] {
  const lower = userMessage.toLowerCase()

  if (lower.includes("dress") || lower.includes("evening") || lower.includes("formal")) {
    return [
      "Analyzing your occasion and style preferences...",
      "Searching our formal wear collection...",
      "Evaluating silhouettes and fabrics for elegance...",
      "Curating the perfect pieces for you...",
    ]
  }

  if (lower.includes("casual") || lower.includes("everyday") || lower.includes("comfortable")) {
    return [
      "Understanding your comfort priorities...",
      "Exploring casual essentials and versatile pieces...",
      "Considering color palettes and fabric textures...",
      "Selecting items that match your lifestyle...",
    ]
  }

  if (lower.includes("work") || lower.includes("office") || lower.includes("professional")) {
    return [
      "Assessing professional style requirements...",
      "Browsing contemporary workwear collections...",
      "Balancing sophistication with comfort...",
      "Building your ideal work wardrobe...",
    ]
  }

  return [
    "Processing your style preferences...",
    "Analyzing current trends and timeless pieces...",
    "Matching items to your aesthetic...",
    "Finalizing your personalized selection...",
  ]
}

function generateResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase()

  if (lower.includes("dress") || lower.includes("evening") || lower.includes("formal")) {
    return "I've curated a selection of elegant dresses perfect for formal occasions. These pieces combine timeless sophistication with modern cuts. Would you like to see more casual options or accessories to complete the look?"
  }

  if (lower.includes("casual") || lower.includes("everyday") || lower.includes("comfortable")) {
    return "Here are some effortlessly chic casual pieces that prioritize comfort without sacrificing style. These versatile items can be mixed and matched for endless outfit possibilities. What's your preferred color palette?"
  }

  if (lower.includes("work") || lower.includes("office") || lower.includes("professional")) {
    return "I've selected polished pieces perfect for the modern workplace. These items strike the perfect balance between professional and stylish. Would you like to explore statement accessories?"
  }

  return "Based on your preferences, I've curated a collection that matches your style. Each piece has been selected for quality, fit, and versatility. Let me know if you'd like to refine the selection or explore different categories!"
}

function generateProducts(userMessage: string): Product[] {
  const lower = userMessage.toLowerCase()

  if (lower.includes("dress") || lower.includes("evening") || lower.includes("formal")) {
    return DRESS_PRODUCTS
  }

  if (lower.includes("casual") || lower.includes("everyday") || lower.includes("comfortable")) {
    return CASUAL_PRODUCTS
  }

  if (lower.includes("work") || lower.includes("office") || lower.includes("professional")) {
    return WORK_PRODUCTS
  }

  // Default - return all products
  return [...DRESS_PRODUCTS, ...CASUAL_PRODUCTS, ...WORK_PRODUCTS].slice(0, 50)
}

const DRESS_PRODUCTS: Product[] = [
  {
    id: "d1",
    name: "Silk Midi Dress",
    price: 395,
    category: "Dresses",
    image: "/elegant-silk-midi-dress.jpg",
    brand: "MAISON",
    colors: ["Navy", "Black"],
    sizes: ["XS", "S", "M", "L"],
    description:
      "Elegant silk midi dress with a flattering silhouette. Perfect for formal occasions and evening events. Features a concealed back zipper and fully lined interior.",
    retailers: [
      { name: "Nordstrom", logo: "/nordstrom-logo.png", url: "#" },
      { name: "Saks Fifth Avenue", logo: "/saks-logo.jpg", url: "#" },
      { name: "Neiman Marcus", logo: "/neiman-marcus-logo.jpg", url: "#" },
    ],
  },
  {
    id: "d2",
    name: "Tailored Evening Gown",
    price: 650,
    category: "Dresses",
    image: "/black-evening-gown.jpg",
    brand: "ATELIER",
    colors: ["Black"],
    sizes: ["S", "M", "L", "XL"],
    description:
      "Sophisticated floor-length gown with impeccable tailoring. Features a structured bodice and flowing skirt that creates a timeless silhouette.",
    retailers: [
      { name: "Bergdorf Goodman", logo: "/bergdorf-logo.jpg", url: "#" },
      { name: "Nordstrom", logo: "/nordstrom-logo.png", url: "#" },
    ],
  },
  {
    id: "d3",
    name: "Wrap Cocktail Dress",
    price: 285,
    category: "Dresses",
    image: "/wrap-cocktail-dress.jpg",
    brand: "MODERNE",
    colors: ["Red", "Navy"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Flattering wrap-style cocktail dress that accentuates your curves. The adjustable tie waist ensures a perfect fit every time.",
    retailers: [
      { name: "Bloomingdale's", logo: "/bloomingdales-logo.jpg", url: "#" },
      { name: "Macy's", logo: "/macys-logo.png", url: "#" },
    ],
  },
  {
    id: "d4",
    name: "Satin Slip Dress",
    price: 425,
    category: "Dresses",
    image: "/satin-slip-dress.jpg",
    brand: "LUXE",
    colors: ["Black", "Navy", "Beige"],
    sizes: ["XS", "S", "M", "L"],
    description:
      "Luxurious satin slip dress with delicate straps. The bias-cut design drapes beautifully and creates an effortlessly elegant look.",
    retailers: [
      { name: "NET-A-PORTER", logo: "/net-a-porter-logo.jpg", url: "#" },
      { name: "Saks Fifth Avenue", logo: "/saks-logo.jpg", url: "#" },
    ],
  },
  {
    id: "d5",
    name: "Floral Maxi Dress",
    price: 340,
    category: "Dresses",
    image: "/floral-maxi-dress.png",
    brand: "BLOOM",
    colors: ["Pink", "Blue"],
    sizes: ["S", "M", "L", "XL"],
    description:
      "Romantic floral maxi dress perfect for garden parties and summer weddings. Features a tiered skirt and adjustable straps.",
    retailers: [
      { name: "Anthropologie", logo: "/anthropologie-logo.jpg", url: "#" },
      { name: "Nordstrom", logo: "/nordstrom-logo.png", url: "#" },
    ],
  },
  {
    id: "d6",
    name: "Velvet Mini Dress",
    price: 295,
    category: "Dresses",
    image: "/velvet-mini-dress-black.jpg",
    brand: "LUXE",
    colors: ["Black", "Green"],
    sizes: ["XS", "S", "M", "L"],
    description:
      "Stunning velvet mini dress with a fitted silhouette. The rich texture and elegant cut make it perfect for cocktail events.",
    retailers: [
      { name: "Revolve", logo: "/revolve-logo.jpg", url: "#" },
      { name: "Bloomingdale's", logo: "/bloomingdales-logo.jpg", url: "#" },
    ],
  },
  {
    id: "d7",
    name: "Lace Evening Dress",
    price: 520,
    category: "Dresses",
    image: "/lace-evening-dress-elegant.jpg",
    brand: "ATELIER",
    colors: ["Black", "Navy"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Exquisite lace evening dress with intricate detailing. The sheer overlay adds a touch of romance while maintaining sophistication.",
    retailers: [
      { name: "Neiman Marcus", logo: "/neiman-marcus-logo.jpg", url: "#" },
      { name: "Saks Fifth Avenue", logo: "/saks-logo.jpg", url: "#" },
    ],
  },
  {
    id: "d8",
    name: "Pleated Midi Dress",
    price: 365,
    category: "Dresses",
    image: "/pleated-midi-dress-elegant.jpg",
    brand: "MODERNE",
    colors: ["Beige", "Navy"],
    sizes: ["S", "M", "L", "XL"],
    description:
      "Graceful pleated midi dress that moves beautifully with every step. The timeless design makes it a versatile addition to your wardrobe.",
    retailers: [
      { name: "Nordstrom", logo: "/nordstrom-logo.png", url: "#" },
      { name: "Bloomingdale's", logo: "/bloomingdales-logo.jpg", url: "#" },
    ],
  },
  {
    id: "d9",
    name: "Off-Shoulder Gown",
    price: 595,
    category: "Dresses",
    image: "/off-shoulder-evening-gown.jpg",
    brand: "ATELIER",
    colors: ["Red", "Black"],
    sizes: ["XS", "S", "M", "L"],
    description:
      "Dramatic off-shoulder evening gown that makes a statement. The structured bodice and flowing skirt create a stunning silhouette.",
    retailers: [
      { name: "Bergdorf Goodman", logo: "/bergdorf-logo.jpg", url: "#" },
      { name: "NET-A-PORTER", logo: "/net-a-porter-logo.jpg", url: "#" },
    ],
  },
  {
    id: "d10",
    name: "Sequin Party Dress",
    price: 450,
    category: "Dresses",
    image: "/sequin-party-dress-sparkly.jpg",
    brand: "LUXE",
    colors: ["Black", "Gold"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Dazzling sequin dress that catches the light from every angle. Perfect for celebrations where you want to shine.",
    retailers: [
      { name: "Revolve", logo: "/revolve-logo.jpg", url: "#" },
      { name: "Nordstrom", logo: "/nordstrom-logo.png", url: "#" },
    ],
  },
  {
    id: "d11",
    name: "Chiffon Wrap Dress",
    price: 315,
    category: "Dresses",
    image: "/chiffon-wrap-dress-flowing.jpg",
    brand: "BLOOM",
    colors: ["Blue", "Pink"],
    sizes: ["S", "M", "L", "XL"],
    description:
      "Ethereal chiffon wrap dress with a flowing silhouette. The lightweight fabric and romantic design make it perfect for warm-weather events.",
    retailers: [
      { name: "Anthropologie", logo: "/anthropologie-logo.jpg", url: "#" },
      { name: "Macy's", logo: "/macys-logo.png", url: "#" },
    ],
  },
  {
    id: "d12",
    name: "Structured Blazer Dress",
    price: 485,
    category: "Dresses",
    image: "/structured-blazer-dress.avif",
    brand: "MODERNE",
    colors: ["Black", "Navy"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Modern blazer-inspired dress that combines professional and party-ready. The tailored fit and button details add sophistication.",
    retailers: [
      { name: "Nordstrom", logo: "/nordstrom-logo.png", url: "#" },
      { name: "Bloomingdale's", logo: "/bloomingdales-logo.jpg", url: "#" },
    ],
  },
  {
    id: "d13",
    name: "Silk Slip Maxi Dress",
    price: 540,
    category: "Dresses",
    image: "/silk-slip-maxi.jpg",
    brand: "LUXE",
    colors: ["Champagne", "Black"],
    sizes: ["XS", "S", "M", "L"],
    description:
      "Luxurious silk slip maxi dress with a bias-cut that drapes beautifully. The minimalist design exudes effortless elegance.",
    retailers: [
      { name: "NET-A-PORTER", logo: "/net-a-porter-logo.jpg", url: "#" },
      { name: "Saks Fifth Avenue", logo: "/saks-logo.jpg", url: "#" },
    ],
  },
  {
    id: "d14",
    name: "Embroidered Cocktail Dress",
    price: 425,
    category: "Dresses",
    image: "/embroidered-cocktail-dress.jpg",
    brand: "ATELIER",
    colors: ["White", "Navy"],
    sizes: ["S", "M", "L", "XL"],
    description:
      "Stunning cocktail dress featuring intricate embroidery. The detailed craftsmanship and fitted silhouette create a show-stopping look.",
    retailers: [
      { name: "Neiman Marcus", logo: "/neiman-marcus-logo.jpg", url: "#" },
      { name: "Bergdorf Goodman", logo: "/bergdorf-logo.jpg", url: "#" },
    ],
  },
  {
    id: "d15",
    name: "Asymmetric Hem Dress",
    price: 355,
    category: "Dresses",
    image: "/asymmetric-hem-dress.jpg",
    brand: "MODERNE",
    colors: ["Black", "Red"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Contemporary dress with an eye-catching asymmetric hem. The modern cut and flowing fabric create dynamic movement.",
    retailers: [
      { name: "Revolve", logo: "/revolve-logo.jpg", url: "#" },
      { name: "Bloomingdale's", logo: "/bloomingdales-logo.jpg", url: "#" },
    ],
  },
]

const CASUAL_PRODUCTS: Product[] = [
  {
    id: "c1",
    name: "Organic Cotton Tee",
    price: 68,
    category: "Tops",
    image: "/minimalist-white-cotton-tshirt.jpg",
    brand: "ESSENTIALS",
    colors: ["White", "Black", "Beige"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    description:
      "Comfortable organic cotton tee with a minimalist design. Perfect for everyday wear and can be dressed up or down.",
    retailers: [
      { name: "H&M", logo: "/placeholder.svg?key=6tj2l", url: "#" },
      { name: "Uniqlo", logo: "/placeholder.svg?key=3jw9p", url: "#" },
    ],
  },
  {
    id: "c2",
    name: "Relaxed Denim",
    price: 195,
    category: "Bottoms",
    image: "/relaxed-fit-denim-jeans.jpg",
    brand: "DENIM CO",
    colors: ["Blue", "Black"],
    sizes: ["S", "M", "L", "XL"],
    description: "Relaxed fit denim jeans with a comfortable stretch. Ideal for casual outings and everyday wear.",
    retailers: [
      { name: "Levi's", logo: "/placeholder.svg?key=5kq8z", url: "#" },
      { name: "Wrangler", logo: "/placeholder.svg?key=7m2p9", url: "#" },
    ],
  },
  {
    id: "c3",
    name: "Cashmere Sweater",
    price: 320,
    category: "Knitwear",
    image: "/beige-cashmere-sweater.jpg",
    brand: "KNIT",
    colors: ["Beige", "Navy", "Gray"],
    sizes: ["S", "M", "L", "XL"],
    description:
      "Soft and luxurious cashmere sweater with a classic fit. Perfect for chilly days and adding a touch of warmth to any outfit.",
    retailers: [
      { name: "J.Crew", logo: "/placeholder.svg?key=4qj9t", url: "#" },
      { name: "Banana Republic", logo: "/placeholder.svg?key=6p2m9", url: "#" },
    ],
  },
  {
    id: "c4",
    name: "Linen Trousers",
    price: 165,
    category: "Bottoms",
    image: "/linen-wide-leg-trousers.jpg",
    brand: "FLOW",
    colors: ["Beige", "White", "Navy"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Comfortable linen trousers with a wide leg design. Perfect for warm weather and adds a casual touch to any outfit.",
    retailers: [
      { name: "Anthropologie", logo: "/neiman-marcus-logo.jpg", url: "#" },
      { name: "Nordstrom", logo: "/saks-logo.jpg", url: "#" },
    ],
  },
  {
    id: "c5",
    name: "Cotton Hoodie",
    price: 125,
    category: "Tops",
    image: "/cotton-hoodie-casual-comfort.jpg",
    brand: "ESSENTIALS",
    colors: ["Gray", "Black", "Navy"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Cozy cotton hoodie with a relaxed fit. Perfect for layering and casual outings.",
    retailers: [
      { name: "Sweaty Betty", logo: "/placeholder.svg?key=7m2p9", url: "#" },
      { name: "Adidas", logo: "/placeholder.svg?key=6tj2l", url: "#" },
    ],
  },
  {
    id: "c6",
    name: "Striped T-Shirt",
    price: 75,
    category: "Tops",
    image: "/striped-tshirt-classic.jpg",
    brand: "BASICS",
    colors: ["Navy", "White"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Classic striped t-shirt with a comfortable fit. Perfect for versatile wear and can be paired with various bottoms.",
    retailers: [
      { name: "Zara", logo: "/placeholder.svg?key=5kq8z", url: "#" },
      { name: "Pull&Bear", logo: "/placeholder.svg?key=4qj9t", url: "#" },
    ],
  },
  {
    id: "c7",
    name: "Jogger Pants",
    price: 145,
    category: "Bottoms",
    image: "/jogger-pants-comfortable.jpg",
    brand: "COMFORT",
    colors: ["Black", "Gray", "Navy"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Comfortable jogger pants with a relaxed fit and stretch. Ideal for casual wear and workouts.",
    retailers: [
      { name: "Gap", logo: "/placeholder.svg?key=6p2m9", url: "#" },
      { name: "Old Navy", logo: "/placeholder.svg?key=7m2p9", url: "#" },
    ],
  },
  {
    id: "c8",
    name: "Denim Jacket",
    price: 225,
    category: "Outerwear",
    image: "/denim-jacket-classic-blue.jpg",
    brand: "DENIM CO",
    colors: ["Blue", "Black"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Classic denim jacket with a timeless design. Perfect for adding a stylish touch to any outfit.",
    retailers: [
      { name: "Levi's", logo: "/placeholder.svg?key=5kq8z", url: "#" },
      { name: "Wrangler", logo: "/placeholder.svg?key=7m2p9", url: "#" },
    ],
  },
  {
    id: "c9",
    name: "Ribbed Tank Top",
    price: 52,
    category: "Tops",
    image: "/ribbed-tank-top-minimal.jpg",
    brand: "BASICS",
    colors: ["White", "Black", "Beige"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Minimalist ribbed tank top with a comfortable fit. Perfect for everyday wear and can be dressed up or down.",
    retailers: [
      { name: "H&M", logo: "/placeholder.svg?key=6tj2l", url: "#" },
      { name: "Uniqlo", logo: "/placeholder.svg?key=3jw9p", url: "#" },
    ],
  },
  {
    id: "c10",
    name: "Cargo Pants",
    price: 185,
    category: "Bottoms",
    image: "/cargo-pants-utility-style.jpg",
    brand: "URBAN",
    colors: ["Beige", "Black", "Green"],
    sizes: ["S", "M", "L", "XL"],
    description: "Utility-style cargo pants with multiple pockets. Perfect for casual wear and outdoor activities.",
    retailers: [
      { name: "Patagonia", logo: "/neiman-marcus-logo.jpg", url: "#" },
      { name: "The North Face", logo: "/saks-logo.jpg", url: "#" },
    ],
  },
  {
    id: "c11",
    name: "Oversized Shirt",
    price: 145,
    category: "Tops",
    image: "/oversized-white-shirt.jpg",
    brand: "ESSENTIALS",
    colors: ["White", "Blue", "Beige"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Oversized shirt with a relaxed fit. Perfect for layering and casual outings.",
    retailers: [
      { name: "Sweaty Betty", logo: "/placeholder.svg?key=7m2p9", url: "#" },
      { name: "Adidas", logo: "/placeholder.svg?key=6tj2l", url: "#" },
    ],
  },
  {
    id: "c12",
    name: "Sweatpants",
    price: 95,
    category: "Bottoms",
    image: "/sweatpants-comfortable-gray.jpg",
    brand: "COMFORT",
    colors: ["Gray", "Black", "Navy"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Comfortable sweatpants with a cozy feel. Perfect for casual wear and workouts.",
    retailers: [
      { name: "Gap", logo: "/placeholder.svg?key=6p2m9", url: "#" },
      { name: "Old Navy", logo: "/placeholder.svg?key=7m2p9", url: "#" },
    ],
  },
  {
    id: "c13",
    name: "Polo Shirt",
    price: 95,
    category: "Tops",
    image: "/polo-shirts.webp",
    brand: "CLASSICS",
    colors: ["Navy", "White", "Black"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Classic polo shirt with a button-down collar. Perfect for both casual and formal wear.",
    retailers: [
      { name: "Nike", logo: "/placeholder.svg?key=5kq8z", url: "#" },
      { name: "Puma", logo: "/placeholder.svg?key=4qj9t", url: "#" },
    ],
  },
  {
    id: "c14",
    name: "Chino Shorts",
    price: 115,
    category: "Bottoms",
    image: "/chino-shorts.jpg",
    brand: "SUMMER",
    colors: ["Beige", "Navy", "White"],
    sizes: ["S", "M", "L", "XL"],
    description: "Comfortable chino shorts with a versatile look. Perfect for casual wear and outdoor activities.",
    retailers: [
      { name: "Patagonia", logo: "/neiman-marcus-logo.jpg", url: "#" },
      { name: "The North Face", logo: "/saks-logo.jpg", url: "#" },
    ],
  },
]

const WORK_PRODUCTS: Product[] = [
  {
    id: "w1",
    name: "Structured Blazer",
    price: 485,
    category: "Outerwear",
    image: "/navy-structured-blazer.jpg",
    brand: "POWER",
    colors: ["Navy", "Black", "Gray"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Sophisticated structured blazer with impeccable tailoring. Perfect for professional settings and adds a touch of elegance.",
    retailers: [
      { name: "Nordstrom", logo: "/nordstrom-logo.png", url: "#" },
      { name: "Bloomingdale's", logo: "/bloomingdales-logo.jpg", url: "#" },
    ],
  },
  {
    id: "w2",
    name: "Classic Trench",
    price: 575,
    category: "Outerwear",
    image: "/beige-trench-coat.png",
    brand: "ICONIC",
    colors: ["Beige", "Black"],
    sizes: ["S", "M", "L", "XL"],
    description: "Timeless classic trench coat with a tailored fit. Perfect for both casual and professional wear.",
    retailers: [
      { name: "Bergdorf Goodman", logo: "/bergdorf-logo.jpg", url: "#" },
      { name: "NET-A-PORTER", logo: "/net-a-porter-logo.jpg", url: "#" },
    ],
  },
  {
    id: "w3",
    name: "Silk Blouse",
    price: 245,
    category: "Tops",
    image: "/silk-blouse.jpg",
    brand: "REFINED",
    colors: ["White", "Beige", "Navy"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Luxurious silk blouse with a fitted silhouette. Perfect for professional settings and adds a touch of elegance.",
    retailers: [
      { name: "NET-A-PORTER", logo: "/net-a-porter-logo.jpg", url: "#" },
      { name: "Saks Fifth Avenue", logo: "/saks-logo.jpg", url: "#" },
    ],
  },
  {
    id: "w4",
    name: "Tailored Trousers",
    price: 295,
    category: "Bottoms",
    image: "/tailored-trousers.jpg",
    brand: "EXECUTIVE",
    colors: ["Black", "Navy", "Gray"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Tailored trousers with a polished fit. Perfect for professional settings and adds a touch of sophistication.",
    retailers: [
      { name: "Bergdorf Goodman", logo: "/bergdorf-logo.jpg", url: "#" },
      { name: "NET-A-PORTER", logo: "/net-a-porter-logo.jpg", url: "#" },
    ],
  },
  {
    id: "w5",
    name: "Pencil Skirt",
    price: 195,
    category: "Bottoms",
    image: "/Pencil-Skirt.avif",
    brand: "POWER",
    colors: ["Black", "Navy", "Gray"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Classic pencil skirt with a fitted silhouette. Perfect for professional settings and adds a touch of sophistication.",
    retailers: [
      { name: "Nordstrom", logo: "/nordstrom-logo.png", url: "#" },
      { name: "Bloomingdale's", logo: "/bloomingdales-logo.jpg", url: "#" },
    ],
  },
  {
    id: "w6",
    name: "Button-Down Shirt",
    price: 165,
    category: "Tops",
    image: "/Button-Down-Shirt.webp",
    brand: "CLASSICS",
    colors: ["White", "Blue", "Pink"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    description:
      "Classic button-down shirt with a tailored fit. Perfect for professional settings and adds a touch of sophistication.",
    retailers: [
      { name: "Uniqlo", logo: "/placeholder.svg?key=3jw9p", url: "#" },
      { name: "H&M", logo: "/placeholder.svg?key=6tj2l", url: "#" },
    ],
  },
  {
    id: "w7",
    name: "Wide-Leg Pants",
    price: 315,
    category: "Bottoms",
    image: "/Wide-Leg-Pants.webp",
    brand: "MODERN",
    colors: ["Beige", "Black", "Navy"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Wide-leg pants with a modern fit. Perfect for both casual and professional wear.",
    retailers: [
      { name: "Patagonia", logo: "/neiman-marcus-logo.jpg", url: "#" },
      { name: "The North Face", logo: "/saks-logo.jpg", url: "#" },
    ],
  },
  {
    id: "w8",
    name: "Knit Cardigan",
    price: 275,
    category: "Knitwear",
    image: "/knit-cardigan.avif",
    brand: "KNIT",
    colors: ["Gray", "Beige", "Navy"],
    sizes: ["S", "M", "L", "XL"],
    description:
      "Sophisticated knit cardigan with a tailored fit. Perfect for professional settings and adds a touch of warmth.",
    retailers: [
      { name: "Banana Republic", logo: "/neiman-marcus-logo.jpg", url: "#" },
      { name: "J.Crew", logo: "/placeholder.svg?key=4qj9t", url: "#" },
    ],
  },
  {
    id: "w9",
    name: "Wool Blazer",
    price: 525,
    category: "Outerwear",
    image: "/wool-blazer.jpg",
    brand: "EXECUTIVE",
    colors: ["Gray", "Black", "Navy"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Luxurious wool blazer with a tailored fit. Perfect for professional settings and adds a touch of sophistication.",
    retailers: [
      { name: "Nordstrom", logo: "/nordstrom-logo.png", url: "#" },
      { name: "Bloomingdale's", logo: "/bloomingdales-logo.jpg", url: "#" },
    ],
  },
  {
    id: "w10",
    name: "A-Line Skirt",
    price: 215,
    category: "Bottoms",
    image: "/A-Line-Skirt.webp",
    brand: "FEMININE",
    colors: ["Navy", "Black", "Gray"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Graceful a-line skirt with a fitted silhouette. Perfect for both casual and professional wear.",
    retailers: [
      { name: "Anthropologie", logo: "/neiman-marcus-logo.jpg", url: "#" },
      { name: "Nordstrom", logo: "/saks-logo.jpg", url: "#" },
    ],
  },
  {
    id: "w11",
    name: "Turtleneck Top",
    price: 145,
    category: "Tops",
    image: "/Turtleneck-Top.avif",
    brand: "ESSENTIALS",
    colors: ["Black", "White", "Gray"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Classic turtleneck top with a tailored fit. Perfect for professional settings and adds a touch of warmth.",
    retailers: [
      { name: "Uniqlo", logo: "/placeholder.svg?key=3jw9p", url: "#" },
      { name: "H&M", logo: "/placeholder.svg?key=6tj2l", url: "#" },
    ],
  },
  {
    id: "w12",
    name: "Pleated Midi Skirt",
    price: 245,
    category: "Bottoms",
    image: "/pleated-midi-skirt.avif",
    brand: "FEMININE",
    colors: ["Black", "Navy", "Beige"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Graceful pleated midi skirt with a fitted silhouette. Perfect for both casual and professional wear.",
    retailers: [
      { name: "Anthropologie", logo: "/neiman-marcus-logo.jpg", url: "#" },
      { name: "Nordstrom", logo: "/saks-logo.jpg", url: "#" },
    ],
  },
  {
    id: "w13",
    name: "Leather Loafers",
    price: 325,
    category: "Shoes",
    image: "/leather-loafers.webp",
    brand: "WALK",
    colors: ["Black", "Tan"],
    sizes: ["S", "M", "L"],
    description: "Stylish leather loafers with a comfortable fit. Perfect for both casual and professional wear.",
    retailers: [
      { name: "Nike", logo: "/placeholder.svg?key=5kq8z", url: "#" },
      { name: "Puma", logo: "/placeholder.svg?key=4qj9t", url: "#" },
    ],
  },
  {
    id: "w14",
    name: "Leather Briefcase",
    price: 495,
    category: "Accessories",
    image: "/Leather-Briefcase.webp",
    brand: "EXECUTIVE",
    colors: ["Tan", "Black"],
    sizes: ["M"],
    description:
      "Stylish leather briefcase with a modern design. Perfect for professional settings and adds a touch of sophistication.",
    retailers: [
      { name: "Nordstrom", logo: "/nordstrom-logo.png", url: "#" },
      { name: "Bloomingdale's", logo: "/bloomingdales-logo.jpg", url: "#" },
    ],
  },
]

function generateFilterPrompts(userMessage: string): FilterPrompt[] {
  return [
    {
      type: "price",
      label: "What's your budget?",
    },
    {
      type: "color",
      label: "Preferred colors?",
      options: ["Black", "White", "Navy", "Beige", "Gray", "Blue", "Red", "Pink", "Green"],
    },
    {
      type: "size",
      label: "Your size?",
      options: ["XS", "S", "M", "L", "XL", "XXL"],
    },
  ]
}

function getUniqueBrands(products: Product[]): string[] {
  return Array.from(new Set(products.map((p) => p.brand)))
}

function getUniqueCategories(products: Product[]): string[] {
  return Array.from(new Set(products.map((p) => p.category)))
}
