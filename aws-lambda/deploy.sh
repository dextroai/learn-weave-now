
#!/bin/bash

# Blog Monitor AWS Lambda Deployment Script

echo "🚀 Deploying Blog Monitor Lambda Function..."

# Check if required environment variables are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: Required environment variables not set"
    echo "Please set: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
    echo "Optional: NOTIFICATION_EMAIL, SMTP_USERNAME, SMTP_PASSWORD"
    echo "SMTP Settings: SMTP_SERVER (default: smtp.gmail.com), SMTP_PORT (default: 587)"
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
echo "🔧 Required Environment Variables:"
echo "- SUPABASE_URL: Your Supabase project URL"
echo "- SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key"
echo ""
echo "📧 Optional Email Notification Variables:"
echo "- NOTIFICATION_EMAIL: Email to receive notifications"
echo "- SMTP_USERNAME: Your Gmail address (vaibhawkhemka6@gmail.com)"
echo "- SMTP_PASSWORD: Your Gmail app password (fooz nssj jief afzs)"
echo "- SMTP_SERVER: SMTP server (default: smtp.gmail.com)"
echo "- SMTP_PORT: SMTP port (default: 587)"
