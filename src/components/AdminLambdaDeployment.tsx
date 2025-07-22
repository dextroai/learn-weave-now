import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useUserRole";
import { Loader2, Cloud, AlertCircle, CheckCircle } from "lucide-react";

interface DeploymentResult {
  status: string;
  functionName: string;
  bucketName: string;
  message: string;
  timestamp: string;
}

export const AdminLambdaDeployment = () => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { isAdmin } = useIsAdmin();

  // Don't render for non-admin users
  if (!isAdmin) {
    return null;
  }

  const handleDeploy = async () => {
    setIsDeploying(true);
    setError(null);
    setDeploymentResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`https://tegrczsitmyzpzzgeicv.supabase.co/functions/v1/deploy-lambda`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Deployment failed");
      }

      const result: DeploymentResult = await response.json();
      setDeploymentResult(result);
      
      toast({
        title: "Deployment Successful",
        description: "AWS Lambda function has been deployed successfully.",
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Deployment Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          <CardTitle>AWS Lambda Deployment</CardTitle>
          <Badge variant="secondary">Admin Only</Badge>
        </div>
        <CardDescription>
          Deploy the blog monitoring Lambda function to AWS. This will create the function, 
          S3 bucket for caching, and set up daily scheduling.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Button 
          onClick={handleDeploy} 
          disabled={isDeploying}
          className="w-full"
          size="lg"
        >
          {isDeploying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deploying Lambda Function...
            </>
          ) : (
            <>
              <Cloud className="mr-2 h-4 w-4" />
              Deploy to AWS Lambda
            </>
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {deploymentResult && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div><strong>Status:</strong> {deploymentResult.status}</div>
                <div><strong>Function Name:</strong> {deploymentResult.functionName}</div>
                <div><strong>S3 Bucket:</strong> {deploymentResult.bucketName}</div>
                <div><strong>Deployed At:</strong> {new Date(deploymentResult.timestamp).toLocaleString()}</div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground">
          <p><strong>Requirements:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>AWS credentials must be configured in Supabase secrets</li>
            <li>Supabase URL and Service Role Key must be set</li>
            <li>Admin role is required to perform deployment</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};