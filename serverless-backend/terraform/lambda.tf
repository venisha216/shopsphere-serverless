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
    CART_API_URL    = "${aws_apigatewayv2_api.api.api_endpoint}/cart"
    PRODUCT_API_URL = "${aws_apigatewayv2_api.api.api_endpoint}/products"
  }
}
}