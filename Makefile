.PHONY: all local-swarm local-build swarm-init swarm-deploy swarm-clean clean

WEB_IMAGE := bytebuild/web-store:local
CATALOG_IMAGE := bytebuild/catalog:local
LOGIC_IMAGE := bytebuild/logic-engine:local

# Runs the local Docker Swarm stack
all: local-swarm

local-swarm: local-build swarm-init swarm-deploy
	@echo "Local Docker Swarm deployment complete."
	@echo "Access app at: http://localhost:8088"

local-build:
	@echo "Building local Docker images..."
	@if ! command -v docker >/dev/null 2>&1; then \
		echo "Docker is required for local image builds."; \
		exit 1; \
	fi
	docker build -t $(WEB_IMAGE) services/web-store
	docker build -t $(CATALOG_IMAGE) services/catalog
	docker build -t $(LOGIC_IMAGE) services/logic-engine

swarm-init:
	@echo "Ensuring Docker Swarm mode is enabled..."
	@if ! command -v docker >/dev/null 2>&1; then \
		echo "Docker is required for Swarm deployment."; \
		exit 1; \
	fi
	@if ! docker info 2>/dev/null | grep -q 'Swarm: active'; then \
		advertise_addr=$$(ip route get 1.1.1.1 2>/dev/null | awk '{print $$7; exit}'); \
		if [ -n "$$advertise_addr" ]; then \
			docker swarm init --advertise-addr "$$advertise_addr" >/dev/null 2>&1 || docker swarm init >/dev/null 2>&1; \
		else \
			docker swarm init >/dev/null 2>&1; \
		fi; \
	fi

swarm-deploy:
	@echo "Deploying Microservices to Docker Swarm..."
	docker stack deploy -c docker-swarm/stack.yml bytebuild

clean:
	@echo "Removing Docker Swarm stack..."
	@docker stack rm bytebuild >/dev/null 2>&1 || true

swarm-clean:
	@echo "Removing Docker Swarm stack..."
	@docker stack rm bytebuild >/dev/null 2>&1 || true