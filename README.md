# 🎉 EveNex - AI-Powered Event Management Platform

<div align="center">

![EveNex Banner](public/evenex.png)

**A modern, full-stack event management platform built with Next.js 15, Convex, and AI**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Convex](https://img.shields.io/badge/Convex-Backend-orange?style=for-the-badge)](https://convex.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[Live Demo](https://evenex.vercel.app) • [Documentation](#features) • [Report Bug](#) • [Request Feature](#)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**EveNex** is a production-ready event management platform that combines modern web technologies with AI capabilities to streamline event creation, discovery, and management. Built as a showcase of full-stack development skills, it demonstrates enterprise-level architecture, security best practices, and seamless third-party integrations.

### 🎯 Problem Statement

Traditional event management platforms lack intelligent automation and often have complex, unintuitive interfaces. EveNex solves this by:
- **AI-Powered Event Creation**: Generate event details from natural language descriptions
- **Smart Email Automation**: Instant ticket confirmations with professional HTML templates
- **Seamless Calendar Integration**: One-click calendar exports (.ics format)
- **Real-time Updates**: Live event capacity tracking and registration management

---

## ✨ Key Features

### 🤖 AI-Powered Event Generation
- Natural language event creation using OpenRouter API
- Intelligent categorization and capacity suggestions
- Supports GPT-3.5-turbo for reliable, cost-effective generation

### 🎫 Complete Event Management
- **Create & Manage Events**: Full CRUD operations with real-time updates
- **QR Code Ticketing**: Unique QR codes for secure event entry
- **Capacity Tracking**: Live attendee count with automatic full-event detection
- **Event Discovery**: Advanced search and filtering by category, location, date

### 📧 Transactional Email System
- Professional HTML email templates using Resend
- Instant ticket confirmation emails
- Event details and QR code delivery
- Graceful error handling (registration succeeds even if email fails)

### 📅 Calendar Integration
- RFC-compliant .ics file generation
- One-click "Add to Calendar" functionality
- Compatible with Google Calendar, Outlook, Apple Calendar

### 💳 Payment Infrastructure (Ready)
- Stripe Connect integration for organizer payouts
- Platform fee structure (5% configurable)
- Secure payment processing architecture

### 🔐 Enterprise-Grade Security
- Clerk authentication with social login support
- Rate limiting (5 requests/minute) using Upstash Redis
- Unique database constraints preventing duplicate URLs/QR codes
- CSRF protection and secure API endpoints

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS v4
- Dark mode support with theme persistence
- Shadcn UI components for consistency
- Optimistic UI updates for instant feedback
- Open Graph meta tags for social media sharing

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router, Server Components)
- **Language**: JavaScript/TypeScript
- **Styling**: Tailwind CSS v4, Shadcn UI
- **State Management**: React Hooks, Convex React
- **Forms**: React Hook Form + Zod validation

### Backend
- **Database**: Convex (Real-time, serverless)
- **Authentication**: Clerk (OAuth, JWT)
- **Email**: Resend (Transactional emails)
- **Payments**: Stripe Connect
- **AI**: OpenRouter (GPT-3.5-turbo)
- **Rate Limiting**: Upstash Redis

### DevOps & Tools
- **Deployment**: Vercel (Frontend), Convex Cloud (Backend)
- **Version Control**: Git, GitHub
- **Package Manager**: npm
- **Code Quality**: ESLint, Prettier

---

## 🏗️ Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  (Next.js 15 App Router + React 19 + Tailwind CSS)         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Routes Layer                        │
│  • /api/generate-event (AI Generation)                      │
│  • /api/calendar/[slug] (ICS Generation)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Convex Backend Layer                      │
│  • Mutations (Write Operations)                             │
│  • Queries (Read Operations)                                │
│  • Actions (External API Calls)                             │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   ┌────────┐  ┌─────────┐  ┌──────────┐
   │ Clerk  │  │ Resend  │  │  Stripe  │
   │  Auth  │  │  Email  │  │ Connect  │
   └────────┘  └─────────┘  └──────────┘
```

### Database Schema

**Users Table**
- Authentication (Clerk integration)
- Onboarding preferences (location, interests)
- Stripe Connect account tracking
- Free event limit management

**Events Table**
- Event details (title, description, dates)
- Location (physical/online with geocoding)
- Capacity and ticketing (free/paid)
- Unique slug generation for SEO-friendly URLs

**Registrations Table**
- User-event relationships
- QR code generation for entry
- Check-in status tracking
- Approval workflow support

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Accounts for: Clerk, Convex, Resend, Stripe, OpenRouter, Upstash

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tanmay-7706/evenex.git
   cd evenex
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys (see Environment Variables section)
   ```

4. **Initialize Convex**
   ```bash
   npx convex dev
   ```
   This will:
   - Create a new Convex project
   - Set up the database schema
   - Start the development backend

5. **Set Convex environment variables**
   ```bash
   npx convex env set RESEND_API_KEY your_resend_key
   npx convex env set STRIPE_SECRET_KEY your_stripe_key
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Convex
CONVEX_DEPLOYMENT=your_deployment_name
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER_DOMAIN=https://your-domain.clerk.accounts.dev

# OpenRouter AI
OPENROUTER_API_KEY=sk-or-v1-...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Resend Email
RESEND_API_KEY=re_...

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...

# Unsplash (Optional - for event images)
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=...
```

### Getting API Keys

| Service | Purpose | Get Key |
|---------|---------|---------|
| Convex | Backend & Database | [convex.dev](https://convex.dev) |
| Clerk | Authentication | [clerk.com](https://clerk.com) |
| OpenRouter | AI Generation | [openrouter.ai](https://openrouter.ai) |
| Resend | Email Delivery | [resend.com](https://resend.com) |
| Stripe | Payments | [stripe.com](https://stripe.com) |
| Upstash | Redis/Rate Limiting | [upstash.com](https://upstash.com) |

---

## 📁 Project Structure

```
evenex/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (main)/                   # Protected routes
│   │   ├── create-event/         # Event creation with AI
│   │   ├── my-events/            # Organizer dashboard
│   │   └── my-tickets/           # User tickets
│   ├── (public)/                 # Public routes
│   │   ├── events/[slug]/        # Event details page
│   │   └── explore/              # Event discovery
│   ├── api/                      # API routes
│   │   ├── generate-event/       # AI event generation
│   │   └── calendar/[slug]/      # ICS file generation
│   ├── layout.js                 # Root layout with providers
│   └── page.js                   # Landing page
├── components/                   # React components
│   ├── ui/                       # Shadcn UI components
│   ├── event-card.jsx            # Reusable event card
│   ├── header.jsx                # Navigation header
│   ├── add-to-calendar-button.tsx # Calendar export
│   └── ...
├── convex/                       # Backend (Convex)
│   ├── schema.js                 # Database schema
│   ├── events.js                 # Event mutations/queries
│   ├── registrations.js          # Registration logic
│   ├── users.js                  # User management
│   ├── actions.js                # External API actions
│   └── ...
├── lib/                          # Utility functions
│   ├── utils.js                  # Helper functions
│   ├── generateIcs.ts            # Calendar file generation
│   └── data.js                   # Static data
├── hooks/                        # Custom React hooks
├── public/                       # Static assets
└── .env.local                    # Environment variables
```

---

## 📚 API Documentation

### Event Generation API

**Endpoint**: `POST /api/generate-event`

**Request Body**:
```json
{
  "prompt": "A tech meetup for startup founders in Bangalore"
}
```

**Response**:
```json
{
  "title": "Startup Founders Tech Meetup",
  "description": "Connect with fellow startup founders...",
  "category": "tech",
  "suggestedCapacity": 50,
  "suggestedTicketType": "free"
}
```

**Rate Limit**: 5 requests per minute per IP

### Calendar Export API

**Endpoint**: `GET /api/calendar/[slug]`

**Response**: `.ics` file download

---

## 🚢 Deployment

### Deploy to Vercel (Frontend)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy

3. **Update Convex URL**
   ```bash
   npx convex env set NEXT_PUBLIC_APP_URL https://your-domain.vercel.app
   ```

### Deploy Convex (Backend)

```bash
npx convex deploy
npx convex env --prod set RESEND_API_KEY your_key
npx convex env --prod set STRIPE_SECRET_KEY your_key
```

---

## 🎓 Learning Outcomes

This project demonstrates proficiency in:

### Technical Skills
- ✅ **Full-Stack Development**: End-to-end application architecture
- ✅ **Modern React Patterns**: Server Components, Suspense, Streaming
- ✅ **Real-time Systems**: Convex reactive queries and subscriptions
- ✅ **API Integration**: RESTful APIs, webhooks, third-party services
- ✅ **Database Design**: Schema modeling, indexing, relationships
- ✅ **Authentication & Authorization**: OAuth, JWT, role-based access
- ✅ **Payment Processing**: Stripe Connect, multi-party payments
- ✅ **Email Systems**: Transactional emails, HTML templates
- ✅ **AI Integration**: Prompt engineering, API orchestration
- ✅ **Security**: Rate limiting, CSRF protection, input validation

### Software Engineering Practices
- ✅ **Clean Code**: Modular, reusable components
- ✅ **Error Handling**: Graceful degradation, user feedback
- ✅ **Performance**: Optimistic updates, lazy loading, caching
- ✅ **Testing**: Edge case handling, validation
- ✅ **Documentation**: Comprehensive README, inline comments
- ✅ **Version Control**: Git workflow, meaningful commits

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Tanmay Singh**
- GitHub: [@tanmay-7706](https://github.com/tanmay-7706)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Portfolio: [yourportfolio.com](https://yourportfolio.com)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Convex](https://convex.dev/) - Backend platform
- [Clerk](https://clerk.com/) - Authentication
- [Shadcn UI](https://ui.shadcn.com/) - Component library
- [Vercel](https://vercel.com/) - Deployment platform

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by Tanmay Singh

</div>
