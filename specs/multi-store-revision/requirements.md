# Multi-Store Support Requirements

## Overview
Revision to the YesLocker system to support multiple stores with separate locker configurations, removing the staff interface requirement.

## User Stories

### 1. Store Selection During Registration
**As a** new user  
**I want to** select my preferred store during registration  
**So that** I can access lockers at my chosen location

**Acceptance Criteria:**
- GIVEN a user is registering for the first time
- WHEN they complete identity verification
- THEN they SHALL be presented with a list of available stores
- AND they SHALL select one store before proceeding to locker selection
- AND the selected store SHALL be saved as their default store

### 2. Multi-Store Locker Management
**As a** user  
**I want to** see only lockers from my selected store  
**So that** I don't get confused with lockers from other locations

**Acceptance Criteria:**
- GIVEN a user has selected a store
- WHEN they view available lockers
- THEN they SHALL only see lockers from their selected store
- AND each locker SHALL clearly show its store location

### 3. Store Switching
**As a** registered user  
**I want to** change my store preference  
**So that** I can use lockers at a different location

**Acceptance Criteria:**
- GIVEN a user has no active storage
- WHEN they access their profile settings
- THEN they SHALL be able to change their default store
- AND the change SHALL take effect immediately
- BUT they SHALL NOT change stores while having active storage

### 4. Admin Multi-Store Management
**As an** admin  
**I want to** manage lockers by store  
**So that** I can configure each store's lockers independently

**Acceptance Criteria:**
- GIVEN an admin is logged into the admin panel
- WHEN they access locker management
- THEN they SHALL see a store selector
- AND they SHALL be able to filter lockers by store
- AND they SHALL be able to add/edit/delete lockers for each store
- AND each locker SHALL be associated with exactly one store

### 5. Manual Staff Operations
**As a** staff member  
**I want to** manually verify and process storage/retrieval requests  
**So that** I can ensure proper handling without a digital interface

**Acceptance Criteria:**
- GIVEN a user requests storage or retrieval
- WHEN staff manually verifies the request
- THEN they SHALL use the admin panel to view request details
- AND they SHALL manually update the status after completion
- AND no separate staff interface SHALL be required

## Functional Requirements

### FR1: Database Schema Updates
- FR1.1: Add `stores` table with id, name, address, status, created_at, updated_at
- FR1.2: Add `store_id` foreign key to `litemall_locker` table
- FR1.3: Add `default_store_id` to `litemall_user` table
- FR1.4: Add `store_id` to `litemall_locker_operation` table for operation tracking
- FR1.5: Create unique constraint on (cabinet_number, store_id) for lockers

### FR2: Registration Flow Updates
- FR2.1: After identity verification, display store selection screen
- FR2.2: Store selection is mandatory before locker selection
- FR2.3: Save selected store as user's default store
- FR2.4: Update locker selection to only show lockers from selected store

### FR3: API Modifications
- FR3.1: Update `/locker/available` to filter by user's default store
- FR3.2: Add `/store/list` endpoint to get all active stores
- FR3.3: Add `/user/change-store` endpoint for store switching
- FR3.4: Update all locker-related endpoints to include store context
- FR3.5: Add store_id parameter to admin locker management APIs

### FR4: Admin Panel Enhancements
- FR4.1: Add store management section (CRUD for stores)
- FR4.2: Add store filter to locker management page
- FR4.3: Display store name in locker listings
- FR4.4: Add store selector when creating new lockers
- FR4.5: Include store information in operation logs

### FR5: Operation Log Viewing
- FR5.1: Operation logs displayed in existing admin panel
- FR5.2: Logs include store information
- FR5.3: Filter logs by store
- FR5.4: No separate staff interface needed

## Non-Functional Requirements

### NFR1: Data Integrity
- NFR1.1: Ensure all existing lockers are assigned to a default store during migration
- NFR1.2: Prevent orphaned lockers without store assignment
- NFR1.3: Maintain referential integrity between stores and lockers

### NFR2: Performance
- NFR2.1: Store selection should not impact query performance
- NFR2.2: Locker queries should use store_id index for fast filtering
- NFR2.3: Admin panel should handle 10+ stores efficiently

### NFR3: User Experience
- NFR3.1: Store selection should be intuitive with clear store names and addresses
- NFR3.2: Users should clearly see which store they're using
- NFR3.3: Store switching should have clear warnings about restrictions

## Scope Boundaries

### In Scope
- Multi-store database schema
- Store selection during registration
- Store-based locker filtering
- Admin multi-store management
- Store switching functionality
- Operation logs in admin panel

### Out of Scope
- Staff-side digital interface
- Cross-store locker transfers
- Store-specific pricing
- Store performance analytics
- Mobile app for staff
- Automated store assignment based on location

## Constraints
- Must maintain backward compatibility with existing single-store data
- Cannot break existing user sessions during migration
- Store changes not allowed with active storage
- All manual operations handled through admin panel only