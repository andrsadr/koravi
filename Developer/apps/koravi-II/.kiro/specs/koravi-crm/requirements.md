# Requirements Document

## Introduction

Koravi is a modern, minimal CRM designed specifically for solo beauty professionals to manage client records efficiently. The application features a clean, Apple-inspired UI with glassmorphism navigation elements, fluid animations, and a focus on simplicity. Built with Next.js 15 and Supabase, it provides a streamlined client management experience without authentication complexity in the initial version.

## Requirements

### Requirement 1

**User Story:** As a solo beauty professional, I want a persistent navigation system with sidebar and top bar, so that I can quickly access different sections of the app and perform global searches.

#### Acceptance Criteria

1. WHEN the app loads THEN the system SHALL display a sticky sidebar and top navigation bar with liquid-glass styling
2. WHEN the user interacts with the sidebar THEN the system SHALL allow collapsing and expanding functionality
3. WHEN the user types in the global search THEN the system SHALL provide real-time search across client data
4. WHEN the user navigates between sections THEN the navigation SHALL remain persistent and accessible

### Requirement 2

**User Story:** As a beauty professional, I want to view and search through my client list, so that I can quickly find and access client information.

#### Acceptance Criteria

1. WHEN the user navigates to the Clients section THEN the system SHALL display a searchable list of all clients
2. WHEN the user types in the client search THEN the system SHALL filter clients in real-time based on name, contact info, or labels
3. WHEN the client list is displayed THEN the system SHALL show client labels, status indicators, and basic contact information
4. WHEN the user clicks on a client THEN the system SHALL navigate to the detailed client profile view
5. WHEN there are no clients THEN the system SHALL display an appropriate empty state with option to add first client
6. WHEN the client table is displayed THEN the system SHALL show client name and avatar merged as a single column for better space utilization
7. WHEN some clients are selected THEN the system SHALL display a partial selection indicator (indeterminate state) in the header checkbox
8. WHEN the user wants to customize columns THEN the system SHALL display a circular column management button positioned over the table edge for modern UI aesthetics

### Requirement 3

**User Story:** As a beauty professional, I want to view detailed client profiles, so that I can access comprehensive client information including contact details, alerts, appointments, and history.

#### Acceptance Criteria

1. WHEN the user opens a client profile THEN the system SHALL display complete client details including contact information, profile data, and status
2. WHEN the client profile loads THEN the system SHALL show any client alerts or important notes prominently
3. WHEN viewing a client profile THEN the system SHALL display appointment history and upcoming appointments
4. WHEN in the client profile view THEN the system SHALL provide options to edit client information inline
5. WHEN the user makes changes to client data THEN the system SHALL save changes automatically or with clear save confirmation

### Requirement 4

**User Story:** As a beauty professional, I want to add new clients to my database, so that I can expand my client base and maintain accurate records.

#### Acceptance Criteria

1. WHEN the user clicks "Add Client" THEN the system SHALL display a form to input new client information
2. WHEN creating a new client THEN the system SHALL require essential fields (name, contact method) and allow optional fields
3. WHEN the user submits a new client form THEN the system SHALL validate the data and save to the Supabase database
4. WHEN a new client is successfully added THEN the system SHALL redirect to the new client's profile view
5. WHEN there are validation errors THEN the system SHALL display clear error messages and prevent submission

### Requirement 5

**User Story:** As a beauty professional, I want to delete clients from my database, so that I can maintain an accurate and current client list.

#### Acceptance Criteria

1. WHEN the user selects delete client option THEN the system SHALL display a confirmation dialog to prevent accidental deletion
2. WHEN the user confirms client deletion THEN the system SHALL remove the client from the Supabase database
3. WHEN a client is successfully deleted THEN the system SHALL redirect to the client list view
4. WHEN deletion fails THEN the system SHALL display an error message and maintain the current state

### Requirement 6

**User Story:** As a beauty professional, I want the app to have smooth animations and modern UI interactions, so that the experience feels polished and professional.

#### Acceptance Criteria

1. WHEN the user interacts with UI elements THEN the system SHALL provide smooth Framer Motion animations for transitions
2. WHEN navigating between views THEN the system SHALL use fluid page transitions that enhance the user experience
3. WHEN the sidebar collapses or expands THEN the system SHALL animate the transition smoothly
4. WHEN hovering over interactive elements THEN the system SHALL provide subtle micro-interactions for feedback
5. WHEN loading data THEN the system SHALL display appropriate loading states with smooth animations

### Requirement 7

**User Story:** As a beauty professional, I want my client data stored securely in a reliable database, so that I can trust my business information is safe and accessible.

#### Acceptance Criteria

1. WHEN the app initializes THEN the system SHALL connect to Supabase database with proper error handling
2. WHEN client data is modified THEN the system SHALL save changes to the `clients` table in Supabase
3. WHEN database operations occur THEN the system SHALL handle connection errors gracefully with user feedback
4. WHEN the app loads client data THEN the system SHALL retrieve information from Supabase efficiently
5. IF database connection fails THEN the system SHALL display appropriate error messages and retry options

### Requirement 8

**User Story:** As a beauty professional, I want the app to work without complex authentication initially, so that I can start using it immediately for development and testing.

#### Acceptance Criteria

1. WHEN the app loads THEN the system SHALL operate in public development mode without requiring login
2. WHEN accessing any feature THEN the system SHALL not prompt for authentication or user credentials
3. WHEN data is saved THEN the system SHALL store information without user-specific restrictions
4. WHEN the app is deployed THEN the system SHALL clearly indicate it's in development mode if applicable