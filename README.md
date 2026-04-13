# ShopSphere - Serverless Full Stack Application

## Overview

ShopSphere is a serverless full stack e-commerce application built using AWS services and deployed using Infrastructure as Code (Terraform). It demonstrates a scalable architecture with microservices for product, cart, and order management.

---

## Architecture

- Frontend: React (Vite)
- Backend: AWS Lambda (Node.js)
- API Layer: Amazon API Gateway (HTTP API)
- Database: Amazon DynamoDB
- Hosting: Amazon S3 (static website hosting)
- CDN: Amazon CloudFront
- Infrastructure: Terraform

---

## Features

### Product Service
- Get all products
- Get product by ID
- Create product
- Update product
- Delete product

### Cart Service
- Add item to cart
- View cart
- Remove item from cart

### Order Service
- Create order
- Get orders by user
- Cancel order

---

## Project Structure
