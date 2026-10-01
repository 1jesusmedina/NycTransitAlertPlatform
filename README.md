NYC Transit Service Alert Platform 

A serverless AWS application for delivering real-time NYC transit service alerts through a scalable, low-maintenance architecture. The platform allows users to view, search, and filter subway service disruptions by line.

Architecture

Frontend

React / Vite
Amazon S3 for static website hosting
Amazon CloudFront for global content delivery and caching

Backend

Amazon API Gateway for RESTful API endpoints
AWS Lambda for serverless application logic
Amazon DynamoDB for low-latency alert storage and retrieval

Architecture Goals

Scalable architecture for unpredictable traffic spikes during major transit disruptions
Low-latency access to frequently requested service alerts
Minimal infrastructure management through serverless AWS services
Secure access using IAM least-privilege principles
Observable application through Amazon CloudWatch
Key Architecture Decisions

The application separates static content from dynamic API requests by using S3 and CloudFront for the frontend and API Gateway, Lambda, and DynamoDB for backend operations.

DynamoDB is modeled around the application's primary access patterns, including retrieving alerts by subway line and alert ID. CloudFront caching can reduce repeated requests for frequently accessed static content and, where appropriate, API responses.

For a production-scale architecture, the alert ingestion pipeline can be decoupled using Amazon SQS:

Transit Data Source → Lambda → SQS → Lambda → DynamoDB

This provides buffering, retry capabilities, and fault isolation during periods of high traffic or temporary downstream failures.

AWS Services

Amazon S3 · Amazon CloudFront · Amazon API Gateway · AWS Lambda · Amazon DynamoDB · Amazon SQS · Amazon CloudWatch · AWS IAM

Future Improvements
Add Amazon Cognito for user authentication
Implement infrastructure as code with AWS CDK or CloudFormation
Add automated CI/CD deployment
Introduce API and data caching based on alert freshness requirements
Add CloudWatch alarms and dashboards
Implement a dead-letter queue for failed ingestion events
Evaluate multi-region architecture based on production availability requirements
