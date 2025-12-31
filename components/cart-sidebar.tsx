"use client"

import { ShoppingBag, X, Plus, Minus, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { Product } from "./fashion-agent"

type CartItem = {
  product: Product
  quantity: number
  selectedSize?: string
  selectedColor?: string
}

type CartSidebarProps = {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  onUpdateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void
  onRemove: (productId: string, size?: string, color?: string) => void
  onCheckout: () => void
}

export default function CartSidebar({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemove,
  onCheckout,
}: CartSidebarProps) {
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const tax = subtotal * 0.08
  const shipping = subtotal > 100 ? 0 : 10
  const total = subtotal + tax + shipping

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />}

      {/* Cart Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-background shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Your Bag ({cart.length})</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                <ShoppingBag className="w-16 h-16 text-muted-foreground" />
                <p className="text-muted-foreground text-lg">Your bag is empty</p>
                <Button onClick={onClose}>Continue Shopping</Button>
              </div>
            ) : (
              <div className="space-y-6">
                {cart.map((item, index) => (
                  <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${index}`}>
                    <div className="flex gap-4">
                      <div className="w-24 h-32 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={item.product.image || "/placeholder.svg"}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium">{item.product.name}</h3>
                            <p className="text-sm text-muted-foreground">{item.product.brand}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 -mt-1"
                            onClick={() => onRemove(item.product.id, item.selectedSize, item.selectedColor)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                          {item.selectedSize && <span className="ml-3">Size: {item.selectedSize}</span>}
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center border rounded-md">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                onUpdateQuantity(
                                  item.product.id,
                                  item.quantity - 1,
                                  item.selectedSize,
                                  item.selectedColor,
                                )
                              }
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-10 text-center text-sm">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                onUpdateQuantity(
                                  item.product.id,
                                  item.quantity + 1,
                                  item.selectedSize,
                                  item.selectedColor,
                                )
                              }
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                    {index < cart.length - 1 && <Separator className="mt-6" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with totals and checkout */}
          {cart.length > 0 && (
            <div className="border-t p-6 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <Button onClick={onCheckout} className="w-full gap-2" size="lg">
                <CreditCard className="w-5 h-5" />
                Proceed to Checkout
              </Button>
              {subtotal < 100 && (
                <p className="text-xs text-center text-muted-foreground">
                  Add ${(100 - subtotal).toFixed(2)} more for free shipping
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
