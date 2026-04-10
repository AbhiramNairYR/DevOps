# ByteBuild Marketplace

ByteBuild Marketplace is a small multi-service PC builder demo built around Docker Swarm and a browser-based storefront.

## What’s included

- `services/web-store`: static storefront with the PC Builder page, parts catalog, and Swarm dashboard
- `services/catalog`: Node.js API that serves parts data and Swarm control endpoints for the dashboard
- `services/logic-engine`: Python API that validates CPU, motherboard, GPU, and case compatibility
- `docker-swarm/stack.yml`: Swarm stack definition with 3 replicas per service
- `.github/workflows/pipeline.yml`: GitHub Actions workflow for building and pushing images to Docker Hub

## Run locally

Build and deploy with Docker Swarm:

```bash
make all
```

Open the app at:

- http://localhost:8088
- http://localhost:8088/catalog.html
- http://localhost:8088/swarm-dashboard.html

## Live ops

The Swarm dashboard lets you:

- view service replicas and tasks
- scale services up or down
- restart a service
- auto-refresh the cluster state

## CI/CD

The GitHub Actions workflow builds images for:

- `web-store`
- `catalog`
- `logic-engine`

On pushes to `main`, it pushes Docker images to Docker Hub using your repository secrets.

## Notes

- The catalog and logic APIs are wired for local Swarm usage.
- The dashboard uses the catalog service to inspect and control Swarm services.
