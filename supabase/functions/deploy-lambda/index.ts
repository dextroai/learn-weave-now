import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Lambda } from "https://aws-api.deno.dev/v0.4/services/lambda.ts";
import { IAM } from "https://aws-api.deno.dev/v0.4/services/iam.ts";
import { S3 } from "https://aws-api.deno.dev/v0.4/services/s3.ts";
import { EventBridge } from "https://aws-api.deno.dev/v0.4/services/eventbridge.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user has admin role
    const { data: userRoles, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");

    if (roleError || !userRoles || userRoles.length === 0) {
      throw new Error("Admin access required");
    }

    // AWS deployment logic
    const awsAccessKey = Deno.env.get("AWS_ACCESS_KEY_ID");
    const awsSecretKey = Deno.env.get("AWS_SECRET_ACCESS_KEY");
    const awsRegion = Deno.env.get("AWS_REGION") || "us-east-1";

    if (!awsAccessKey || !awsSecretKey) {
      throw new Error("AWS credentials not configured");
    }

    // Initialize AWS clients
    const lambda = new Lambda({
      region: awsRegion,
      credentials: {
        accessKeyId: awsAccessKey,
        secretAccessKey: awsSecretKey,
      },
    });

    const iam = new IAM({
      region: awsRegion,
      credentials: {
        accessKeyId: awsAccessKey,
        secretAccessKey: awsSecretKey,
      },
    });

    const s3 = new S3({
      region: awsRegion,
      credentials: {
        accessKeyId: awsAccessKey,
        secretAccessKey: awsSecretKey,
      },
    });

    const eventBridge = new EventBridge({
      region: awsRegion,
      credentials: {
        accessKeyId: awsAccessKey,
        secretAccessKey: awsSecretKey,
      },
    });

    // Create a unique bucket name
    const timestamp = Date.now();
    const bucketName = `blog-monitor-lambda-cache-${timestamp}`;
    const functionName = "blog-monitor-lambda";
    const roleName = "blog-monitor-lambda-role";

    console.log("Starting Lambda deployment...");

    try {
      // Step 1: Create S3 bucket for cache
      console.log("Creating S3 bucket...");
      await s3.createBucket({
        Bucket: bucketName,
      });

      // Step 2: Create IAM role
      console.log("Creating IAM role...");
      const assumeRolePolicy = {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Principal": {
              "Service": "lambda.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
          }
        ]
      };

      const roleResponse = await iam.createRole({
        RoleName: roleName,
        AssumeRolePolicyDocument: JSON.stringify(assumeRolePolicy),
      });

      // Attach policies
      await iam.attachRolePolicy({
        RoleName: roleName,
        PolicyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
      });

      await iam.attachRolePolicy({
        RoleName: roleName,
        PolicyArn: "arn:aws:iam::aws:policy/AmazonS3FullAccess",
      });

      // Wait for role to be ready
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Step 3: Create Lambda function with placeholder code
      console.log("Creating Lambda function...");
      const lambdaCode = `
import json

def lambda_handler(event, context):
    print("Blog monitor Lambda function executed")
    return {
        'statusCode': 200,
        'body': json.dumps('Blog monitor executed successfully')
    }
`;

      const zipData = new Uint8Array([
        0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
        // ... minimal zip file with Python code
      ]);

      await lambda.createFunction({
        FunctionName: functionName,
        Runtime: "python3.9",
        Role: roleResponse.Role?.Arn!,
        Handler: "blog_monitor_lambda.lambda_handler",
        Code: {
          ZipFile: zipData,
        },
        Timeout: 900,
        MemorySize: 512,
        Environment: {
          Variables: {
            SUPABASE_URL: Deno.env.get("SUPABASE_URL") ?? "",
            SUPABASE_SERVICE_ROLE_KEY: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
            CACHE_BUCKET_NAME: bucketName,
          },
        },
      });

      // Step 4: Set up EventBridge schedule
      console.log("Setting up daily schedule...");
      await eventBridge.putRule({
        Name: "blog-monitor-daily",
        ScheduleExpression: "rate(1 day)",
      });

      // Add permission for EventBridge to invoke Lambda
      await lambda.addPermission({
        FunctionName: functionName,
        StatementId: "allow-eventbridge",
        Action: "lambda:InvokeFunction",
        Principal: "events.amazonaws.com",
      });

      const deploymentResult = {
        status: "success",
        functionName: functionName,
        bucketName: bucketName,
        message: "Lambda function deployed successfully",
        timestamp: new Date().toISOString()
      };

      console.log("Deployment completed:", deploymentResult);
    } catch (deployError) {
      console.error("Deployment failed:", deployError);
      throw new Error(`Deployment failed: ${deployError.message}`);
    }

    return new Response(JSON.stringify(deploymentResult), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    console.error("Deployment error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});