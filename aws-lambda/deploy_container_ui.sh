#!/bin/bash

# Containerized Lambda Deployment Script for UI Integration
# This script can be called from the Supabase Edge Function

set -e  # Exit on any error

# Function to log with timestamp
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Function to handle errors
handle_error() {
    log "❌ Error: $1"
    exit 1
}

log "🚀 Starting containerized Lambda deployment..."

# Get AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text) || handle_error "Failed to get AWS account ID"

# Set deployment variables
REPOSITORY_NAME="blog-monitor-lambda"
IMAGE_TAG="latest"
FUNCTION_NAME="blog-monitor-lambda"
ROLE_NAME="blog-monitor-lambda-role"
CACHE_BUCKET="blog-monitor-lambda-cache-$(date +%s)"
REPOSITORY_URI="$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPOSITORY_NAME"

log "📋 Configuration: Account=$ACCOUNT_ID, Region=$AWS_REGION"

# Create ECR repository
log "🏗️  Creating ECR repository..."
aws ecr create-repository \
    --repository-name $REPOSITORY_NAME \
    --region $AWS_REGION \
    --image-scanning-configuration scanOnPush=true \
    2>/dev/null || log "Repository exists, continuing..."

# Login to ECR
log "🔐 Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $REPOSITORY_URI || handle_error "ECR login failed"

# Build and push Docker image
log "🐳 Building Docker image..."
docker build -t $REPOSITORY_NAME:$IMAGE_TAG . || handle_error "Docker build failed"

log "🏷️  Tagging and pushing image..."
docker tag $REPOSITORY_NAME:$IMAGE_TAG $REPOSITORY_URI:$IMAGE_TAG
docker push $REPOSITORY_URI:$IMAGE_TAG || handle_error "Docker push failed"

# Create S3 bucket
log "🪣 Creating S3 bucket..."
aws s3 mb s3://$CACHE_BUCKET --region $AWS_REGION || log "Bucket creation failed, might exist"

# Create IAM role
log "👤 Creating IAM role..."
aws iam create-role --role-name $ROLE_NAME --assume-role-policy-document '{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "lambda.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}' 2>/dev/null || log "Role exists, continuing..."

# Attach policies
aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole 2>/dev/null || true
aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess 2>/dev/null || true

# Wait for role propagation
log "⏳ Waiting for IAM role propagation..."
sleep 15

# Create/update Lambda function
log "⚡ Creating Lambda function..."
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
        CACHE_BUCKET_NAME=$CACHE_BUCKET
    }" \
    2>/dev/null || {
        log "Updating existing function..."
        aws lambda update-function-code \
            --function-name $FUNCTION_NAME \
            --image-uri $REPOSITORY_URI:$IMAGE_TAG
    }

# Set up EventBridge schedule
log "⏰ Setting up daily schedule..."
aws events put-rule --name blog-monitor-daily --schedule-expression "rate(1 day)" --region $AWS_REGION 2>/dev/null || true

aws lambda add-permission \
    --function-name $FUNCTION_NAME \
    --statement-id allow-eventbridge \
    --action lambda:InvokeFunction \
    --principal events.amazonaws.com \
    --source-arn arn:aws:events:$AWS_REGION:$ACCOUNT_ID:rule/blog-monitor-daily \
    2>/dev/null || true

aws events put-targets \
    --rule blog-monitor-daily \
    --targets "Id"="1","Arn"="arn:aws:lambda:$AWS_REGION:$ACCOUNT_ID:function:$FUNCTION_NAME" \
    --region $AWS_REGION 2>/dev/null || true

log "✅ Containerized deployment completed!"

# Output deployment result as JSON for UI consumption
cat << EOF
{
  "status": "success",
  "deployment_type": "containerized",
  "function_name": "$FUNCTION_NAME",
  "image_uri": "$REPOSITORY_URI:$IMAGE_TAG",
  "bucket_name": "$CACHE_BUCKET",
  "message": "Containerized Lambda function deployed successfully",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF