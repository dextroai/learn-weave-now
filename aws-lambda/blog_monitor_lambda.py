
import json
import boto3
import os
import logging
from datetime import datetime
from blog_monitor import BlogMonitor
from supabase import create_client

# Set up logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    """
    AWS Lambda handler for blog monitoring
    Runs daily to check all blogs for new posts
    """
    try:
        # Initialize Supabase client
        supabase_url = os.environ['SUPABASE_URL']
        supabase_key = os.environ['SUPABASE_SERVICE_ROLE_KEY']
        supabase = create_client(supabase_url, supabase_key)
        
        # Initialize S3 for cache storage
        s3_client = boto3.client('s3')
        cache_bucket = os.environ['CACHE_BUCKET_NAME']
        
        # Initialize SES for notifications (optional)
        ses_client = boto3.client('ses') if os.environ.get('NOTIFICATION_EMAIL') else None
        
        # Create modified BlogMonitor class for Lambda
        monitor = LambdaBlogMonitor(supabase, s3_client, ses_client, cache_bucket)
        
        # Get all blogs from admin_blogs table
        blogs_response = supabase.table('admin_blogs').select('*').eq('is_active', True).execute()
        
        if not blogs_response.data:
            logger.info("No active blogs found")
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': 'No active blogs to check',
                    'checked': 0,
                    'updated': 0
                })
            }
        
        checked_count = 0
        updated_count = 0
        
        # Check each blog
        for blog in blogs_response.data:
            try:
                logger.info(f"Checking blog: {blog['url']}")
                
                # Check blog for updates
                new_posts = monitor.check_blog_lambda(blog)
                
                if new_posts:
                    updated_count += 1
                    
                    # Update user blogs and blog posts
                    monitor.update_user_blogs_and_posts(blog, new_posts)
                    
                    # Send notifications
                    monitor.send_notifications(blog, new_posts)
                
                checked_count += 1
                
            except Exception as e:
                logger.error(f"Error checking blog {blog['url']}: {str(e)}")
                continue
        
        # Update admin_blogs last_checked timestamp
        supabase.table('admin_blogs').update({
            'last_checked': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }).in_('url', [blog['url'] for blog in blogs_response.data]).execute()
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': f'Blog check completed successfully',
                'checked': checked_count,
                'updated': updated_count,
                'timestamp': datetime.now().isoformat()
            })
        }
        
    except Exception as e:
        logger.error(f"Lambda execution error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            })
        }


class LambdaBlogMonitor(BlogMonitor):
    """
    Modified BlogMonitor class for AWS Lambda execution
    """
    
    def __init__(self, supabase_client, s3_client, ses_client, cache_bucket):
        super().__init__()
        self.supabase = supabase_client
        self.s3_client = s3_client
        self.ses_client = ses_client
        self.cache_bucket = cache_bucket
    
    def load_cache_from_s3(self, blog_url):
        """Load previous posts cache from S3"""
        try:
            cache_key = f"blog_cache/{self.get_cache_filename(blog_url)}"
            response = self.s3_client.get_object(Bucket=self.cache_bucket, Key=cache_key)
            return json.loads(response['Body'].read().decode('utf-8'))
        except self.s3_client.exceptions.NoSuchKey:
            return []
        except Exception as e:
            self.logger.error(f"Error loading cache from S3: {str(e)}")
            return []
    
    def save_cache_to_s3(self, blog_url, posts):
        """Save current posts cache to S3"""
        try:
            cache_key = f"blog_cache/{self.get_cache_filename(blog_url)}"
            self.s3_client.put_object(
                Bucket=self.cache_bucket,
                Key=cache_key,
                Body=json.dumps(posts, ensure_ascii=False),
                ContentType='application/json'
            )
        except Exception as e:
            self.logger.error(f"Error saving cache to S3: {str(e)}")
    
    def get_cache_filename(self, blog_url):
        """Generate cache filename from blog URL"""
        import hashlib
        return f"{hashlib.md5(blog_url.encode()).hexdigest()}_posts.json"
    
    def check_blog_lambda(self, blog):
        """Check a single blog for updates (Lambda version)"""
        blog_data = self.fetch_blog_content(blog['url'])
        if not blog_data:
            return []
        
        # Load previous posts from S3 cache
        previous_posts = self.load_cache_from_s3(blog['url'])
        current_posts = blog_data['posts']
        
        # Detect new posts
        new_posts = self.detect_new_posts(previous_posts, current_posts)
        
        if new_posts:
            self.logger.info(f"Found {len(new_posts)} new posts in {blog['url']}")
            
            # Save current posts to S3 cache
            self.save_cache_to_s3(blog['url'], current_posts)
            
            return new_posts
        else:
            self.logger.info(f"No new posts found in {blog['url']}")
            return []
    
    def update_user_blogs_and_posts(self, blog, new_posts):
        """Update user blogs and create blog posts for all users who have this blog"""
        try:
            # Get all users who have this blog URL
            user_blogs_response = self.supabase.table('blogs').select('*').eq('url', blog['url']).execute()
            
            if not user_blogs_response.data:
                self.logger.info(f"No users have blog {blog['url']}")
                return
            
            for user_blog in user_blogs_response.data:
                # Update user's blog last_checked timestamp
                self.supabase.table('blogs').update({
                    'last_checked': datetime.now().isoformat(),
                    'updated_at': datetime.now().isoformat()
                }).eq('id', user_blog['id']).execute()
                
                # Create blog posts for this user
                for post in new_posts:
                    post_data = {
                        'blog_id': user_blog['id'],
                        'title': post.get('title', 'No Title'),
                        'content': post.get('content', ''),
                        'summary': post.get('summary', ''),
                        'link': post.get('link', ''),
                        'published_date': self.parse_published_date(post.get('published', '')),
                        'detected_at': datetime.now().isoformat(),
                        'is_new': True
                    }
                    
                    # Insert blog post
                    self.supabase.table('blog_posts').insert(post_data).execute()
                    
                self.logger.info(f"Created {len(new_posts)} posts for user {user_blog['user_id']}")
                
        except Exception as e:
            self.logger.error(f"Error updating user blogs and posts: {str(e)}")
    
    def parse_published_date(self, published_str):
        """Parse published date string to ISO format"""
        if not published_str:
            return None
        
        try:
            # Try to parse common date formats
            from dateutil import parser
            parsed_date = parser.parse(published_str)
            return parsed_date.isoformat()
        except:
            return None
    
    def send_notifications(self, blog, new_posts):
        """Send email notifications via SES"""
        try:
            if not self.ses_client:
                self.logger.info("SES not configured, skipping email notifications")
                return
                
            notification_email = os.environ.get('NOTIFICATION_EMAIL')
            if not notification_email:
                self.logger.info("No notification email configured, skipping notifications")
                return
            
            # Get users who have this blog and want notifications
            user_blogs_response = self.supabase.table('blogs').select(
                'user_id, profiles!inner(*)'
            ).eq('url', blog['url']).execute()
            
            for user_blog in user_blogs_response.data:
                user_email = user_blog['profiles']['email']
                if not user_email:
                    continue
                
                # Create email content
                subject = f"New Blog Posts: {blog['url']} ({len(new_posts)} new)"
                
                body = f"New posts detected on {blog['url']}\n\n"
                body += f"Number of new posts: {len(new_posts)}\n"
                body += f"Detection time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
                
                body += "New Posts:\n" + "="*50 + "\n\n"
                
                for i, post in enumerate(new_posts, 1):
                    body += f"{i}. {post['title']}\n"
                    if post.get('published'):
                        body += f"   Published: {post['published']}\n"
                    if post.get('link'):
                        body += f"   Link: {post['link']}\n"
                    if post.get('summary'):
                        body += f"   Summary: {post['summary']}\n"
                    body += "\n" + "-"*40 + "\n\n"
                
                # Send email via SES
                self.ses_client.send_email(
                    Source=notification_email,
                    Destination={'ToAddresses': [user_email]},
                    Message={
                        'Subject': {'Data': subject},
                        'Body': {'Text': {'Data': body}}
                    }
                )
                
                self.logger.info(f"Notification sent to {user_email}")
                
        except Exception as e:
            self.logger.error(f"Error sending notifications: {str(e)}")
