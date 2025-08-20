# Overview

This is a Student Performance Monitoring System built as a full-stack web application. The system provides a comprehensive dashboard for programme leaders and academic staff to monitor student academic performance, manage student profiles, and generate analytical reports. The application features a modern React frontend with shadcn/ui components and an Express.js backend with PostgreSQL database integration.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built with React 18 using TypeScript and follows a component-based architecture:

- **UI Framework**: React with TypeScript for type safety and better development experience
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design system
- **State Management**: TanStack Query (React Query) for server state management and data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds
- **Component Structure**: Organized into pages, components (UI, layout, charts, tables), and shared utilities

The application features a responsive layout with:
- Fixed header with navigation controls
- Collapsible sidebar navigation
- Main content area with dashboard, student profiles, analytics, and reports sections

## Backend Architecture

The backend follows a RESTful API design pattern:

- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety across the full stack
- **API Structure**: RESTful endpoints organized in `/api` routes
- **Data Layer**: In-memory storage implementation with interface for easy database migration
- **Schema Validation**: Zod for runtime type validation and schema definitions
- **Development**: Hot reload with tsx for TypeScript execution

Key API endpoints include:
- Dashboard metrics and performance data
- Student CRUD operations with semester filtering
- Analytics data for charts and reports

## Data Storage

**Current Implementation**: In-memory storage using Map data structures for rapid prototyping and development

**Database Schema Design**: 
- Students table with fields for ID, name, email, intake, programme, CGPA, credits
- Subjects table linked to students with grade and status tracking
- JSON fields for flexible subject data storage

**Planned Migration**: Drizzle ORM configured for PostgreSQL with Neon database integration

The schema supports:
- Student profile management with academic metrics
- Subject-level performance tracking
- Semester-based data filtering
- CGPA calculations and academic standing determination

## Authentication and Authorization

Currently not implemented - the system is designed for internal academic use with plans for future authentication integration.

## External Dependencies

- **shadcn/ui**: Complete UI component library built on Radix UI primitives
- **Radix UI**: Headless component primitives for accessibility and functionality
- **Recharts**: Data visualization library for performance charts and analytics
- **TanStack Query**: Powerful data synchronization for React applications
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Drizzle ORM**: Type-safe SQL ORM for database operations
- **Neon Database**: Serverless PostgreSQL for production data storage
- **Wouter**: Minimalist routing library for React
- **Zod**: TypeScript-first schema validation library
- **Vite**: Next-generation frontend build tool
- **Express.js**: Web application framework for Node.js