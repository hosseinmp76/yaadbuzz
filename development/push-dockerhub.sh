#!/usr/bin/env bash
# Build the Yaadbuzz image (JVM or native) and push it to Docker Hub.
#
# Usage (from repo root):
#   export DOCKERHUB_USER=youruser   # required: Docker Hub user or org
#   export IMAGE_TAG=1.0.0-SNAPSHOT  # optional
#   ./development/push-dockerhub.sh
#
# Build a native image instead of JVM (uses a GraalVM builder container,
# so no local GraalVM install is required):
#   NATIVE=1 ./development/push-dockerhub.sh
#   # or:
#   ./development/push-dockerhub.sh --native
#
# Optional: SKIP_BUILD=1 to only tag/push an image that already exists locally.
set -euo pipefail

NATIVE="${NATIVE:-0}"
for arg in "$@"; do
  case "$arg" in
    --native)
      NATIVE=1
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      exit 1
      ;;
  esac
done

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "${ROOT}"

DOCKERHUB_USER="${DOCKERHUB_USER:-hosseinmp762}"
IMAGE_NAME="${IMAGE_NAME:-yaadbuzz}"
IMAGE_TAG="${IMAGE_TAG:-1.0.0-SNAPSHOT}"
# Quinoa passes this to Vite, which embeds the image tag in the site footer.
export VITE_APP_VERSION="${IMAGE_TAG}"
LOCAL_IMAGE="hosseinmp762/${IMAGE_NAME}:${IMAGE_TAG}"

if [[ -z "${DOCKERHUB_USER}" ]]; then
  echo "Set DOCKERHUB_USER to your Docker Hub username or organization." >&2
  exit 1
fi

if [[ "${SKIP_BUILD:-0}" != "1" ]]; then
  if [[ "${NATIVE}" == "1" ]]; then
    echo "==> Building native executable (in a GraalVM builder container)"
    # clean: the native profile compiles to a different bytecode release than
    # the default build, and Maven's incremental compiler won't recompile
    # already-up-to-date classes, silently keeping the wrong release.
    ./mvnw clean -DskipTests package -Dnative -Dquarkus.native.container-build=true
    echo "==> Building native image ${LOCAL_IMAGE}"
    ./mvnw quarkus:image-build \
      -Dquarkus.package.type=native \
      -Dquarkus.native.container-build=true \
      -Dquarkus.container-image.group=hosseinmp762 \
      -Dquarkus.container-image.name="${IMAGE_NAME}" \
      -Dquarkus.container-image.tag="${IMAGE_TAG}"
  else
    echo "==> Building ${LOCAL_IMAGE}"
    ./mvnw -DskipTests package
    ./mvnw quarkus:image-build \
      -Dquarkus.container-image.group=hosseinmp762 \
      -Dquarkus.container-image.name="${IMAGE_NAME}" \
      -Dquarkus.container-image.tag="${IMAGE_TAG}"
  fi
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
