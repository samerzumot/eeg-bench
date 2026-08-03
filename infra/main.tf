# EEG-Bench — Terraform configuration for new GCP project
# Run: terraform init && terraform plan && terraform apply

terraform {
  required_version = ">= 1.5"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "billing_account" {
  description = "GCP billing account ID"
  type        = string
}

# ── Project ─────────────────────────────────────────────────────────
resource "google_project" "mi_bench" {
  name            = "EEG-Bench"
  project_id      = var.project_id
  billing_account = var.billing_account
}

# ── Enable APIs ─────────────────────────────────────────────────────
resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "cloudbuild.googleapis.com",
    "cloudtasks.googleapis.com",
    "aiplatform.googleapis.com",
    "firestore.googleapis.com",
    "storage.googleapis.com",
    "firebase.googleapis.com",
    "identitytoolkit.googleapis.com",
    "artifactregistry.googleapis.com",
  ])

  project = google_project.mi_bench.project_id
  service = each.value

  disable_on_destroy = false
}

# ── Artifact Registry ───────────────────────────────────────────────
resource "google_artifact_registry_repository" "mi_bench" {
  project       = google_project.mi_bench.project_id
  location      = var.region
  repository_id = "mi-bench"
  format        = "DOCKER"

  depends_on = [google_project_service.apis]
}

# ── Cloud Storage — uploads bucket ──────────────────────────────────
resource "google_storage_bucket" "uploads" {
  project  = google_project.mi_bench.project_id
  name     = "${var.project_id}-uploads"
  location = var.region

  lifecycle_rule {
    condition {
      age = 7 # Auto-delete after 7 days
    }
    action {
      type = "Delete"
    }
  }

  depends_on = [google_project_service.apis]
}

# ── Firestore ───────────────────────────────────────────────────────
resource "google_firestore_database" "default" {
  project     = google_project.mi_bench.project_id
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"

  depends_on = [google_project_service.apis]
}

# ── Cloud Tasks queue ───────────────────────────────────────────────
resource "google_cloud_tasks_queue" "eegnet_jobs" {
  project  = google_project.mi_bench.project_id
  name     = "eegnet-training-jobs"
  location = var.region

  rate_limits {
    max_concurrent_dispatches = 2
    max_dispatches_per_second = 1
  }

  retry_config {
    max_attempts = 3
  }

  depends_on = [google_project_service.apis]
}

# ── Cloud Run — Frontend ────────────────────────────────────────────
resource "google_cloud_run_v2_service" "frontend" {
  project  = google_project.mi_bench.project_id
  name     = "mi-bench-frontend"
  location = var.region

  template {
    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/mi-bench/frontend:latest"
      ports {
        container_port = 8080
      }
      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }
    }
    scaling {
      min_instance_count = 0
      max_instance_count = 3
    }
  }

  depends_on = [google_project_service.apis]
}

# ── Cloud Run — Backend ─────────────────────────────────────────────
resource "google_cloud_run_v2_service" "backend" {
  project  = google_project.mi_bench.project_id
  name     = "mi-bench-backend"
  location = var.region

  template {
    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/mi-bench/backend:latest"
      ports {
        container_port = 8080
      }
      resources {
        limits = {
          cpu    = "2"
          memory = "4Gi"
        }
      }
      env {
        name  = "ALLOWED_ORIGINS"
        value = "*"
      }
    }
    scaling {
      min_instance_count = 0
      max_instance_count = 5
    }
    timeout = "300s"
  }

  depends_on = [google_project_service.apis]
}

# ── IAM — Allow unauthenticated access to frontend ──────────────────
resource "google_cloud_run_v2_service_iam_member" "frontend_public" {
  project  = google_project.mi_bench.project_id
  name     = google_cloud_run_v2_service.frontend.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_v2_service_iam_member" "backend_public" {
  project  = google_project.mi_bench.project_id
  name     = google_cloud_run_v2_service.backend.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ── Outputs ─────────────────────────────────────────────────────────
output "frontend_url" {
  value = google_cloud_run_v2_service.frontend.uri
}

output "backend_url" {
  value = google_cloud_run_v2_service.backend.uri
}

output "uploads_bucket" {
  value = google_storage_bucket.uploads.name
}
