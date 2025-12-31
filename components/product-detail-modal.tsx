"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag, Heart, ExternalLink } from "lucide-react"
import type { Product } from "./fashion-agent"

type ProductDetailModalProps = {
  product: Product
  isOpen: boolean
  onClose: () => void
  onAddToCart: (product: Product, size?: string, color?: string) => void
  ecommerceMode: string
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  ecommerceMode,
}: ProductDetailModalProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0])

  const handleAddToCart = () => {
    if (ecommerceMode === "full") {
      onAddToCart(product, selectedSize || undefined, selectedColor)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-12 py-6">
          {/* Product Image */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
            <img src={product.image || "/placeholder.svg"} alt={product.name} className="object-cover w-full h-full" />
          </div>

          {/* Product Details */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">{product.brand}</p>
              <h2 className="text-3xl font-semibold mb-4">${product.price}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || "Discover this stunning piece from our curated collection."}
              </p>
            </div>

            <Separator />

            {/* Color Selection */}
            <div>
              <p className="font-medium mb-3">Color: {selectedColor}</p>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-md border-2 transition-colors ${
                      selectedColor === color ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <p className="font-medium mb-3">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-md border-2 transition-colors ${
                      selectedSize === size ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* E-commerce Mode: Full */}
            {ecommerceMode === "full" ? (
              <>
                <div className="flex gap-3">
                  <Button onClick={handleAddToCart} disabled={!selectedSize} className="flex-1 gap-2" size="lg">
                    <ShoppingBag className="w-5 h-5" />
                    Add to Bag
                  </Button>
                  <Button variant="outline" size="lg" className="w-12 bg-transparent">
                    <Heart className="w-5 h-5" />
                  </Button>
                </div>
                {!selectedSize && (
                  <p className="text-sm text-muted-foreground text-center">Please select a size to add to bag</p>
                )}
              </>
            ) : (
              /* Catalog Mode: Show Retailers */
              <div>
                <p className="font-medium mb-4 text-lg">Available at:</p>
                <div className="space-y-3">
                  {product.retailers?.map((retailer) => (
                    <a
                      key={retailer.name}
                      href={retailer.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-5 rounded-lg border-2 border-border hover:border-primary transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={retailer.logo || "/placeholder.svg"}
                          alt={retailer.name}
                          className="h-10 object-contain"
                        />
                        <span className="font-medium text-lg">{retailer.name}</span>
                      </div>
                      <ExternalLink className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Product Details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{product.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Brand</span>
                <span className="font-medium">{product.brand}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
