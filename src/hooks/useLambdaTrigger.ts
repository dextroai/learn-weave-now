
import { useState } from 'react'
import { toast } from 'sonner'

export const useLambdaTrigger = () => {
  const [isLoading, setIsLoading] = useState(false)

  const triggerLambda = async () => {
    setIsLoading(true)
    try {
      // This would typically call an API Gateway endpoint that triggers the Lambda
      // For now, we'll just show a message about the manual trigger
      toast.info('Lambda function would be triggered here. Set up API Gateway to enable manual triggers.')
      
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Manual trigger request sent')
      return { success: true, message: 'Manual trigger completed' }
    } catch (error: any) {
      console.error('Error triggering Lambda:', error)
      toast.error(error.message || 'Failed to trigger Lambda function')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    triggerLambda,
    isLoading
  }
}
