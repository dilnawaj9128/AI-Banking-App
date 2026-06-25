variable "aws_region" {
  description = "AWS region to deploy"
  default     = "ap-south-1"  # Mumbai - India ke liye best
}

variable "environment" {
  description = "Environment name"
  default     = "prod"
}

variable "db_password" {
  description = "RDS MySQL password"
  sensitive   = true
}
