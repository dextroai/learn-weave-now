#!/bin/bash

# Docker-based deployment (No npm required)

echo "🐳 Building deployment container..."

# Build Docker image
docker build -t blog-monitor-deploy .

# Run deployment
docker run --rm \
  -v ~/.aws:/root/.aws \
  -v $(pwd)/.env:/app/.env \
  blog-monitor-deploy