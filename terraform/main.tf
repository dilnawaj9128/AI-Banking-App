terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "bankapp-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "ap-south-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# ── VPC ──────────────────────────────────────────────────────────
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "bankapp-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["${var.aws_region}a", "${var.aws_region}b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true

  tags = {
    Project     = "AI-BankApp"
    Environment = var.environment
  }
}

# ── EKS Cluster ───────────────────────────────────────────────────
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "19.0.0"

  cluster_name    = "bankapp-cluster"
  cluster_version = "1.28"

  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.private_subnets
  cluster_endpoint_public_access = true

  eks_managed_node_groups = {
    general = {
      desired_size = 2
      min_size     = 1
      max_size     = 4

      instance_types = ["t3.medium"]
      capacity_type  = "ON_DEMAND"
    }
  }

  tags = {
    Project     = "AI-BankApp"
    Environment = var.environment
  }
}

# ── RDS MySQL ─────────────────────────────────────────────────────
resource "aws_db_instance" "bankapp_db" {
  identifier        = "bankapp-db"
  engine            = "mysql"
  engine_version    = "8.0"
  instance_class    = "db.t3.micro"
  allocated_storage = 20

  db_name  = "bankapp"
  username = "admin"
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.bankapp.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]

  skip_final_snapshot = true
  multi_az            = false

  tags = {
    Project = "AI-BankApp"
  }
}

resource "aws_db_subnet_group" "bankapp" {
  name       = "bankapp-db-subnet"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_security_group" "rds_sg" {
  name   = "bankapp-rds-sg"
  vpc_id = module.vpc.vpc_id

  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }
}

# ── S3 for static assets ──────────────────────────────────────────
resource "aws_s3_bucket" "bankapp_assets" {
  bucket = "bankapp-assets-${var.environment}"
  tags = {
    Project = "AI-BankApp"
  }
}

# ── Outputs ───────────────────────────────────────────────────────
output "eks_cluster_name" {
  value = module.eks.cluster_name
}

output "rds_endpoint" {
  value     = aws_db_instance.bankapp_db.endpoint
  sensitive = true
}
