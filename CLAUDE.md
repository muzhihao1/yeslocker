# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🔄 Project Architecture Update (2024-01-22)

This project now uses:
- **Litemall** as the base e-commerce platform (forked)
- **UniApp** for cross-platform frontend development (primary target: WeChat Mini Program)
- **Context Engineering** methodology for system design

See [COLLABORATION-PLAN.md](./COLLABORATION-PLAN.md) for detailed development plan.

## Project Overview

"耶氏体育台球杆存取登记" (Ye's Sports Billiard Cue Storage Registration) - A billiard cue storage management system built on top of Litemall, adding locker management capabilities while retaining e-commerce features for second-hand cue sticks.

## Technology Stack

### Frontend - UniApp
- Vue.js based cross-platform framework
- Compiles to: WeChat Mini Program (primary), H5, iOS/Android App
- Component-based architecture following Context Engineering layers
- WeChat SDK integration for login and scanning

### Backend - Litemall (Spring Boot)
- Java 8+ with Spring Boot 2.x
- MyBatis for database operations
- Redis for caching
- MySQL 8.0 for data persistence
- Maven for dependency management

## Project Structure

```
yeslocker/
├── litemall-admin/           # Vue.js admin panel
├── litemall-admin-api/       # Admin API services
├── litemall-core/            # Core business logic
├── litemall-db/              # Database models and mappers
├── litemall-wx-api/          # WeChat Mini Program API
├── litemall-all/             # Aggregate module for deployment
├── yeslocker-uniapp/         # UniApp frontend (NEW)
└── context-engineering/      # Architecture documentation
```

## Database Extensions

Based on Context Engineering Level-1, add these tables to Litemall:

```sql
-- Locker management tables
CREATE TABLE litemall_locker (...);
CREATE TABLE litemall_locker_operation (...);
CREATE TABLE litemall_cue_stick (...);
CREATE TABLE litemall_voucher (...);
```

## Development Commands

### Backend (Litemall)
```bash
# Build all modules
mvn clean install

# Run backend services
java -jar litemall-all/target/litemall-all-*-exec.jar

# Run with specific profile
java -jar litemall-all/target/litemall-all-*-exec.jar --spring.profiles.active=dev
```

### Frontend (UniApp)
```bash
cd yeslocker-uniapp

# Install dependencies
npm install

# Development (H5)
npm run dev:h5

# Development (WeChat Mini Program)
npm run dev:mp-weixin

# Build for production
npm run build:mp-weixin
```

## API Endpoints

### Extended APIs for Locker System
```
# User operations
POST   /wx/auth/verify         # Identity verification
GET    /wx/user/locker-status  # Current locker status

# Locker operations
POST   /wx/locker/store        # Store cue stick
POST   /wx/locker/retrieve     # Retrieve cue stick
GET    /wx/locker/history      # Operation history

# Voucher operations
GET    /wx/voucher/:code       # Get voucher details
POST   /wx/voucher/validate    # Validate voucher
```

## Context Engineering Integration

Follow the three-layer architecture:

1. **Level 1 - Atoms** (litemall-db)
   - Entity definitions
   - Basic CRUD operations
   - Data validation

2. **Level 2 - Neural** (litemall-core + wx-api)
   - Business workflows
   - Transaction management
   - Service orchestration

3. **Level 3 - Protocols** (external integrations)
   - WeChat API integration
   - Qiniu cloud storage
   - SMS/notification services

## UniApp Component Architecture

```
components/
├── atoms/              # Basic UI components
│   ├── UserCard.vue
│   ├── LockerGrid.vue
│   └── VoucherDisplay.vue
├── molecules/          # Business components
│   ├── StorageFlow.vue
│   ├── IdentityForm.vue
│   └── LockerSelector.vue
└── organisms/          # Page-level components
    ├── HomePage.vue
    ├── StoragePage.vue
    └── MarketPlace.vue
```

## Development Workflow

1. Check [COLLABORATION-PLAN.md](./COLLABORATION-PLAN.md) for task assignments
2. Follow Context Engineering docs for design decisions
3. Maintain compatibility with Litemall's existing features
4. Test on WeChat DevTools before deployment
5. Update progress in collaboration document

## Testing

### Backend Testing
```bash
# Run unit tests
mvn test

# Run specific test class
mvn test -Dtest=LockerServiceTest

# Integration tests
mvn verify
```

### Frontend Testing
```bash
cd yeslocker-uniapp

# Unit tests
npm run test:unit

# E2E tests (if configured)
npm run test:e2e
```

## Deployment

### Backend Deployment
1. Build: `mvn clean package -DskipTests`
2. Deploy JAR to server
3. Configure `application-prod.yml`
4. Run with systemd or supervisor

### UniApp Deployment
1. Build: `npm run build:mp-weixin`
2. Upload via WeChat DevTools
3. Submit for review
4. Configure server domain whitelist

## Recent Updates (2025-07-26)

### Flow Optimizations
1. **No Approval Required**: Requests go directly to "active" status
2. **Key Return Confirmation**: Added popup reminder for returning keys
3. **Status Flow**: Active → Key Returned → Completed
4. **Locker Status Sync**: Automatically updates based on operation completion

### UI Changes
1. **Removed QR Code Section**: Simplified request detail page
2. **Key Return Modal**: Converted from bottom section to popup modal
3. **Consistent Mock Data**: Created `/src/utils/mockData.js` for unified data across all pages

### Modal Display Issue - Resolved ✅
The `uni.showModal` timing issue has been resolved by adding a `setTimeout` wrapper:
- **Problem**: Modal not displaying when called directly from button click
- **Solution**: Wrap modal call in `setTimeout(..., 100)` to avoid timing conflicts
- **Location**: `/src/pages/storage/request-detail.vue` - `showKeyReturnModal()` method
- See `/docs/modal-troubleshooting.md` for detailed debugging history

## Important Notes

- **UniApp Priority**: Using UniApp for cross-platform capability, WeChat Mini Program is the primary target
- **Litemall Compatibility**: Don't break existing e-commerce features
- **Context Engineering**: All design decisions should align with the documented architecture
- **Collaboration**: Update progress in COLLABORATION-PLAN.md regularly

## Quick Links

- [Litemall Documentation](https://linlinjava.gitbook.io/litemall/)
- [UniApp Documentation](https://uniapp.dcloud.io/)
- [Context Engineering Docs](./context-engineering/)
- [Original Requirements](./方案/)