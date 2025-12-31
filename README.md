# FashionAI - Your Personal Fashion Agent

An AI-powered fashion shopping experience built with Next.js 16, featuring an intelligent style assistant that helps curate personalized outfit recommendations.

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)
![React](https://img.shields.io/badge/React-19.2.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC)

## Features

- 🤖 **AI Fashion Assistant** - Conversational interface to describe your style preferences
- 🎨 **Smart Filtering** - Filter by price, color, size, category, and brand
- 🛍️ **Product Catalog** - Curated collection of dresses, casual wear, and workwear
- 🛒 **Shopping Cart** - Full e-commerce cart and checkout experience
- 🌓 **Dark/Light Mode** - Theme support with next-themes
- 📱 **Responsive Design** - Resizable chat panel with mobile support

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + Radix UI primitives
- **Icons**: Lucide React
- **Theming**: next-themes

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd fashion

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
fashion/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx            # Main page with FashionAgent
│   └── globals.css         # Global styles and CSS variables
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── fashion-agent.tsx   # Main agent component
│   ├── chat-panel.tsx      # AI chat interface
│   ├── products-panel.tsx  # Product grid display
│   ├── product-detail-modal.tsx
│   ├── cart-sidebar.tsx    # Shopping cart
│   └── checkout-modal.tsx  # Checkout flow
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities
├── public/                 # Product images & assets
└── styles/                 # Additional styles
```

## Environment Variables

| Variable                     | Description                   | Default |
| ---------------------------- | ----------------------------- | ------- |
| `NEXT_PUBLIC_ECOMMERCE_MODE` | Cart mode: `full` or `browse` | `full`  |

## Available Scripts

| Script          | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm start`     | Start production server  |
| `npm run lint`  | Run ESLint               |

## UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) components built on Radix UI primitives:

- Accordion, Alert Dialog, Avatar, Badge
- Button, Card, Checkbox, Dialog
- Dropdown Menu, Form, Input, Label
- Popover, Select, Sheet, Slider
- Tabs, Toast, Tooltip, and more

## License

MIT
