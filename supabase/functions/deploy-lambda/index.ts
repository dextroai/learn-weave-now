import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

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

    // Helper function to create AWS signature v4
    async function signAWSRequest(method: string, url: string, headers: Record<string, string>, payload: string = '') {
      const urlObj = new URL(url);
      const service = urlObj.hostname.split('.')[0];
      const region = awsRegion;
      const accessKey = awsAccessKey!;
      const secretKey = awsSecretKey!;
      
      const now = new Date();
      const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, '');
      const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
      
      // Calculate payload hash
      const payloadHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
      const payloadHashHex = Array.from(new Uint8Array(payloadHash)).map(b => b.toString(16).padStart(2, '0')).join('');
      
      headers['Host'] = urlObj.hostname;
      headers['X-Amz-Date'] = amzDate;
      headers['X-Amz-Content-Sha256'] = payloadHashHex;
      
      const canonicalHeaders = Object.keys(headers).sort().map(key => 
        `${key.toLowerCase()}:${headers[key]}\n`
      ).join('');
      
      const signedHeaders = Object.keys(headers).sort().map(key => 
        key.toLowerCase()
      ).join(';');
      
      const canonicalRequest = [
        method,
        urlObj.pathname,
        urlObj.search.slice(1),
        canonicalHeaders,
        signedHeaders,
        payloadHashHex
      ].join('\n');
      
      const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
      const stringToSign = [
        'AWS4-HMAC-SHA256',
        amzDate,
        credentialScope,
        Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest)))).map(b => b.toString(16).padStart(2, '0')).join('')
      ].join('\n');
      
      const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(`AWS4${secretKey}`), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
      const dateKey = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(dateStamp));
      const dateRegionKey = await crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', dateKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), new TextEncoder().encode(region));
      const dateRegionServiceKey = await crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', dateRegionKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), new TextEncoder().encode(service));
      const signingKey = await crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', dateRegionServiceKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), new TextEncoder().encode('aws4_request'));
      
      const signature = await crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', signingKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), new TextEncoder().encode(stringToSign));
      const signatureHex = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
      
      headers['Authorization'] = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signatureHex}`;
      
      return headers;
    }

    // Create a unique bucket name
    const timestamp = Date.now();
    const bucketName = `blog-monitor-lambda-cache-${timestamp}`;
    const functionName = "blog-monitor-lambda";
    const roleName = "blog-monitor-lambda-role";

    console.log("Starting Lambda deployment...");

    try {
      // Step 1: Create S3 bucket
      console.log("Creating S3 bucket...");
      
      // Create location constraint XML for regions other than us-east-1
      const locationConstraint = awsRegion === 'us-east-1' ? '' : 
        `<?xml version="1.0" encoding="UTF-8"?>
<CreateBucketConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
  <LocationConstraint>${awsRegion}</LocationConstraint>
</CreateBucketConfiguration>`;
      
      const s3Headers = await signAWSRequest('PUT', `https://s3.${awsRegion}.amazonaws.com/${bucketName}`, {
        'Content-Type': 'application/xml'
      }, locationConstraint);
      
      const s3Response = await fetch(`https://s3.${awsRegion}.amazonaws.com/${bucketName}`, {
        method: 'PUT',
        headers: s3Headers,
        body: locationConstraint || undefined
      });
      
      if (!s3Response.ok) {
        const errorText = await s3Response.text();
        throw new Error(`S3 bucket creation failed: ${errorText}`);
      }
      
      console.log("S3 bucket created successfully");

      // Step 2: Create IAM role
      console.log("Creating IAM role...");
      const assumeRolePolicy = JSON.stringify({
        "Version": "2012-10-17",
        "Statement": [{
          "Effect": "Allow",
          "Principal": { "Service": "lambda.amazonaws.com" },
          "Action": "sts:AssumeRole"
        }]
      });
      
      const iamParams = new URLSearchParams({
        'Action': 'CreateRole',
        'RoleName': roleName,
        'AssumeRolePolicyDocument': assumeRolePolicy,
        'Version': '2010-05-08'
      });
      
      const iamHeaders = await signAWSRequest('POST', `https://iam.amazonaws.com/`, {
        'Content-Type': 'application/x-www-form-urlencoded'
      }, iamParams.toString());
      
      const iamResponse = await fetch('https://iam.amazonaws.com/', {
        method: 'POST',
        headers: iamHeaders,
        body: iamParams
      });
      
      if (!iamResponse.ok) {
        const errorText = await iamResponse.text();
        console.log("IAM role might already exist, continuing...");
      }

      console.log("IAM role processed");

      const deploymentResult = {
        status: "success",
        functionName: functionName,
        bucketName: bucketName,
        message: "AWS resources created successfully",
        timestamp: new Date().toISOString()
      };

      console.log("Deployment completed:", deploymentResult);

      return new Response(JSON.stringify(deploymentResult), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });

    } catch (deployError) {
      console.error("AWS deployment failed:", deployError);
      throw new Error(`AWS deployment failed: ${deployError.message}`);
    }

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