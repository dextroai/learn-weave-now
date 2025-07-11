
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BlogPost {
  title: string
  link: string
  published: string
  summary: string
  content?: string
}

interface BlogData {
  title: string
  description: string
  link: string
  posts: BlogPost[]
}

class BlogMonitorService {
  private supabase: any
  private readonly BATCH_SIZE = 2 // Reduced batch size for memory management
  private readonly MAX_POSTS_PER_BLOG = 3 // Further reduced
  private readonly MAX_CONTENT_LENGTH = 800 // Reduced content size

  constructor() {
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
  }

  async fetchBlogContent(url: string): Promise<BlogData | null> {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }

    try {
      console.log(`Fetching content from: ${url}`)
      
      // Try RSS/Atom feeds first
      const feedUrls = [
        `${url}/feed`,
        `${url}/rss`,
        `${url}/atom.xml`,
        `${url}/feed.xml`,
        `${url}/rss.xml`
      ]

      for (const feedUrl of feedUrls) {
        try {
          const response = await fetch(feedUrl, { 
            headers,
            signal: AbortSignal.timeout(8000) // Reduced timeout
          })
          if (response.ok) {
            const feedText = await response.text()
            const limitedFeedText = feedText.length > 30000 ? feedText.substring(0, 30000) : feedText
            const feedData = await this.parseFeedContent(limitedFeedText)
            if (feedData && feedData.posts.length > 0) {
              console.log(`Successfully parsed RSS feed: ${feedUrl}`)
              return feedData
            }
          }
        } catch (e) {
          console.log(`Failed to fetch RSS from ${feedUrl}: ${e.message}`)
          continue
        }
      }

      // Fallback to HTML scraping with smaller limits
      const response = await fetch(url, { 
        headers,
        signal: AbortSignal.timeout(8000)
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const html = await response.text()
      const limitedHtml = html.length > 50000 ? html.substring(0, 50000) : html
      return await this.parseHtmlContent(limitedHtml, url)

    } catch (error) {
      console.error(`Error fetching ${url}:`, error.message)
      return null
    }
  }

  async parseFeedContent(feedText: string): Promise<BlogData | null> {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(feedText, 'text/xml')
      
      if (!doc) {
        console.error('Failed to parse XML document')
        return null
      }
      
      const posts: BlogPost[] = []
      const items = doc.querySelectorAll('item, entry')
      
      for (const item of Array.from(items).slice(0, this.MAX_POSTS_PER_BLOG)) {
        const title = item.querySelector('title')?.textContent || 'No Title'
        const linkEl = item.querySelector('link')
        const link = linkEl?.textContent || linkEl?.getAttribute('href') || ''
        const published = item.querySelector('pubDate, published')?.textContent || ''
        let summary = item.querySelector('description, summary, content')?.textContent || ''
        
        if (summary.length > this.MAX_CONTENT_LENGTH) {
          summary = summary.substring(0, this.MAX_CONTENT_LENGTH) + '...'
        }
        
        posts.push({ title, link, published, summary })
      }

      const feedTitle = doc.querySelector('channel > title, feed > title')?.textContent || 'Blog'
      const feedDescription = doc.querySelector('channel > description, feed > subtitle')?.textContent || ''
      const feedLinkEl = doc.querySelector('channel > link, feed > link')
      const feedLink = feedLinkEl?.textContent || feedLinkEl?.getAttribute('href') || ''

      return {
        title: feedTitle,
        description: feedDescription,
        link: feedLink,
        posts
      }
    } catch (error) {
      console.error('Error parsing feed:', error)
      return null
    }
  }

  async parseHtmlContent(html: string, url: string): Promise<BlogData | null> {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      
      if (!doc) {
        console.error('Failed to parse HTML document')
        return null
      }
      
      // Remove unwanted elements to reduce memory
      const unwantedSelectors = ['script', 'style', 'nav', 'footer', 'aside', 'iframe', 'video']
      unwantedSelectors.forEach(selector => {
        doc.querySelectorAll(selector).forEach(el => el.remove())
      })

      const posts: BlogPost[] = []
      const postSelectors = ['article', '.post', '.entry', '.blog-post', '[class*="post"]']
      
      for (const selector of postSelectors) {
        const elements = doc.querySelectorAll(selector)
        if (elements.length > 0) {
          for (const element of Array.from(elements).slice(0, this.MAX_POSTS_PER_BLOG)) {
            const titleEl = element.querySelector('h1, h2, h3, .title, .post-title')
            const title = titleEl?.textContent?.trim() || 'No Title'
            
            const linkEl = element.querySelector('a')
            let link = linkEl?.getAttribute('href') || ''
            if (link && !link.startsWith('http')) {
              const baseUrl = new URL(url)
              link = new URL(link, baseUrl.origin).href
            }
            
            let content = element.textContent?.trim() || ''
            if (content.length > this.MAX_CONTENT_LENGTH) {
              content = content.substring(0, this.MAX_CONTENT_LENGTH) + '...'
            }
            const summary = content
            
            posts.push({ title, link, published: '', summary })
          }
          break
        }
      }

      const title = doc.querySelector('title')?.textContent || 'Blog'
      
      return {
        title,
        description: '',
        link: url,
        posts
      }
    } catch (error) {
      console.error('Error parsing HTML:', error)
      return null
    }
  }

  // Get active blogs from admin_blogs table (centralized)
  async getActiveBlogs() {
    const { data: blogs, error } = await this.supabase
      .from('admin_blogs')
      .select('*')
      .eq('is_active', true)
      .limit(15) // Further limited

    if (error) {
      console.error('Error fetching admin blogs:', error)
      return []
    }

    return blogs || []
  }

  // Get user blogs that match the admin blog URL for propagating updates
  async getUserBlogsForUrl(url: string) {
    const { data: userBlogs, error } = await this.supabase
      .from('blogs')
      .select('*')
      .eq('url', url)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching user blogs for URL:', error)
      return []
    }

    return userBlogs || []
  }

  async getPreviousPosts(blogId: string): Promise<BlogPost[]> {
    const { data: posts, error } = await this.supabase
      .from('blog_posts')
      .select('title, link, published_date, summary, content')
      .eq('blog_id', blogId)
      .order('created_at', { ascending: false })
      .limit(15) // Reduced

    if (error) {
      console.error('Error fetching previous posts:', error)
      return []
    }

    return posts?.map(post => ({
      title: post.title,
      link: post.link || '',
      published: post.published_date || '',
      summary: post.summary || '',
      content: post.content || ''
    })) || []
  }

  detectNewPosts(oldPosts: BlogPost[], newPosts: BlogPost[]): BlogPost[] {
    if (!oldPosts.length) {
      return newPosts
    }

    const oldPostIds = new Set(
      oldPosts.map(post => `${post.title}${post.link}`)
    )

    return newPosts.filter(post => {
      const postId = `${post.title}${post.link}`
      return !oldPostIds.has(postId)
    })
  }

  // Save posts to ALL user blogs that have this URL
  async saveBlogPostsToUserBlogs(userBlogs: any[], posts: BlogPost[]) {
    for (const userBlog of userBlogs) {
      const postsToInsert = posts.map(post => ({
        blog_id: userBlog.id,
        title: post.title,
        link: post.link || null,
        published_date: post.published || null,
        summary: post.summary || null,
        content: post.content || null,
        is_new: true,
        detected_at: new Date().toISOString()
      }))

      const { error } = await this.supabase
        .from('blog_posts')
        .insert(postsToInsert)

      if (error) {
        console.error(`Error saving blog posts for user blog ${userBlog.id}:`, error)
      } else {
        console.log(`Saved ${posts.length} new posts for user blog ${userBlog.id} (user: ${userBlog.user_id})`)
      }
    }
  }

  async updateAdminBlogLastChecked(adminBlogId: string) {
    const { error } = await this.supabase
      .from('admin_blogs')
      .update({ 
        last_checked: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', adminBlogId)

    if (error) {
      console.error('Error updating admin blog last_checked:', error)
    }
  }

  async updateUserBlogsLastChecked(url: string) {
    const { error } = await this.supabase
      .from('blogs')
      .update({ 
        last_checked: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('url', url)

    if (error) {
      console.error('Error updating user blogs last_checked:', error)
    }
  }

  async sendNotification(blogName: string, blogUrl: string, newPosts: BlogPost[], affectedUsers: number) {
    console.log(`📧 Notification: ${newPosts.length} new posts found in ${blogName}`)
    console.log(`Blog URL: ${blogUrl}`)
    console.log(`Affected users: ${affectedUsers}`)
    newPosts.forEach((post, i) => {
      console.log(`${i + 1}. ${post.title}`)
      if (post.link) console.log(`   Link: ${post.link}`)
    })
  }

  async checkAdminBlog(adminBlog: any): Promise<boolean> {
    console.log(`Checking admin blog: ${adminBlog.name} (${adminBlog.url})`)

    try {
      const blogData = await this.fetchBlogContent(adminBlog.url)
      if (!blogData) {
        console.log(`Failed to fetch content for ${adminBlog.name}`)
        await this.updateAdminBlogLastChecked(adminBlog.id)
        return false
      }

      // Get all user blogs that have this URL
      const userBlogs = await this.getUserBlogsForUrl(adminBlog.url)
      console.log(`Found ${userBlogs.length} user blogs for URL: ${adminBlog.url}`)

      if (userBlogs.length === 0) {
        console.log(`No user blogs found for ${adminBlog.url}, skipping...`)
        await this.updateAdminBlogLastChecked(adminBlog.id)
        return false
      }

      // Check for new posts using the first user blog as reference
      const firstUserBlog = userBlogs[0]
      const previousPosts = await this.getPreviousPosts(firstUserBlog.id)
      const newPosts = this.detectNewPosts(previousPosts, blogData.posts)

      if (newPosts.length > 0) {
        console.log(`Found ${newPosts.length} new posts in ${adminBlog.name}`)
        
        // Save new posts to ALL user blogs that have this URL
        await this.saveBlogPostsToUserBlogs(userBlogs, newPosts)
        await this.sendNotification(adminBlog.name, adminBlog.url, newPosts, userBlogs.length)
        await this.updateAdminBlogLastChecked(adminBlog.id)
        await this.updateUserBlogsLastChecked(adminBlog.url)
        
        return true
      } else if (previousPosts.length === 0) {
        console.log(`Initial check for ${adminBlog.name} - saving ${blogData.posts.length} posts`)
        await this.saveBlogPostsToUserBlogs(userBlogs, blogData.posts)
        await this.updateAdminBlogLastChecked(adminBlog.id)
        await this.updateUserBlogsLastChecked(adminBlog.url)
        return true
      } else {
        console.log(`No new posts found in ${adminBlog.name}`)
        await this.updateAdminBlogLastChecked(adminBlog.id)
        await this.updateUserBlogsLastChecked(adminBlog.url)
        return false
      }
    } catch (error) {
      console.error(`Error checking admin blog ${adminBlog.name}:`, error)
      await this.updateAdminBlogLastChecked(adminBlog.id)
      return false
    }
  }

  async checkAllBlogs() {
    console.log('Starting centralized blog check cycle')
    
    const adminBlogs = await this.getActiveBlogs()
    console.log(`Found ${adminBlogs.length} active admin blogs to check`)

    let checkedCount = 0
    let updatedCount = 0

    // Process blogs in smaller batches
    for (let i = 0; i < adminBlogs.length; i += this.BATCH_SIZE) {
      const batch = adminBlogs.slice(i, i + this.BATCH_SIZE)
      console.log(`Processing batch ${Math.floor(i / this.BATCH_SIZE) + 1} with ${batch.length} blogs`)

      for (const adminBlog of batch) {
        try {
          const hasUpdates = await this.checkAdminBlog(adminBlog)
          checkedCount++
          if (hasUpdates) updatedCount++
          
          // Delay between blogs for memory management
          await new Promise(resolve => setTimeout(resolve, 2000))
        } catch (error) {
          console.error(`Error checking ${adminBlog.name}:`, error)
        }
      }

      // Longer delay between batches
      if (i + this.BATCH_SIZE < adminBlogs.length) {
        console.log('Waiting between batches for memory cleanup...')
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }

    console.log(`Centralized blog check completed: ${checkedCount} checked, ${updatedCount} updated`)
    
    return {
      checked: checkedCount,
      updated: updatedCount,
      total: adminBlogs.length
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'check'

    const monitor = new BlogMonitorService()

    let result
    switch (action) {
      case 'check':
        result = await monitor.checkAllBlogs()
        break
      case 'test':
        const blogs = await monitor.getActiveBlogs()
        result = { message: 'Centralized monitoring service is running', activeBlogs: blogs.length }
        break
      default:
        result = { error: 'Unknown action' }
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    )

  } catch (error) {
    console.error('Error in blog-monitor function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    )
  }
})
