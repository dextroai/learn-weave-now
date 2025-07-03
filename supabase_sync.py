
#!/usr/bin/env python3
"""
Supabase Sync Module for Blog Monitor
Syncs detected blog changes with Supabase database
"""

import requests
import json
import os
from datetime import datetime

class SupabaseSync:
    def __init__(self, supabase_url, supabase_anon_key):
        self.supabase_url = supabase_url
        self.supabase_anon_key = supabase_anon_key
        self.edge_function_url = f"{supabase_url}/functions/v1/sync-blog-posts"
        
    def sync_blog_changes(self, change_record):
        """
        Sync blog changes to Supabase
        
        Args:
            change_record: Dictionary containing blog change information
                          with keys: 'blog_name', 'blog_url', 'new_posts', 'timestamp'
        """
        try:
            headers = {
                'Authorization': f'Bearer {self.supabase_anon_key}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(
                self.edge_function_url,
                headers=headers,
                json=change_record,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print(f"✅ Successfully synced {result.get('inserted_posts', 0)} posts for {change_record['blog_name']}")
                    return True
                else:
                    print(f"❌ Failed to sync {change_record['blog_name']}: {result.get('message', 'Unknown error')}")
                    return False
            else:
                print(f"❌ HTTP {response.status_code}: Failed to sync {change_record['blog_name']}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error syncing {change_record['blog_name']}: {str(e)}")
            return False

# Example usage and integration with your existing BlogMonitor class
def integrate_with_blog_monitor():
    """
    Example of how to integrate this with your existing BlogMonitor class
    """
    
    # Add these lines to your BlogMonitor.__init__ method:
    """
    # Initialize Supabase sync
    supabase_url = os.getenv('SUPABASE_URL', 'https://tegrczsitmyzpzzgeicv.supabase.co')
    supabase_anon_key = os.getenv('SUPABASE_ANON_KEY', 'your-anon-key-here')
    self.supabase_sync = SupabaseSync(supabase_url, supabase_anon_key)
    """
    
    # Modify your save_change_record method to include sync:
    """
    def save_change_record(self, blog_name, new_posts, blog_url):
        # ... existing code ...
        
        # After saving to JSON file, sync to Supabase
        try:
            self.supabase_sync.sync_blog_changes(change_record)
        except Exception as e:
            self.logger.error(f"Failed to sync to Supabase: {str(e)}")
        
        return change_record
    """

if __name__ == "__main__":
    # Test the sync functionality
    sync = SupabaseSync(
        "https://tegrczsitmyzpzzgeicv.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZ3JjenNpdG15enB6emdlaWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MjIxNDMsImV4cCI6MjA2NzA5ODE0M30.DBZr9JfqjGa7WnuWea-h-nU7k9MdOpuoPoVvJT8IFBQ"
    )
    
    # Test with sample data
    test_record = {
        "blog_name": "Test Blog",
        "blog_url": "https://example.com",
        "new_posts": [
            {
                "title": "Test Post",
                "link": "https://example.com/test",
                "published": datetime.now().isoformat(),
                "summary": "This is a test post",
                "content": "Test content"
            }
        ],
        "timestamp": datetime.now().isoformat()
    }
    
    sync.sync_blog_changes(test_record)
