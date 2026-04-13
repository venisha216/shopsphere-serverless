provider "aws" {
  region = var.region
}

# ---------------------------
# IAM ROLE
# ---------------------------
resource "aws_iam_role" "lambda_role" {
  name = "${var.project}-lambdaRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "dynamo_access" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "${var.project}-lambda-dynamodb"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:Scan",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem"
        ]
        Resource = "*"
      }
    ]
  })
}

# ---------------------------
# DYNAMODB TABLES
# ---------------------------
resource "aws_dynamodb_table" "products" {
  name         = "${var.project}-products"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
}

resource "aws_dynamodb_table" "cart" {
  name         = "${var.project}-cart"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"

  attribute {
    name = "userId"
    type = "S"
  }
}

resource "aws_dynamodb_table" "orders" {
  name         = "${var.project}-orders"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "orderId"

  attribute {
    name = "orderId"
    type = "S"
  }
}

# ---------------------------
# LAMBDA FUNCTIONS
# ---------------------------
resource "aws_lambda_function" "product" {
  function_name = "${var.project}-productService"
  role          = aws_iam_role.lambda_role.arn
  handler       = "handler.handler"
  runtime       = "nodejs20.x"

  filename         = "../productService.zip"
  source_code_hash = filebase64sha256("../productService.zip") 

  depends_on = [
  aws_iam_role_policy_attachment.lambda_basic,
  aws_iam_role_policy_attachment.dynamo_access
]
}

resource "aws_lambda_function" "cart" {
  function_name = "${var.project}-cartService"
  role          = aws_iam_role.lambda_role.arn
  handler       = "handler.handler"
  runtime       = "nodejs20.x"

  filename = "../cartService.zip"
  source_code_hash = filebase64sha256("../cartService.zip") 
  
  depends_on = [
  aws_iam_role_policy_attachment.lambda_basic,
  aws_iam_role_policy_attachment.dynamo_access
]
}

resource "aws_lambda_function" "order" {
  function_name = "${var.project}-orderService"
  role          = aws_iam_role.lambda_role.arn
  handler       = "handler.handler"
  runtime       = "nodejs20.x"

  filename         = "../orderService.zip"
  source_code_hash = filebase64sha256("../orderService.zip")

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic,
    aws_iam_role_policy_attachment.dynamo_access
  ]

  environment {
  variables = {
    CART_API_URL = "${aws_apigatewayv2_api.api.api_endpoint}/cart"
  }
}
}

# ---------------------------
# API GATEWAY
# ---------------------------
resource "aws_apigatewayv2_api" "api" {
  name          = "${var.project}-api"
  protocol_type = "HTTP"

  route_selection_expression = "$request.method $request.path"
}

# ---------------------------
# INTEGRATIONS
# ---------------------------
resource "aws_apigatewayv2_integration" "product" {
  api_id           = aws_apigatewayv2_api.api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.product.invoke_arn

  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "cart" {
  api_id           = aws_apigatewayv2_api.api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.cart.invoke_arn

  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "order" {
  api_id           = aws_apigatewayv2_api.api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.order.invoke_arn

  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "root" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "GET /"
  target    = "integrations/${aws_apigatewayv2_integration.product.id}"
}

# ---------------------------
# ROUTES - PRODUCT SERVICE
# ---------------------------
resource "aws_apigatewayv2_route" "products_get_all" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "GET /products"
  target    = "integrations/${aws_apigatewayv2_integration.product.id}"
}

resource "aws_apigatewayv2_route" "products_get_one" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "GET /products/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.product.id}"
}

resource "aws_apigatewayv2_route" "products_create" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST /products"
  target    = "integrations/${aws_apigatewayv2_integration.product.id}"
}

resource "aws_apigatewayv2_route" "products_update" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "PUT /products/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.product.id}"
}

resource "aws_apigatewayv2_route" "products_delete" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "DELETE /products/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.product.id}"
}

# ---------------------------
# ROUTES - CART SERVICE
# ---------------------------
resource "aws_apigatewayv2_route" "cart_get" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "GET /cart"
  target    = "integrations/${aws_apigatewayv2_integration.cart.id}"
}

resource "aws_apigatewayv2_route" "cart_create" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST /cart"
  target    = "integrations/${aws_apigatewayv2_integration.cart.id}"
}

resource "aws_apigatewayv2_route" "cart_delete" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "DELETE /cart/{productId}"
  target    = "integrations/${aws_apigatewayv2_integration.cart.id}"
}

resource "aws_apigatewayv2_route" "cart_options" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "OPTIONS /cart"
  target    = "integrations/${aws_apigatewayv2_integration.cart.id}"
}

resource "aws_apigatewayv2_route" "cart_options_id" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "OPTIONS /cart/{productId}"
  target    = "integrations/${aws_apigatewayv2_integration.cart.id}"
}

# ---------------------------
# ROUTES - ORDER SERVICE
# ---------------------------
resource "aws_apigatewayv2_route" "orders_create" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST /orders"
  target    = "integrations/${aws_apigatewayv2_integration.order.id}"
}

resource "aws_apigatewayv2_route" "orders_get" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "GET /orders"
  target    = "integrations/${aws_apigatewayv2_integration.order.id}"
}

resource "aws_apigatewayv2_route" "orders_delete" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "DELETE /orders/{orderId}"
  target    = "integrations/${aws_apigatewayv2_integration.order.id}"
}

resource "aws_apigatewayv2_route" "orders_options" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "OPTIONS /orders"
  target    = "integrations/${aws_apigatewayv2_integration.order.id}"
}

resource "aws_apigatewayv2_route" "orders_options_id" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "OPTIONS /orders/{orderId}"
  target    = "integrations/${aws_apigatewayv2_integration.order.id}"
}

# ---------------------------
# STAGE
# ---------------------------
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
}

# ---------------------------
# LAMBDA PERMISSIONS
# ---------------------------
resource "aws_lambda_permission" "product" {
  statement_id  = "AllowAPIGatewayInvokeProduct"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.product.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "cart" {
  statement_id  = "AllowAPIGatewayInvokeCart"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cart.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "order" {
  statement_id  = "AllowAPIGatewayInvokeOrder"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.order.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

# ---------------------------
# S3 FRONTEND (STATIC WEBSITE)
# ---------------------------

resource "aws_s3_bucket" "frontend" {
  bucket = "${var.project}-frontend"

  tags = {
    Name = "Frontend Bucket"
  }
}

# Allow public access
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Enable static website hosting
resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# Bucket policy for public read
resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  depends_on = [
    aws_s3_bucket_public_access_block.frontend
  ]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicRead"
        Effect    = "Allow"
        Principal = "*"
        Action    = ["s3:GetObject"]
        Resource  = "${aws_s3_bucket.frontend.arn}/*"
      }
    ]
  })
}

# ---------------------------
# CLOUDFRONT DISTRIBUTION
# ---------------------------

resource "aws_cloudfront_distribution" "frontend" {

  origin {
    domain_name = aws_s3_bucket_website_configuration.frontend.website_endpoint
    origin_id   = "s3-frontend"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    target_origin_id       = "s3-frontend"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}