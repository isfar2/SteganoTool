# Overview

This is a steganography application that allows users to hide secret messages within images and decode them later. The application uses a full-stack architecture with a React frontend and Express backend, featuring drag-and-drop file uploads, password protection for messages, and progress tracking for encoding/decoding operations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Main frontend framework using functional components and hooks
- **Vite**: Build tool and development server for fast development experience
- **Wouter**: Lightweight client-side routing library for navigation
- **TanStack Query**: Data fetching and caching library for API interactions
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Shadcn/ui**: Pre-built component library based on Radix UI primitives
- **Canvas API**: Browser-native image manipulation for steganography operations

## Backend Architecture
- **Express.js**: RESTful API server framework
- **TypeScript**: Type-safe server-side development
- **Memory Storage**: In-memory data storage using Map collections for user management
- **Modular Route System**: Organized API endpoints with separation of concerns
- **Error Handling**: Centralized error handling middleware

## Database Strategy
- **Drizzle ORM**: Type-safe database toolkit configured for PostgreSQL
- **PostgreSQL**: Relational database (configured but not actively used, currently using memory storage)
- **Schema Definitions**: Shared type definitions between frontend and backend

## File Processing
- **Client-Side Image Processing**: All steganography operations performed in the browser using HTML5 Canvas
- **LSB Steganography**: Least Significant Bit technique for hiding data in image pixels
- **Password-Based Encryption**: Optional password protection using simple hash-based encoding
- **File Validation**: Client-side validation for image types (PNG, JPEG) and size limits (10MB)

## UI/UX Design Patterns
- **Drag-and-Drop Interface**: Custom file dropzone components for intuitive file uploads
- **Progress Tracking**: Real-time feedback during encoding/decoding operations
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Toast Notifications**: User feedback system for success/error states
- **Dual-Panel Layout**: Separate encode and decode sections for clear workflow

## Development Tooling
- **ESBuild**: Fast bundling for production builds
- **TypeScript Strict Mode**: Enhanced type checking for better code quality
- **Path Aliases**: Simplified imports using @ prefixes
- **Hot Module Replacement**: Development server with instant updates

# External Dependencies

## UI Components & Styling
- **@radix-ui/react-***: Accessible, unstyled UI primitives for complex components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for creating variant-based component APIs
- **clsx**: Conditional className utility
- **lucide-react**: Icon library for consistent UI elements

## Data Management
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Form handling with validation
- **@hookform/resolvers**: Form validation resolvers
- **zod**: Schema validation library

## Database & ORM
- **drizzle-orm**: Type-safe database ORM
- **drizzle-zod**: Zod integration for Drizzle schemas
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **connect-pg-simple**: PostgreSQL session store

## Development Dependencies
- **vite**: Build tool and development server
- **@vitejs/plugin-react**: React support for Vite
- **esbuild**: JavaScript bundler for production builds
- **tsx**: TypeScript execution for development
- **@replit/vite-plugin-***: Replit-specific development tools

## Utility Libraries
- **date-fns**: Date manipulation utilities
- **nanoid**: Unique ID generation
- **embla-carousel-react**: Carousel component functionality