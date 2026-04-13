Write-Host "Building frontend..."
npm run build

Write-Host "Uploading to S3..."
aws s3 sync dist/ s3://venisha-tf-frontend --delete

Write-Host "Invalidating CloudFront..."

aws cloudfront create-invalidation --distribution-id E119J7T84NB0XU --paths "/*"

Write-Host "Deployment complete!"