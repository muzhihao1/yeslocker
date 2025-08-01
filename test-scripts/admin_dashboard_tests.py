#!/usr/bin/env python3
"""
Admin Dashboard API Test Suite
Comprehensive tests for all dashboard endpoints
"""

import requests
import json
import sys
from datetime import datetime, timedelta
from colorama import init, Fore, Style

# Initialize colorama for cross-platform colored output
init()

class DashboardAPITester:
    def __init__(self, base_url="http://localhost:8080", admin_token="your-admin-jwt-token"):
        self.base_url = base_url
        self.headers = {
            "X-Litemall-Admin-Token": admin_token,
            "Content-Type": "application/json"
        }
        self.test_results = []
        
    def test_endpoint(self, method, endpoint, description, params=None, expected_errno=0):
        """Test a single endpoint and record results"""
        print(f"\n{Fore.BLUE}Testing: {description}{Style.RESET_ALL}")
        print(f"Endpoint: {method} {endpoint}")
        
        try:
            url = f"{self.base_url}{endpoint}"
            if method == "GET":
                response = requests.get(url, headers=self.headers, params=params)
            else:
                response = requests.request(method, url, headers=self.headers, json=params)
            
            response_data = response.json()
            errno = response_data.get('errno', -1)
            
            if errno == expected_errno:
                print(f"{Fore.GREEN}✓ Success - errno: {errno}{Style.RESET_ALL}")
                self.test_results.append((description, True, None))
            else:
                print(f"{Fore.RED}✗ Failed - errno: {errno}, expected: {expected_errno}{Style.RESET_ALL}")
                self.test_results.append((description, False, f"errno: {errno}"))
            
            # Pretty print response
            print(json.dumps(response_data, indent=2, ensure_ascii=False))
            
            return response_data
            
        except Exception as e:
            print(f"{Fore.RED}✗ Error: {str(e)}{Style.RESET_ALL}")
            self.test_results.append((description, False, str(e)))
            return None
    
    def run_all_tests(self):
        """Run all dashboard API tests"""
        print(f"{Fore.CYAN}=== Admin Dashboard API Test Suite ==={Style.RESET_ALL}")
        print(f"Base URL: {self.base_url}")
        print(f"Token: {self.headers['X-Litemall-Admin-Token'][:20]}...")
        
        # Test 1: Dashboard Summary
        self.test_endpoint(
            "GET", 
            "/admin/dashboard/summary",
            "Dashboard Summary - Basic functionality"
        )
        
        # Test 2: Revenue Statistics - Default
        self.test_endpoint(
            "GET",
            "/admin/dashboard/revenue",
            "Revenue Statistics - Default (last 30 days)"
        )
        
        # Test 3: Revenue Statistics - Specific date range
        today = datetime.now().date()
        start_date = (today - timedelta(days=30)).isoformat()
        end_date = today.isoformat()
        self.test_endpoint(
            "GET",
            "/admin/dashboard/revenue",
            "Revenue Statistics - Specific date range",
            params={"startDate": start_date, "endDate": end_date}
        )
        
        # Test 4-6: Usage Analytics - Different periods
        for period in ["day", "week", "month"]:
            self.test_endpoint(
                "GET",
                "/admin/dashboard/usage",
                f"Usage Analytics - Period: {period}",
                params={"period": period}
            )
        
        # Test 7: Usage Analytics - Invalid period
        self.test_endpoint(
            "GET",
            "/admin/dashboard/usage",
            "Usage Analytics - Invalid period (should fail)",
            params={"period": "invalid"},
            expected_errno=402  # Bad argument
        )
        
        # Test 8-10: Trends - Different types
        for trend_type in ["user", "operation", "revenue"]:
            self.test_endpoint(
                "GET",
                "/admin/dashboard/trends",
                f"Trends - Type: {trend_type} (7 days)",
                params={"type": trend_type, "days": 7}
            )
        
        # Test 11: Trends - Invalid type
        self.test_endpoint(
            "GET",
            "/admin/dashboard/trends",
            "Trends - Invalid type (should fail)",
            params={"type": "invalid", "days": 7},
            expected_errno=402  # Bad argument
        )
        
        # Test 12: Trends - Excessive days
        self.test_endpoint(
            "GET",
            "/admin/dashboard/trends",
            "Trends - Excessive days (should fail)",
            params={"type": "operation", "days": 100},
            expected_errno=402  # Bad argument
        )
        
        # Test 13: Trends - Maximum allowed days
        self.test_endpoint(
            "GET",
            "/admin/dashboard/trends",
            "Trends - Maximum allowed days (90)",
            params={"type": "operation", "days": 90}
        )
        
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print(f"\n{Fore.CYAN}=== Test Summary ==={Style.RESET_ALL}")
        total_tests = len(self.test_results)
        passed_tests = sum(1 for _, success, _ in self.test_results if success)
        failed_tests = total_tests - passed_tests
        
        print(f"Total tests: {total_tests}")
        print(f"{Fore.GREEN}Passed: {passed_tests}{Style.RESET_ALL}")
        print(f"{Fore.RED}Failed: {failed_tests}{Style.RESET_ALL}")
        
        if failed_tests > 0:
            print(f"\n{Fore.YELLOW}Failed tests:{Style.RESET_ALL}")
            for description, success, error in self.test_results:
                if not success:
                    print(f"  - {description}: {error}")
        
        # Return exit code based on test results
        return 0 if failed_tests == 0 else 1

def main():
    """Main function to run tests"""
    # Get command line arguments
    base_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080"
    admin_token = sys.argv[2] if len(sys.argv) > 2 else "your-admin-jwt-token"
    
    # Create tester and run tests
    tester = DashboardAPITester(base_url, admin_token)
    exit_code = tester.run_all_tests()
    
    sys.exit(exit_code)

if __name__ == "__main__":
    main()