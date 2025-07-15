
import { Button } from '@/components/ui/button'
import { useLambdaTrigger } from '@/hooks/useLambdaTrigger'
import { Loader2, Zap } from 'lucide-react'

export const LambdaTriggerButton = () => {
  const { triggerLambda, isLoading } = useLambdaTrigger()

  return (
    <Button
      onClick={triggerLambda}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Zap className="h-4 w-4" />
      )}
      {isLoading ? 'Triggering...' : 'Manual Trigger Lambda'}
    </Button>
  )
}
