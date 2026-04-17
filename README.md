# ShopSphere - Serverless E-Commerce Application

## Overview

ShopSphere is a full-stack serverless e-commerce application built using AWS cloud services and deployed with Terraform. It follows a microservices-based architecture with independent services for products, cart, and orders.

The application demonstrates scalable backend design, modern frontend development, and real-world cloud deployment practices including CDN distribution and infrastructure as code.


## Tech Stack

### Frontend

* React (Vite)
* Custom CSS (responsive UI)

### Backend

* Node.js (AWS Lambda)
* REST APIs via API Gateway (HTTP API)

### Cloud & Infrastructure

* Amazon S3 (static hosting)
* Amazon CloudFront (CDN)
* Amazon DynamoDB (NoSQL database)
* AWS Lambda
* Terraform (Infrastructure as Code)

---

## Architecture Flow (High-Level)

User (Browser)
      ↓
CloudFront (CDN)
      ↓
S3 (Frontend - React App)
      ↓
API Gateway (HTTP API)
      ↓
Lambda Functions (Product / Cart / Order)
      ↓
DynamoDB (Database)

## Features

### Product Service

* View all products
* Search products by name
* Filter by category and price
* Add/update/delete products
* Product images support

### Cart Service

* Add item to cart
* View cart items
* Remove item from cart

### Order Service

* Create order (single item or full cart)
* Calculate total order amount
* Fetch user orders
* Cancel orders
* Automatically clear cart after ordering

### Frontend Features

* Product cards with images
* Search functionality
* Filters (category + price)
* Toast notifications
* Separate pages (Products, Cart, Orders)
* Responsive grid UI

---

## Project Structure

Week1_terraform/
│
├── frontend/                   
│   ├── src/
│   ├── dist/
│   └── deploy.ps1
│
├── serverless-backend/
│   ├── productService/
│   ├── cartService/
│   ├── orderService/
│   └── terraform/
│
├── .gitignore
└── README.md

---

## Deployment

### Backend (Terraform)
cd serverless-backend/terraform
terraform init
terraform apply

---

### Frontend Build
cd frontend
npm install
npm run build

---

### Frontend Deployment
.\deploy.ps1

This script:

* Builds the frontend
* Uploads files to S3
* Invalidates CloudFront cache

---

## Key Learnings

* Serverless architecture design
* Microservices using Lambda + API Gateway
* DynamoDB schema-less modeling
* Terraform modular infrastructure
* CloudFront caching and invalidation
* Full-stack cloud deployment

---

## Future Improvements

* Authentication using AWS Cognito
* Image upload via S3
* Backend-based search & filtering
* Pagination support
* CI/CD pipeline

---

## Author

Venisha M
B.Tech IT Student

---

## License

This project is for educational purposes.
