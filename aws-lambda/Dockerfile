FROM public.ecr.aws/lambda/python:3.9

# Copy requirements and install dependencies
COPY requirements.txt ${LAMBDA_TASK_ROOT}
RUN pip install -r requirements.txt

# Copy function code
COPY blog_monitor_lambda.py ${LAMBDA_TASK_ROOT}
COPY blog_monitor.py ${LAMBDA_TASK_ROOT}

# Set the CMD to your handler
CMD [ "blog_monitor_lambda.lambda_handler" ]