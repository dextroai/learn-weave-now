
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useBlogMonitor } from '@/hooks/useBlogMonitor'
import { LambdaTriggerButton } from '@/components/LambdaTriggerButton'
import { Loader2, Plus, TestTube, Activity } from 'lucide-react'
import { toast } from 'sonner'

export const BlogMonitorDashboard = () => {
  const [newBlogUrl, setNewBlogUrl] = useState('')
  const { addBlog, triggerBlogCheck, testBlogMonitor, isLoading } = useBlogMonitor()

  const handleAddBlog = async () => {
    if (!newBlogUrl.trim()) {
      toast.error('Please enter a blog URL')
      return
    }

    try {
      await addBlog(newBlogUrl.trim())
      setNewBlogUrl('')
    } catch (error) {
      console.error('Error adding blog:', error)
    }
  }

  const handleTriggerCheck = async () => {
    try {
      await triggerBlogCheck()
    } catch (error) {
      console.error('Error triggering blog check:', error)
    }
  }

  const handleTestMonitor = async () => {
    try {
      await testBlogMonitor()
    } catch (error) {
      console.error('Error testing blog monitor:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Blog Monitor Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Centralized blog monitoring with AWS Lambda integration
        </p>
      </div>

      {/* Add Blog Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Blog to Monitor
          </CardTitle>
          <CardDescription>
            Add a new blog URL to the centralized monitoring system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="blog-url">Blog URL</Label>
            <Input
              id="blog-url"
              type="url"
              placeholder="https://example.com"
              value={newBlogUrl}
              onChange={(e) => setNewBlogUrl(e.target.value)}
            />
          </div>
          <Button onClick={handleAddBlog} disabled={isLoading} className="gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add Blog
          </Button>
        </CardContent>
      </Card>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Monitor Controls
          </CardTitle>
          <CardDescription>
            Control and test the blog monitoring system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleTriggerCheck} disabled={isLoading} variant="outline" className="gap-2">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
              Trigger Check
            </Button>
            
            <Button onClick={handleTestMonitor} disabled={isLoading} variant="outline" className="gap-2">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />}
              Test Monitor
            </Button>

            <LambdaTriggerButton />
          </div>
          
          <div className="text-sm text-gray-600 mt-4">
            <p><strong>Trigger Check:</strong> Manually run the centralized blog monitoring</p>
            <p><strong>Test Monitor:</strong> Test the monitoring service status</p>
            <p><strong>Manual Trigger Lambda:</strong> Trigger the AWS Lambda function manually</p>
          </div>
        </CardContent>
      </Card>

      {/* Lambda Integration Info */}
      <Card>
        <CardHeader>
          <CardTitle>AWS Lambda Integration</CardTitle>
          <CardDescription>
            Information about the AWS Lambda blog monitoring setup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900">Schedule</h4>
              <p className="text-gray-600">Runs daily at scheduled time</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Storage</h4>
              <p className="text-gray-600">Cache stored in S3</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Notifications</h4>
              <p className="text-gray-600">Email via Amazon SES</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Database</h4>
              <p className="text-gray-600">Syncs with Supabase</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Deployment:</strong> Use the deployment script in the aws-lambda folder to deploy the function to AWS.
              Make sure to set the required environment variables before deployment.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
