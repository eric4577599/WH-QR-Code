# Deployment Walkthrough: Docker + Cloudflare Tunnel
> Document ID: DOC-20260101-1
> Date: 2026-01-01

This document outlines the configuration and deployment steps for Dockerizing the React application and exposing it via Cloudflare Tunnel.

## Files Created
- **Dockerfile**: Multi-stage build (Node.js Build -> Nginx Server).
- **docker-compose.yml**: Orchestrates the Frontend and Cloudflare Tunnel container.
- **nginx.conf**: Configured for Single Page Application (SPA) routing.
- **.dockerignore**: Ensures clean build context.

## Prerequisites
1.  **Docker Desktop**: Ensure it is installed and **running**.
2.  **Cloudflare Tunnel Token**: You need a tunnel token from the Cloudflare Zero Trust Dashboard.

## How to Run

### Step 1: Get Tunnel Token
1.  Go to **Cloudflare Zero Trust** > **Networks** > **Tunnels**.
2.  Create a new Tunnel.
3.  Choose **Docker** as the environment.
4.  Copy the token (it looks like `eyJhIjoi...`).

### Step 2: Configure Environment
Create a `.env` file in the project root (`d:\MyGitHub\倉儲通\.env`) and add your token:
```env
TUNNEL_TOKEN=eyJhIjoi...your_long_token_here...
```
*Alternatively, you can replace `${TUNNEL_TOKEN}` directly in the `docker-compose.yml` file, but using `.env` is more secure.*

### Step 3: Start Services
Run the following command in PowerShell:
```powershell
docker-compose -p warehouse-scanner up -d
```

### Step 4: Configure Public Hostname (Crucial!)
1.  Back in **Cloudflare Zero Trust Dashboard** > **Tunnels**.
2.  Click the tunnel you created > **Configure**.
3.  Go to the **Public Hostname** tab.
4.  Click **Add a public hostname**.
5.  **Subdomain**: Enter your desired name (e.g., `inventory`).
6.  **Domain**: Select your domain (e.g., `example.com`).
7.  **Service Type**: `HTTP`.
8.  **URL**: `frontend:80`
    *   **Note**: We use `frontend` because that is the service name in `docker-compose.yml`. Do NOT use localhost here, as the Tunnel container needs to reach the Frontend container.

### Step 5: Verify
1.  Run the containers: `docker-compose -p warehouse-scanner up -d`
2.  Check logs to confirm tunnel is connected: `docker logs warehouse-tunnel`
3.  Visit your public URL (e.g., `https://inventory.example.com`).
4.  Local Access: `http://localhost:8081`

## Troubleshooting
- **"Unable to reach the origin"**: Ensure you entered `frontend:80` in the Cloudflare Dashboard, NOT `localhost:8081`.
- **"Daemon not running"**: Start Docker Desktop.
- **Port Conflict**: If 8081 is taken, edit `docker-compose.yml` to use another port (e.g., "8082:80").
