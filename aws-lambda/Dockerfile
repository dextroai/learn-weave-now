FROM python:3.9-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy source code
COPY *.py ./

# Install AWS CLI
RUN pip install awscli

# Copy deployment scripts
COPY deploy_direct.sh .
RUN chmod +x deploy_direct.sh

CMD ["./deploy_direct.sh"]