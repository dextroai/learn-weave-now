
# Blog Monitor AWS Lambda Deployment

This directory contains the AWS Lambda implementation of the blog monitoring system that runs daily to check all blogs for new posts.

## Features

- **Daily Execution**: Automatically runs once per day via CloudWatch Events
- **S3 Cache Storage**: Stores blog post cache in S3 for persistence across executions
- **SES Notifications**: Sends email notifications via Amazon SES
- **Supabase Integration**: Updates user blogs and creates blog posts in Supabase database
- **Scalable**: Handles multiple blogs and users efficiently

## Architecture

```
CloudWatch Events (Daily) → Lambda Function → S3 (Cache) + SES (Notifications) + Supabase (Database)
```

## Setup Instructions

### 1. Prerequisites

- AWS CLI configured with appropriate permissions
- Node.js and npm installed
- Serverless Framework
- Environment variables set

### 2. Environment Variables

Set the following environment variables:

```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
export NOTIFICATION_EMAIL="notifications@yourdomain.com"
```

### 3. AWS Permissions

The Lambda function needs the following AWS permissions:

- **S3**: GetObject, PutObject, DeleteObject, ListBucket
- **SES**: SendEmail, SendRawEmail
- **CloudWatch**: Basic Lambda execution permissions

### 4. SES Configuration

1. Verify your notification email address in Amazon SES
2. If in SES sandbox, verify recipient email addresses
3. For production, request production access

### 5. Deployment

```bash
cd aws-lambda
chmod +x deploy.sh
./deploy.sh
```

## How It Works

### 1. Blog Discovery
- Fetches all active blogs from `admin_blogs` table
- Each blog URL is checked for new posts

### 2. Cache Management
- Previous posts stored in S3 with filename: `blog_cache/{md5_hash}_posts.json`
- Compares current posts with cached posts to detect new ones

### 3. User Updates
- For each blog with new posts:
  - Updates `last_checked` timestamp in user's `blogs` table
  - Creates new entries in `blog_posts` table for each user who has that blog

### 4. Notifications
- Sends email notifications to users via SES
- Includes post titles, links, summaries, and publication dates

### 5. Admin Updates
- Updates `admin_blogs` table with `last_checked` timestamp

## Monitoring

### CloudWatch Logs
- View execution logs in CloudWatch
- Monitor for errors and performance

### Metrics
- Function duration
- Error rates
- S3 cache operations

### Alerts
Set up CloudWatch alarms for:
- Function failures
- Execution timeouts
- High error rates

## Configuration

### Execution Schedule
Modify the schedule in `serverless.yml`:

```yaml
events:
  - schedule: rate(1 day)  # Daily
  # or
  - schedule: cron(0 8 * * ? *)  # Daily at 8 AM UTC
```

### Memory and Timeout
Adjust based on number of blogs:

```yaml
memorySize: 512  # MB
timeout: 900     # 15 minutes
```

## Cost Estimation

For 100 blogs checked daily:
- **Lambda**: ~$0.10/month (15min execution daily)
- **S3**: ~$0.01/month (cache storage)
- **SES**: ~$0.10/month (email notifications)
- **Total**: ~$0.21/month

## Troubleshooting

### Common Issues

1. **Timeout Errors**: Increase timeout or optimize blog checking
2. **SES Permissions**: Verify email addresses and SES configuration
3. **S3 Access**: Check IAM permissions for S3 bucket operations
4. **Supabase Connection**: Verify service role key and database permissions

### Debugging

1. Check CloudWatch logs for detailed error messages
2. Test individual blog URLs manually
3. Verify S3 cache file structure
4. Test SES email sending separately

## Security

- Service role key stored as environment variable
- S3 bucket with versioning and lifecycle policies
- IAM roles follow principle of least privilege
- No hardcoded credentials in code

## Monitoring Dashboard

Consider setting up a CloudWatch dashboard to monitor:
- Daily execution success/failure
- Number of blogs checked
- Number of new posts detected
- Cache hit/miss rates
- Email notification success rates
