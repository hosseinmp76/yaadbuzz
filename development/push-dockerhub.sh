#!/usr/bin/env bash
# Build the Yaadbuzz JVM image and push it to Docker Hub.
#
# Usage (from repo root):
#   export DOCKERHUB_USER=youruser   # required: Docker Hub user or org
#   export IMAGE_TAG=1.0.0-SNAPSHOT  # optional
#   ./development/push-dockerhub.sh
#
# Optional: SKIP_BUILD=1 to only tag/push an image that already exists locally.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "${ROOT}"

DOCKERHUB_USER="${DOCKERHUB_USER:-hosseinmp762}"
IMAGE_NAME="${IMAGE_NAME:-yaadbuzz}"
LOCAL_IMAGE="hosseinmp762/${IMAGE_NAME}:${IMAGE_TAG}"

if [[ -z "${DOCKERHUB_USER}" ]]; then
  echo "Set DOCKERHUB_USER to your Docker Hub username or organization." >&2
  exit 1
fi

if [[ "${SKIP_BUILD:-0}" != "1" ]]; then
  echo "==> Building ${LOCAL_IMAGE}"
  ./mvnw -DskipTests package
  ./mvnw quarkus:image-build \
    -Dquarkus.container-image.group=hosseinmp762 \
    -Dquarkus.container-image.name="${IMAGE_NAME}" \
    -Dquarkus.container-image.tag="${IMAGE_TAG}"
fi

if ! docker image inspect "${LOCAL_IMAGE}" >/dev/null 2>&1; then
  echo "Local image not found: ${LOCAL_IMAGE}" >&2
  echo "Build first or unset SKIP_BUILD." >&2
  exit 1
fi

echo "==> Logging in to Docker Hub (skip if already logged in)"
docker login


echo "==> Pushing"
docker push "${LOCAL_IMAGE}"

echo "Done."
echo "  ${LOCAL_IMAGE}"
