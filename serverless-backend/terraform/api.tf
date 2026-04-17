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

resource "aws_apigatewayv2_route" "health" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "GET /health"
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