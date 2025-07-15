
#!/usr/bin/env python3
"""
Blog Monitor System
Converts blog websites to markdown and monitors for new posts
"""

import requests
from bs4 import BeautifulSoup
import json
import hashlib
import time
import os
from datetime import datetime
from pathlib import Path
import re
import feedparser
import logging
import urllib3, ssl

class BlogMonitor:
    def __init__(self):
        # Disable SSL warnings globally
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        
        # Create unverified SSL context (use with caution)
        ssl._create_default_https_context = ssl._create_unverified_context
        
        self.setup_logging()
        
    def setup_logging(self):
        """Setup logging configuration"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
    
    def extract_domain_name(self, url):
        """Extract clean domain name from URL"""
        domain = re.sub(r'https?://', '', url)
        domain = re.sub(r'www\.', '', domain)
        domain = domain.split('/')[0]
        return domain
    
    def fetch_blog_content(self, url):
        """Fetch blog content using multiple methods"""
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        try:
            # Try RSS/Atom feed first
            feed_urls = [
                url + '/feed',
                url + '/rss',
                url + '/atom.xml',
                url + '/feed.xml',
                url + '/rss.xml'
            ]
            
            for feed_url in feed_urls:
                try:
                    feed = feedparser.parse(feed_url)
                    if feed.entries:
                        return self.parse_feed_content(feed)
                except:
                    continue
            
            # Fallback to HTML scraping
            response = requests.get(url, headers=headers, timeout=15, verify=False)
            response.raise_for_status()
            return self.parse_html_content(response.text, url)
            
        except Exception as e:
            self.logger.error(f"Error fetching {url}: {str(e)}")
            return None
    
    def parse_feed_content(self, feed):
        """Parse RSS/Atom feed content"""
        posts = []
        for entry in feed.entries[:10]:  # Limit to recent 10 posts
            post = {
                'title': entry.get('title', 'No Title'),
                'link': entry.get('link', ''),
                'published': entry.get('published', ''),
                'summary': entry.get('summary', ''),
                'content': entry.get('content', [{}])[0].get('value', '') if entry.get('content') else ''
            }
            posts.append(post)
        
        return {
            'title': feed.feed.get('title', 'Blog'),
            'description': feed.feed.get('description', ''),
            'link': feed.feed.get('link', ''),
            'posts': posts
        }
    
    def parse_html_content(self, html, url):
        """Parse HTML content to extract blog posts"""
        soup = BeautifulSoup(html, 'html.parser')
        
        # Remove unwanted elements
        for element in soup(['script', 'style', 'nav', 'footer', 'aside']):
            element.decompose()
        
        # Try to find blog posts using common selectors
        post_selectors = [
            'article',
            '.post',
            '.entry',
            '.blog-post',
            '[class*="post"]',
            'main article',
            '.content article'
        ]
        
        posts = []
        for selector in post_selectors:
            elements = soup.select(selector)
            if elements:
                for element in elements[:10]:  # Limit to 10 posts
                    title_elem = element.find(['h1', 'h2', 'h3', '.title', '.post-title'])
                    title = title_elem.get_text().strip() if title_elem else 'No Title'
                    
                    # Try to find link
                    link_elem = element.find('a')
                    link = link_elem.get('href', '') if link_elem else ''
                    if link and not link.startswith('http'):
                        link = url.rstrip('/') + '/' + link.lstrip('/')
                    
                    # Get content
                    content = element.get_text().strip()
                    
                    posts.append({
                        'title': title,
                        'link': link,
                        'content': content[:500] + '...' if len(content) > 500 else content,
                        'published': ''
                    })
                break
        
        return {
            'title': soup.find('title').get_text() if soup.find('title') else 'Blog',
            'description': '',
            'link': url,
            'posts': posts
        }
    
    def detect_new_posts(self, old_posts, new_posts):
        """Detect new posts by comparing old and new post lists"""
        if not old_posts:
            return new_posts  # All posts are new if no old posts exist
        
        # Create sets of post identifiers for comparison
        old_post_ids = set()
        for post in old_posts:
            # Use title + link as unique identifier
            post_id = f"{post.get('title', '')}{post.get('link', '')}"
            old_post_ids.add(post_id)
        
        new_posts_detected = []
        for post in new_posts:
            post_id = f"{post.get('title', '')}{post.get('link', '')}"
            if post_id not in old_post_ids:
                new_posts_detected.append(post)
        
        return new_posts_detected
