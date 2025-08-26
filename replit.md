# Audiogram Visualizer

## Overview

A single-page React web application for creating and visualizing audiogram charts. The application allows healthcare professionals to input patient information and create interactive audiogram charts for both left and right ears, with support for air and bone conduction measurements. Features include dark mode, chart enlargement, and PNG export functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **Styling**: TailwindCSS with custom CSS variables for theming and shadcn/ui component library
- **UI Components**: Radix UI primitives wrapped in custom components for accessibility and consistency
- **State Management**: Custom React hooks for audiogram state management with local state persistence
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Custom SVG-based audiogram charts with interactive threshold adjustment

### Component Structure
- **Modular Design**: Separate components for patient forms, audiogram charts, modals, and theme controls
- **Chart Components**: Interactive SVG charts with drag-and-drop threshold editing and enlargement capabilities
- **Form Validation**: Real-time validation for required patient information fields
- **Responsive Design**: Mobile-first approach with responsive breakpoints

### Data Management
- **State Architecture**: Centralized audiogram state management through custom hooks
- **Data Persistence**: Local state management without external database dependencies
- **Validation**: Client-side form validation with error highlighting and scrolling
- **Export Functionality**: HTML2Canvas integration for PNG export of complete audiogram reports

### Backend Architecture
- **Server Framework**: Express.js with TypeScript for API structure
- **Development Setup**: Hot module replacement with Vite integration
- **Storage Interface**: Abstract storage layer with in-memory implementation
- **Middleware**: Request logging and error handling middleware

### Build System
- **Development**: Vite dev server with HMR and TypeScript checking
- **Production**: Vite build with static asset optimization and ESBuild for server bundling
- **Type Safety**: Strict TypeScript configuration across client, server, and shared modules

## External Dependencies

### UI and Styling
- **Radix UI**: Comprehensive set of accessible UI primitives for dialogs, forms, and interactive elements
- **TailwindCSS**: Utility-first CSS framework with custom design system and dark mode support
- **Lucide React**: Icon library for consistent iconography throughout the application

### Chart and Export
- **html2canvas**: Client-side screenshot generation for PNG export functionality
- **Custom SVG Charts**: Hand-built interactive audiogram charts with precise medical measurements

### Development Tools
- **Vite**: Fast build tool with hot module replacement and optimized production builds
- **TypeScript**: Strict type checking for enhanced developer experience and code reliability
- **ESBuild**: Fast JavaScript bundler for server-side code compilation

### Database Layer
- **Drizzle ORM**: PostgreSQL integration with type-safe database operations
- **Neon Database**: Serverless PostgreSQL database provider
- **Migration System**: Drizzle Kit for database schema management and migrations

### State and Data Fetching
- **TanStack Query**: Robust data fetching and caching for API interactions
- **React Hook Form**: Form state management with validation resolver integration
- **Zod**: Runtime type validation for form data and API responses

### Production Dependencies
- **Connect PG Simple**: PostgreSQL session store for production deployments
- **Date-fns**: Date manipulation and formatting utilities
- **Class Variance Authority**: Type-safe CSS class composition for component variants