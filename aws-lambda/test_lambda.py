
#!/usr/bin/env python3
"""
Test script for Blog Monitor Lambda function
"""

import json
import os
from blog_monitor_lambda import lambda_handler

def test_lambda_locally():
    """Test the lambda function locally"""
    
    # Set test environment variables
    os.environ['SUPABASE_URL'] = 'https://tegrczsitmyzpzzgeicv.supabase.co'
    os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'your-service-role-key-here'
    os.environ['CACHE_BUCKET_NAME'] = 'blog-monitor-test-cache'
    os.environ['NOTIFICATION_EMAIL'] = 'test@example.com'
    
    # Test event (empty for scheduled execution)
    test_event = {}
    
    # Test context (minimal mock)
    class MockContext:
        def __init__(self):
            self.function_name = 'blog-monitor-test'
            self.function_version = '1'
            self.invoked_function_arn = 'arn:aws:lambda:us-east-1:123456789012:function:blog-monitor-test'
            self.memory_limit_in_mb = 512
            self.remaining_time_in_millis = lambda: 900000
    
    context = MockContext()
    
    try:
        # Call the lambda handler
        result = lambda_handler(test_event, context)
        
        print("✅ Lambda function executed successfully!")
        print(f"Status Code: {result['statusCode']}")
        print(f"Response: {result['body']}")
        
        return result
        
    except Exception as e:
        print(f"❌ Lambda function failed: {str(e)}")
        return None

if __name__ == "__main__":
    print("🧪 Testing Blog Monitor Lambda function locally...")
    test_lambda_locally()
