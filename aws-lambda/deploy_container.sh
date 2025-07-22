#!/bin/bash

# Containerized AWS Lambda Deployment Script

echo "🚀 Deploying Blog Monitor Lambda Function using Docker Container..."

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
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ] || [ -z "$AWS_REGION" ]; then
    echo "❌ Error: Required environment variables not set in .env file"
    exit 1
fi

# Set variables
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REPOSITORY_NAME="blog-monitor-lambda"
IMAGE_TAG="latest"
FUNCTION_NAME="blog-monitor-lambda"
ROLE_NAME="blog-monitor-lambda-role"
CACHE_BUCKET="blog-monitor-lambda-cache-$(date +%s)"

echo "📋 Deployment Configuration:"
echo "   AWS Account ID: $ACCOUNT_ID"
echo "   AWS Region: $AWS_REGION"
echo "   ECR Repository: $REPOSITORY_NAME"
echo "   Function Name: $FUNCTION_NAME"
echo "   Cache Bucket: $CACHE_BUCKET"

# Step 1: Create ECR repository
echo "🏗️  Creating ECR repository..."
aws ecr create-repository \
    --repository-name $REPOSITORY_NAME \
    --region $AWS_REGION \
    --image-scanning-configuration scanOnPush=true \
    --image-tag-mutability MUTABLE \
    2>/dev/null || echo "Repository might already exist, continuing..."

# Get the repository URI
REPOSITORY_URI="$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPOSITORY_NAME"
echo "📦 Repository URI: $REPOSITORY_URI"

# Step 2: Login to ECR
echo "🔐 Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $REPOSITORY_URI

# Step 3: Build Docker image
echo "🐳 Building Docker image..."
docker build -t $REPOSITORY_NAME:$IMAGE_TAG .

# Step 4: Tag image for ECR
echo "🏷️  Tagging image for ECR..."
docker tag $REPOSITORY_NAME:$IMAGE_TAG $REPOSITORY_URI:$IMAGE_TAG

# Step 5: Push image to ECR
echo "⬆️  Pushing image to ECR..."
docker push $REPOSITORY_URI:$IMAGE_TAG

# Step 6: Create S3 bucket for cache
echo "🪣 Creating S3 bucket for cache..."
aws s3 mb s3://$CACHE_BUCKET --region $AWS_REGION

# Step 7: Create IAM role
echo "👤 Creating IAM role..."
aws iam create-role --role-name $ROLE_NAME --assume-role-policy-document '{
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
}' 2>/dev/null || echo "Role might already exist, continuing..."

# Attach policies
aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

# Step 8: Wait for role to be ready
echo "⏳ Waiting for IAM role to be ready..."
sleep 15

# Step 9: Create or update Lambda function
echo "⚡ Creating/updating Lambda function..."
aws lambda create-function \
    --function-name $FUNCTION_NAME \
    --package-type Image \
    --code ImageUri=$REPOSITORY_URI:$IMAGE_TAG \
    --role arn:aws:iam::$ACCOUNT_ID:role/$ROLE_NAME \
    --timeout 900 \
    --memory-size 512 \
    --environment Variables="{
        SUPABASE_URL=$SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY,
        CACHE_BUCKET_NAME=$CACHE_BUCKET,
        NOTIFICATION_EMAIL=$NOTIFICATION_EMAIL,
        SMTP_SERVER=$SMTP_SERVER,
        SMTP_PORT=$SMTP_PORT,
        SMTP_USERNAME=$SMTP_USERNAME,
        SMTP_PASSWORD=$SMTP_PASSWORD
    }" \
    2>/dev/null || {
        echo "Function exists, updating code..."
        aws lambda update-function-code \
            --function-name $FUNCTION_NAME \
            --image-uri $REPOSITORY_URI:$IMAGE_TAG
        
        aws lambda update-function-configuration \
            --function-name $FUNCTION_NAME \
            --environment Variables="{
                SUPABASE_URL=$SUPABASE_URL,
                SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY,
                CACHE_BUCKET_NAME=$CACHE_BUCKET,
                NOTIFICATION_EMAIL=$NOTIFICATION_EMAIL,
                SMTP_SERVER=$SMTP_SERVER,
                SMTP_PORT=$SMTP_PORT,
                SMTP_USERNAME=$SMTP_USERNAME,
                SMTP_PASSWORD=$SMTP_PASSWORD
            }"
    }

# Step 10: Create EventBridge rule for daily execution
echo "⏰ Setting up daily schedule..."
aws events put-rule \
    --name blog-monitor-daily \
    --schedule-expression "rate(1 day)" \
    --region $AWS_REGION

# Add permission for EventBridge to invoke Lambda
aws lambda add-permission \
    --function-name $FUNCTION_NAME \
    --statement-id allow-eventbridge \
    --action lambda:InvokeFunction \
    --principal events.amazonaws.com \
    --source-arn arn:aws:events:$AWS_REGION:$ACCOUNT_ID:rule/blog-monitor-daily \
    2>/dev/null || echo "Permission might already exist, continuing..."

# Add Lambda as target to EventBridge rule
aws events put-targets \
    --rule blog-monitor-daily \
    --targets "Id"="1","Arn"="arn:aws:lambda:$AWS_REGION:$ACCOUNT_ID:function:$FUNCTION_NAME" \
    --region $AWS_REGION

echo ""
echo "✅ Containerized deployment completed successfully!"
echo ""
echo "📊 Deployment Summary:"
echo "   🐳 Docker Image: $REPOSITORY_URI:$IMAGE_TAG"
echo "   ⚡ Lambda Function: $FUNCTION_NAME"
echo "   🪣 S3 Cache Bucket: $CACHE_BUCKET"
echo "   ⏰ Schedule: Daily execution via EventBridge"
echo ""
echo "🔗 Useful AWS Console Links:"
echo "   ECR Repository: https://console.aws.amazon.com/ecr/repositories/$REPOSITORY_NAME"
echo "   Lambda Function: https://console.aws.amazon.com/lambda/home?region=$AWS_REGION#/functions/$FUNCTION_NAME"
echo "   S3 Bucket: https://s3.console.aws.amazon.com/s3/buckets/$CACHE_BUCKET"
echo ""
echo "🧪 Test your Lambda function:"
echo "   aws lambda invoke --function-name $FUNCTION_NAME output.json"