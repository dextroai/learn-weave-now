
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export const useBlogMonitor = () => {
  const [isLoading, setIsLoading] = useState(false)

  const addBlog = async (url: string, name?: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('add-blog', {
        body: { url, name }
      })

      if (error) throw error

      toast.success(data.message)
      return data.blog
    } catch (error: any) {
      console.error('Error adding blog:', error)
      toast.error(error.message || 'Failed to add blog')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const triggerBlogCheck = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('blog-monitor', {
        body: { action: 'check' }
      })

      if (error) throw error

      toast.success(`Blog check completed: ${data.checked} blogs checked, ${data.updated} updated`)
      return data
    } catch (error: any) {
      console.error('Error triggering blog check:', error)
      toast.error(error.message || 'Failed to trigger blog check')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const testBlogMonitor = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('blog-monitor', {
        body: { action: 'test' }
      })

      if (error) throw error

      toast.success(`Blog monitor is running - ${data.activeBlogs} active blogs`)
      return data
    } catch (error: any) {
      console.error('Error testing blog monitor:', error)
      toast.error(error.message || 'Failed to test blog monitor')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    addBlog,
    triggerBlogCheck,
    testBlogMonitor,
    isLoading
  }
}
