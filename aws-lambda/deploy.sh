
#!/bin/bash

# Blog Monitor AWS Lambda Deployment Script

echo "🚀 Deploying Blog Monitor Lambda Function..."

# Check if required environment variables are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: Required environment variables not set"
    echo "Please set: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
    echo "Optional: NOTIFICATION_EMAIL (for email notifications)"
    exit 1
fi

# Install serverless framework if not installed
if ! command -v serverless &> /dev/null; then
    echo "📦 Installing Serverless Framework..."
    npm install -g serverless
fi

# Install serverless plugins
echo "📦 Installing Serverless plugins..."
npm install serverless-python-requirements

# Deploy the function
echo "🚀 Deploying to AWS Lambda..."
serverless deploy --stage prod

echo "✅ Deployment completed!"
echo "📊 The function will run daily to check all blogs for new posts"
echo "💾 Cache will be stored in S3"
echo "📧 Notifications will be sent via SES"
