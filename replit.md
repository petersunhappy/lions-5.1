# Overview

This is a comprehensive basketball team management system for the "Lions" team, built with React, TypeScript, and Express. The application provides role-based functionality for athletes and administrators to manage training sessions, performance tracking, events, gallery content, and live streams. The system features a modern UI with dark/light theme support and uses in-memory storage for development/testing with future PostgreSQL integration planned.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Lions team branding (yellow/black color scheme)
- **State Management**: React Context for global app state and TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Basic in-memory session handling (production would use Redis/PostgreSQL sessions)
- **API Design**: RESTful API with JSON responses

## Data Storage Solutions
- **Current Storage**: In-memory storage using MemStorage class for development/testing
- **Future Database**: PostgreSQL via Neon Database (to be integrated later)
- **ORM**: Drizzle ORM with schema-first approach for future database integration
- **Migrations**: Drizzle Kit for database schema management (ready for future use)
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`
- **Storage Interface**: Abstract storage interface in `/server/storage.ts` for easy database switching

### Recent Changes (January 2025)
- **Fixed Team Branding**: Changed all "Basquete" references to "Basketball" throughout the application
- **Added Exercise Management**: Implemented comprehensive add exercise functionality for administrators
- **Form Implementation**: Added complete exercise creation form with metrics, categories, and validation
- **UI Updates**: Updated icons from Basquete to basketball/target themed icons
- **TypeScript Fixes**: Resolved all compilation errors in storage layer and components

## Authentication and Authorization
- **Authentication**: Custom username/password system (simulating Supabase Auth)
- **Role-Based Access**: Two roles - 'athlete' and 'admin'
- **Session Management**: Express sessions with user context
- **Frontend Auth**: React Context for authentication state
- **Protected Routes**: Component-level access control based on user roles

## Key Domain Models
- **Users**: Core user accounts with role-based permissions
- **Athletes**: Extended user profiles with performance metrics and physical stats
- **Exercises**: Training activities categorized by type (basketball, aerobic, strength)
- **Training Sessions**: Individual workout records linked to athletes and exercises
- **Events**: Calendar events for games, practices, and team activities
- **Gallery**: Media management for team photos and videos
- **Best of Week**: Featured athlete recognition system
- **Live Streams**: YouTube integration for game broadcasts

## Component Architecture
- **Page Components**: Top-level route components in `/client/src/pages/`
- **Feature Components**: Business logic components in `/client/src/components/`
- **UI Components**: Reusable Shadcn/ui components in `/client/src/components/ui/`
- **Shared Types**: Common TypeScript definitions in `/shared/schema.ts`
- **Context Providers**: Global state management for theme and authentication

# External Dependencies

## Database & ORM
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database operations and migrations
- **Drizzle Kit**: Database schema management and migration tools

## UI & Styling
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Consistent icon library for UI elements
- **Class Variance Authority**: Dynamic CSS class generation
- **Embla Carousel**: Touch-friendly carousel component

## State Management & Data Fetching
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: Runtime type validation for forms and API responses

## Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking for enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind integration

## Date & Time
- **date-fns**: Modern date utility library with locale support (Portuguese Brazilian)

## Future Integration Points
- **YouTube API**: For live stream management and embedding
- **File Upload Service**: For gallery image/video uploads (currently using URL references)
- **Push Notifications**: For training reminders and team announcements
- **Analytics**: Performance tracking and team statistics