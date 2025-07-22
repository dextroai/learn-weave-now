
#!/bin/bash

# Blog Monitor AWS Lambda Deployment Script

echo "🚀 Deploying Blog Monitor Lambda Function..."

# Load environment variables from .env file
if [ -f .env ]; then
    echo "📄 Loading environment variables from .env file..."
    export $(cat .env | sed 's/#.*//g' | xargs)
else
    echo "❌ Error: .env file not found"
    echo "Please copy .env.example to .env and fill in your values"
    exit 1
fi

# Check if required environment variables are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: Required environment variables not set in .env file"
    echo "Please set: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
    echo "Optional: NOTIFICATION_EMAIL, SMTP_USERNAME, SMTP_PASSWORD"
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
echo "📧 Notifications will be sent via SMTP (Gmail)"
echo ""
echo "🔧 Configuration:"
echo "✅ Environment variables loaded from .env file"
echo "📄 Update .env file to modify configuration"
echo "📧 Email notifications: ${NOTIFICATION_EMAIL:-'Not configured'}"
