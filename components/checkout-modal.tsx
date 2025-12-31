"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Lock, Check, Package, Truck, MapPin } from "lucide-react"
import type { Product } from "./fashion-agent"

type CartItem = {
  product: Product
  quantity: number
  selectedSize?: string
  selectedColor?: string
}

type CheckoutModalProps = {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  onComplete: () => void
}

export default function CheckoutModal({ isOpen, onClose, cart, onComplete }: CheckoutModalProps) {
  const [step, setStep] = useState<"shipping" | "payment" | "processing" | "success">("shipping")
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  })
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    nameOnCard: "",
  })

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const tax = subtotal * 0.08
  const shipping = subtotal > 100 ? 0 : 10
  const total = subtotal + tax + shipping

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("payment")
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("processing")
    // Simulate payment processing
    setTimeout(() => {
      setStep("success")
      setTimeout(() => {
        onComplete()
        onClose()
        // Reset after closing
        setTimeout(() => {
          setStep("shipping")
          setShippingInfo({ firstName: "", lastName: "", email: "", address: "", city: "", state: "", zip: "" })
          setPaymentInfo({ cardNumber: "", expiry: "", cvv: "", nameOnCard: "" })
        }, 300)
      }, 3000)
    }, 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{step === "success" ? "Order Confirmed!" : "Secure Checkout"}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-5 gap-8 py-6">
          {/* Left side - Forms (60%) */}
          <div className="md:col-span-3">
            {/* Shipping Step */}
            {step === "shipping" && (
              <form onSubmit={handleShippingSubmit} className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Shipping Information</h3>
                    <p className="text-sm text-muted-foreground">Where should we send your order?</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      required
                      value={shippingInfo.firstName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      required
                      value={shippingInfo.lastName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={shippingInfo.email}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    required
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                    placeholder="Enter address"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      required
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      required
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                      placeholder="Enter state"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      required
                      value={shippingInfo.zip}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, zip: e.target.value })}
                      placeholder="Enter zip code"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Continue to Payment
                </Button>
              </form>
            )}

            {/* Payment Step */}
            {step === "payment" && (
              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Payment Information</h3>
                    <p className="text-sm text-muted-foreground">Your payment is secure and encrypted</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Lock className="w-4 h-4" />
                  <span>Secure SSL encrypted payment</span>
                </div>

                <div>
                  <Label htmlFor="nameOnCard">Name on Card</Label>
                  <Input
                    id="nameOnCard"
                    required
                    value={paymentInfo.nameOnCard}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, nameOnCard: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    required
                    maxLength={19}
                    value={paymentInfo.cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, "")
                      const formatted = value.match(/.{1,4}/g)?.join(" ") || value
                      setPaymentInfo({ ...paymentInfo, cardNumber: formatted })
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      required
                      maxLength={5}
                      value={paymentInfo.expiry}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, "")
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + "/" + value.slice(2, 4)
                        }
                        setPaymentInfo({ ...paymentInfo, expiry: value })
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      type="password"
                      required
                      maxLength={3}
                      value={paymentInfo.cvv}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value.replace(/\D/g, "") })}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep("shipping")} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" className="flex-1 gap-2" size="lg">
                    <CreditCard className="w-5 h-5" />
                    Place Order ${total.toFixed(2)}
                  </Button>
                </div>
              </form>
            )}

            {/* Processing Step */}
            {step === "processing" && (
              <div className="flex flex-col items-center justify-center py-16 space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <CreditCard className="w-10 h-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Processing your payment...</h3>
                  <p className="text-muted-foreground">Please wait while we securely process your order</p>
                </div>
              </div>
            )}

            {/* Success Step */}
            {step === "success" && (
              <div className="flex flex-col items-center justify-center py-16 space-y-6">
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-semibold">Thank you for your order!</h3>
                  <p className="text-muted-foreground">
                    Order #{Math.random().toString(36).substring(2, 10).toUpperCase()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    A confirmation email has been sent to {shippingInfo.email}
                  </p>
                </div>

                <div className="w-full max-w-md space-y-3 pt-6">
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Package className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Order Confirmed</p>
                      <p className="text-xs text-muted-foreground">We've received your order</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg opacity-50">
                    <Truck className="w-5 h-5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Preparing Shipment</p>
                      <p className="text-xs text-muted-foreground">Estimated 2-3 business days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg opacity-50">
                    <MapPin className="w-5 h-5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Out for Delivery</p>
                      <p className="text-xs text-muted-foreground">Arriving soon</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right side - Order Summary (40%) */}
          <div className="md:col-span-2 bg-muted/30 rounded-lg p-6 h-fit">
            <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
            <div className="space-y-4 mb-6">
              {cart.map((item, index) => (
                <div key={`${item.product.id}-${index}`} className="flex gap-3">
                  <div className="w-16 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={item.product.image || "/placeholder.svg"}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">{item.product.brand}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.selectedSize} • {item.selectedColor} • Qty: {item.quantity}
                    </p>
                    <p className="text-sm font-semibold mt-1">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

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
              <Separator className="my-3" />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
