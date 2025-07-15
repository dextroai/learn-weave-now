
#!/usr/bin/env python3
"""
Test script for AWS Lambda blog monitor function
"""

import json
import os
from blog_monitor_lambda import lambda_handler

def test_lambda_locally():
    """Test the Lambda function locally"""
    
    # Set up environment variables for testing
    os.environ['SUPABASE_URL'] = 'https://tegrczsitmyzpzzgeicv.supabase.co'
    os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'your-service-role-key-here'
    os.environ['CACHE_BUCKET_NAME'] = 'test-blog-monitor-cache'
    os.environ['NOTIFICATION_EMAIL'] = 'notifications@yourdomain.com'
    
    # Mock event and context
    event = {}
    context = type('MockContext', (), {
        'function_name': 'blog-monitor-test',
        'function_version': '1',
        'invoked_function_arn': 'arn:aws:lambda:us-east-1:123456789:function:blog-monitor-test',
        'memory_limit_in_mb': 512,
        'remaining_time_in_millis': lambda: 300000
    })()
    
    try:
        # Call the Lambda handler
        result = lambda_handler(event, context)
        
        print("Lambda execution result:")
        print(json.dumps(result, indent=2))
        
        return result
        
    except Exception as e:
        print(f"Error testing Lambda function: {str(e)}")
        return None

if __name__ == "__main__":
    print("Testing AWS Lambda blog monitor function...")
    test_lambda_locally()
