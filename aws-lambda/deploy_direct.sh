#!/bin/bash

# Direct AWS Lambda Deployment Script (No npm required)

echo "🚀 Deploying Blog Monitor Lambda Function directly via AWS CLI..."

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
    exit 1
fi

# Create deployment package
echo "📦 Creating deployment package..."
pip install -r requirements.txt -t ./package/
cp *.py ./package/

# Create S3 bucket for cache (if it doesn't exist)
BUCKET_NAME="blog-monitor-lambda-cache-$(date +%s)"
echo "🪣 Creating S3 bucket: $BUCKET_NAME"
aws s3 mb s3://$BUCKET_NAME

# Create zip file
echo "🗜️ Creating deployment zip..."
cd package
zip -r ../blog-monitor-lambda.zip .
cd ..

# Create IAM role for Lambda
echo "👤 Creating IAM role..."
aws iam create-role --role-name blog-monitor-lambda-role --assume-role-policy-document '{
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
}'

# Attach policies
aws iam attach-role-policy --role-name blog-monitor-lambda-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
aws iam attach-role-policy --role-name blog-monitor-lambda-role --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

# Wait for role to be ready
echo "⏳ Waiting for IAM role to be ready..."
sleep 10

# Get account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Create Lambda function
echo "⚡ Creating Lambda function..."
aws lambda create-function \
  --function-name blog-monitor-lambda \
  --runtime python3.9 \
  --role arn:aws:iam::$ACCOUNT_ID:role/blog-monitor-lambda-role \
  --handler blog_monitor_lambda.lambda_handler \
  --zip-file fileb://blog-monitor-lambda.zip \
  --timeout 900 \
  --memory-size 512 \
  --environment Variables="{
    SUPABASE_URL=$SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY,
    CACHE_BUCKET_NAME=$BUCKET_NAME,
    NOTIFICATION_EMAIL=$NOTIFICATION_EMAIL,
    SMTP_SERVER=$SMTP_SERVER,
    SMTP_PORT=$SMTP_PORT,
    SMTP_USERNAME=$SMTP_USERNAME,
    SMTP_PASSWORD=$SMTP_PASSWORD
  }"

# Create EventBridge rule for daily execution
echo "⏰ Setting up daily schedule..."
aws events put-rule \
  --name blog-monitor-daily \
  --schedule-expression "rate(1 day)"

# Add permission for EventBridge to invoke Lambda
aws lambda add-permission \
  --function-name blog-monitor-lambda \
  --statement-id allow-eventbridge \
  --action lambda:InvokeFunction \
  --principal events.amazonaws.com \
  --source-arn arn:aws:events:$AWS_REGION:$ACCOUNT_ID:rule/blog-monitor-daily

# Add Lambda as target to EventBridge rule
aws events put-targets \
  --rule blog-monitor-daily \
  --targets "Id"="1","Arn"="arn:aws:lambda:$AWS_REGION:$ACCOUNT_ID:function:blog-monitor-lambda"

echo "✅ Deployment completed!"
echo "📊 Function: blog-monitor-lambda"
echo "🪣 S3 Bucket: $BUCKET_NAME"
echo "⏰ Schedule: Daily execution"

# Cleanup
rm -rf package/
rm blog-monitor-lambda.zip