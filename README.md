# NycTransitAlertPlatform
NYC Transit Service Alert Platform 🚇

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
