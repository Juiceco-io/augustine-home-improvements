variable "rest_api_id" {
  type = string
}

variable "resource_id" {
  type = string
}

variable "http_method" {
  type    = string
  default = "ANY"
}

variable "lambda_arn" {
  type = string
}

variable "lambda_name" {
  type = string
}

variable "authorizer_id" {
  type = string
}

variable "account_id" {
  type = string
}

variable "region" {
  type = string
}
