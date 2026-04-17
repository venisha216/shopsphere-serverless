resource "aws_route53_health_check" "api_health" {
  fqdn              = replace(aws_apigatewayv2_api.api.api_endpoint, "https://", "")
  port              = 443
  type              = "HTTPS"
  resource_path     = "/health"
  failure_threshold = 3
  request_interval  = 30
}