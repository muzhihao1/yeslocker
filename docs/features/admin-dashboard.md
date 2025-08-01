# Admin Dashboard Feature

## Overview

The Admin Dashboard provides comprehensive statistics and analytics for the locker management system. It offers real-time insights into system usage, user growth, and operational metrics.

## Features

### 1. Summary Dashboard
- **Today's Statistics**: New users, storage operations, retrieval operations, active lockers
- **Total Statistics**: Total users, verified users, total lockers, available lockers, usage rate
- **Recent Operations**: Live feed of the most recent locker operations

### 2. Revenue Analytics (MVP - Mock Data)
- Daily revenue trends
- Revenue composition breakdown
- Period comparison capabilities

### 3. Usage Analytics
- **Zone Utilization**: Usage rates by locker zones (A, B, C, D, VIP)
- **Hourly Distribution**: Peak usage times throughout the day
- **Duration Statistics**: Average, minimum, and maximum storage durations
- **Popular Lockers**: Most frequently used lockers

### 4. Trend Analysis
- **User Growth**: New user registrations and cumulative growth
- **Operation Trends**: Storage and retrieval operation patterns
- **Revenue Trends**: Income patterns over time (mock data in MVP)

## Technical Implementation

### Architecture
- **Controller**: `AdminDashboardController` - RESTful API endpoints
- **Service**: `AdminDashboardService` - Business logic and data aggregation
- **Caching**: Caffeine cache with 5-10 minute TTL for performance
- **Security**: Shiro permissions for each endpoint

### API Endpoints

1. `GET /admin/dashboard/summary` - Overall statistics
2. `GET /admin/dashboard/revenue` - Revenue statistics
3. `GET /admin/dashboard/usage` - Usage analytics
4. `GET /admin/dashboard/trends` - Trend data

### Caching Strategy
- **Summary**: 5 minutes cache
- **Revenue**: 10 minutes cache
- **Usage**: 5 minutes cache
- **Trends**: 10 minutes cache

### Performance Optimizations
1. Database query optimization with proper indexing
2. Aggregated data caching to reduce database load
3. Asynchronous data processing for complex analytics
4. Pagination for large datasets

## Usage Guide

### For Administrators
1. Access the admin panel and navigate to the Dashboard section
2. View real-time statistics on the main dashboard
3. Use date filters to analyze specific periods
4. Export data for further analysis (future feature)

### For Developers
1. Extend `AdminDashboardService` to add new metrics
2. Configure cache settings in `CacheConfig`
3. Add new chart types by extending the trends API
4. Implement custom analytics queries as needed

## Future Enhancements

1. **Real Revenue Integration**: Replace mock data with actual payment data
2. **Export Functionality**: PDF and Excel export capabilities
3. **Custom Date Ranges**: More flexible date selection
4. **Predictive Analytics**: ML-based usage predictions
5. **Alert System**: Automated alerts for anomalies
6. **Mobile Dashboard**: Responsive mobile view
7. **Real-time Updates**: WebSocket for live data
8. **Custom Widgets**: User-configurable dashboard layout

## Testing

### Unit Tests
Run dashboard service tests:
```bash
mvn test -Dtest=AdminDashboardServiceTest
```

### Integration Tests
Use the provided test scripts:
```bash
# Shell script
./test-scripts/admin-dashboard-tests.sh

# Python script with detailed reporting
python test-scripts/admin_dashboard_tests.py
```

### Manual Testing
1. Login to admin panel
2. Navigate to each dashboard section
3. Verify data accuracy and loading times
4. Test different date ranges and filters

## Troubleshooting

### Common Issues

1. **Slow Loading Times**
   - Check cache configuration
   - Verify database indexes
   - Monitor query performance

2. **Incorrect Data**
   - Clear cache and refresh
   - Verify time zone settings
   - Check data aggregation logic

3. **Permission Errors**
   - Verify admin role permissions
   - Check JWT token validity
   - Review Shiro configuration

## Security Considerations

1. All endpoints require admin authentication
2. Sensitive data is never exposed
3. Rate limiting prevents abuse
4. Audit logs track all access

## Dependencies

- Spring Boot Cache
- Caffeine Cache
- Apache Shiro
- Jackson for JSON processing
- Java 8 Time API