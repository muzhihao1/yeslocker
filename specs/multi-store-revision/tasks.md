# Plan: Multi-Store Support Implementation

## Tasks

### Phase 1: Database & Backend Foundation (Day 1-3)

- [ ] 1. Database Schema Updates
  - [ ] 1.1 Create stores table migration
  - [ ] 1.2 Add store_id to locker table
  - [ ] 1.3 Add default_store_id to user table
  - [ ] 1.4 Add store_id to operation table
  - [ ] 1.5 Create migration script for existing data
  - [ ] 1.6 Test migration on development database

- [ ] 2. Backend Entity & DAO Layer
  - [ ] 2.1 Create Store entity class
  - [ ] 2.2 Create StoreExample class
  - [ ] 2.3 Create StoreMapper interface
  - [ ] 2.4 Create StoreMapper XML
  - [ ] 2.5 Update LockerOperation entity with storeId
  - [ ] 2.6 Update User entity with defaultStoreId
  - [ ] 2.7 Update existing mapper queries to include store filtering

- [ ] 3. Backend Service Layer
  - [ ] 3.1 Create StoreService class
  - [ ] 3.2 Implement store CRUD operations
  - [ ] 3.3 Update LockerService to filter by store
  - [ ] 3.4 Update UserService to handle default store
  - [ ] 3.5 Create store validation logic
  - [ ] 3.6 Update operation service to record store

### Phase 2: API Development (Day 4-5)

- [ ] 4. User-facing APIs
  - [ ] 4.1 Implement GET /wx/store/list endpoint
  - [ ] 4.2 Implement POST /wx/user/set-store endpoint
  - [ ] 4.3 Implement GET /wx/user/current-store endpoint
  - [ ] 4.4 Update /wx/locker/available to filter by user's store
  - [ ] 4.5 Update /wx/locker/store to validate store
  - [ ] 4.6 Add store info to all locker responses

- [ ] 5. Admin APIs
  - [ ] 5.1 Implement store management CRUD endpoints
  - [ ] 5.2 Update admin locker list to support store filter
  - [ ] 5.3 Update admin locker create/edit to include store
  - [ ] 5.4 Update operation logs API to include store info
  - [ ] 5.5 Add store statistics endpoint
  - [ ] 5.6 Implement store status management

### Phase 3: Frontend - Registration Flow (Day 6-7)

- [ ] 6. Store Selection Components
  - [ ] 6.1 Create StoreSelection page component
  - [ ] 6.2 Create StoreCard component
  - [ ] 6.3 Implement store selection state management
  - [ ] 6.4 Create store selection API integration
  - [ ] 6.5 Add loading and error states
  - [ ] 6.6 Style store selection UI

- [ ] 7. Registration Flow Updates
  - [ ] 7.1 Update registration flow navigation
  - [ ] 7.2 Insert store selection after identity verification
  - [ ] 7.3 Update locker selection to use selected store
  - [ ] 7.4 Save store preference on registration completion
  - [ ] 7.5 Update success page to show store info
  - [ ] 7.6 Test complete registration flow

### Phase 4: Frontend - User Features (Day 8-9)

- [ ] 8. User Profile Updates
  - [ ] 8.1 Add store display to user profile
  - [ ] 8.2 Create change store dialog/page
  - [ ] 8.3 Implement store change validation
  - [ ] 8.4 Add store change API integration
  - [ ] 8.5 Show store info on main page
  - [ ] 8.6 Update storage status to include store

- [ ] 9. Locker Selection Updates
  - [ ] 9.1 Update available lockers page
  - [ ] 9.2 Add store info to locker cards
  - [ ] 9.3 Update locker filtering logic
  - [ ] 9.4 Ensure store consistency in flow
  - [ ] 9.5 Add store name to confirmation
  - [ ] 9.6 Update voucher display with store info

### Phase 5: Admin Panel Updates (Day 10-11)

- [ ] 10. Store Management
  - [ ] 10.1 Create store management page
  - [ ] 10.2 Implement store list table
  - [ ] 10.3 Create store add/edit form
  - [ ] 10.4 Implement store status toggle
  - [ ] 10.5 Add store deletion (soft delete)
  - [ ] 10.6 Create store detail view

- [ ] 11. Locker Management Updates
  - [ ] 11.1 Add store filter dropdown
  - [ ] 11.2 Update locker table to show store
  - [ ] 11.3 Update locker form with store selector
  - [ ] 11.4 Implement store-based filtering
  - [ ] 11.5 Update bulk operations for store context
  - [ ] 11.6 Add store column to export

- [ ] 12. Operation Logs Updates
  - [ ] 12.1 Add store column to logs table
  - [ ] 12.2 Implement store filter in search
  - [ ] 12.3 Update log details to show store
  - [ ] 12.4 Add store to export data
  - [ ] 12.5 Create store-based statistics
  - [ ] 12.6 Update dashboard with store metrics

### Phase 6: Testing & Migration (Day 12-13)

- [ ] 13. Data Migration
  - [ ] 13.1 Create production migration scripts
  - [ ] 13.2 Test migration with production data copy
  - [ ] 13.3 Create rollback scripts
  - [ ] 13.4 Document migration process
  - [ ] 13.5 Prepare migration checklist
  - [ ] 13.6 Create data verification queries

- [ ] 14. Integration Testing
  - [ ] 14.1 Test complete registration flow with stores
  - [ ] 14.2 Test store switching scenarios
  - [ ] 14.3 Test admin store management
  - [ ] 14.4 Test data integrity after migration
  - [ ] 14.5 Test performance with multiple stores
  - [ ] 14.6 Test edge cases and error handling

- [ ] 15. User Acceptance Testing
  - [ ] 15.1 Prepare UAT test cases
  - [ ] 15.2 Set up UAT environment
  - [ ] 15.3 Conduct admin panel UAT
  - [ ] 15.4 Conduct user flow UAT
  - [ ] 15.5 Document issues and fixes
  - [ ] 15.6 Get sign-off on changes

### Phase 7: Deployment (Day 14)

- [ ] 16. Production Deployment
  - [ ] 16.1 Backup production database
  - [ ] 16.2 Run database migrations
  - [ ] 16.3 Deploy backend updates
  - [ ] 16.4 Deploy frontend updates
  - [ ] 16.5 Verify system functionality
  - [ ] 16.6 Monitor for issues

- [ ] 17. Post-Deployment
  - [ ] 17.1 Monitor system performance
  - [ ] 17.2 Check error logs
  - [ ] 17.3 Verify data integrity
  - [ ] 17.4 Update documentation
  - [ ] 17.5 Communicate changes to users
  - [ ] 17.6 Prepare hotfix process if needed

## Removed Tasks (Staff Interface)

The following tasks from the original plan are NO LONGER NEEDED:

- ~~Staff login and authentication~~
- ~~Staff dashboard development~~
- ~~Staff-specific APIs~~
- ~~Staff mobile interface~~
- ~~Staff notification system~~
- ~~Staff request management UI~~

## Timeline Summary

- **Day 1-3**: Database and backend foundation
- **Day 4-5**: API development
- **Day 6-7**: Registration flow updates
- **Day 8-9**: User features
- **Day 10-11**: Admin panel updates
- **Day 12-13**: Testing and migration
- **Day 14**: Production deployment

## Risk Mitigation

1. **Data Migration Risk**: Test thoroughly on production data copy
2. **User Disruption**: Communicate changes clearly before deployment
3. **Performance Impact**: Monitor query performance with store filtering
4. **Backward Compatibility**: Ensure existing users get default store assigned

## Success Criteria

- All existing users assigned to default store
- New users can select store during registration
- Lockers properly filtered by store
- Admin can manage multiple stores
- No data loss during migration
- System performance maintained