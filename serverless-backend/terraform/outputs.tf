output "api_url" {
  value = aws_apigatewayv2_api.api.api_endpoint
}

output "frontend_url" {
  value = aws_s3_bucket_website_configuration.frontend.website_endpoint
}

output "cloudfront_url" {
  value = aws_cloudfront_distribution.frontend.domain_name
}