"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingBag, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react"
import type { Product } from "./fashion-agent"

type ProductsPanelProps = {
  products: Product[]
  onOpenCart: () => void
  cartItemCount: number
  isChatOpen: boolean
  onOpenChat: () => void
  onProductClick: (product: Product) => void
  onAddToCart: (product: Product, size?: string, color?: string) => void
  ecommerceMode: string
}

export default function ProductsPanel({
  products,
  onOpenCart,
  cartItemCount,
  isChatOpen,
  onOpenChat,
  onProductClick,
  onAddToCart,
  ecommerceMode,
}: ProductsPanelProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  const totalPages = Math.ceil(products.length / itemsPerPage)

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = products.slice(startIndex, endIndex)

  if (products.length > 0 && currentPage > totalPages) {
    setCurrentPage(1)
  }

  if (products.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        {!isChatOpen && (
          <Button onClick={onOpenChat} size="lg" className="fixed left-4 top-4 z-10 gap-2">
            <MessageSquare className="w-5 h-5" />
            Open Chat
          </Button>
        )}

        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your Style Awaits</h2>
          <p className="text-muted-foreground leading-relaxed">
            Tell me about your style preferences, and I'll curate a personalized collection just for you.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background relative">
      {!isChatOpen && (
        <Button onClick={onOpenChat} size="lg" className="fixed left-4 top-4 z-10 gap-2">
          <MessageSquare className="w-5 h-5" />
          Open Chat
        </Button>
      )}

      {ecommerceMode === "full" && (
        <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border z-10 px-8 py-4">
          <div className="flex items-center justify-end">
            <Button onClick={onOpenCart} variant="outline" size="sm" className="gap-2 bg-transparent">
              <ShoppingBag className="w-4 h-4" />
              Cart {cartItemCount > 0 && `(${cartItemCount})`}
            </Button>
          </div>
        </div>
      )}

      <div className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-1">Curated for You</h2>
            <p className="text-muted-foreground">
              {products.length} {products.length === 1 ? "item" : "items"} selected
            </p>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-9 w-9"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-9 w-9"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentProducts.map((product) => (
            <Card key={product.id} className="group overflow-hidden border-border py-0 gap-0">
              <div
                className="relative aspect-[3/4] overflow-hidden bg-muted cursor-pointer"
                onClick={() => onProductClick(product)}
              >
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                  onClick={(e) => {
                    e.stopPropagation()
                    // Add to wishlist functionality
                  }}
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                    <h3 className="font-medium text-sm truncate">{product.name}</h3>
                  </div>
                  <p className="font-semibold text-sm whitespace-nowrap">${product.price}</p>
                </div>

                {ecommerceMode === "full" && (
                  <Button className="w-full mt-3" size="sm" onClick={() => onAddToCart(product)}>
                    Add to Bag
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
