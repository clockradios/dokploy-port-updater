# Dokploy Port Updater

This script will update the exposed ports on the Traefik container created by Dokploy allowing you to create entrypoints for TCP services.

```sh
git clone https://github.com/clockradios/dokploy-port-updater.git
cd dokploy-port-updater
npm i
node update.js
```

## Customizing Ports

You can customize the ports exposed by modifying the `ADDITIONAL_PORTS.json` file.

## Entrypoints

After running the update script, you can create additional entrypoints in your traefik.yml using the exposed ports.

```yaml
providers:
  docker:
    exposedByDefault: false
  file:
    directory: /etc/dokploy/traefik/dynamic
    watch: true
entryPoints:
  web:
    address: ':80'
  websecure:
    address: ':443'
    http:
      tls:
        certResolver: letsencrypt
  postgres:
    address: ':5432'
  mongodb:
    address: ':27017'
  mssql:
    address: ':1433'
  clickhouse:
    address: ':8123'
api:
  insecure: true
certificatesResolvers:
  letsencrypt:
    acme:
      email: you@email.com
      storage: /etc/dokploy/traefik/dynamic/acme.json
      httpChallenge:
        entryPoint: web

```

Then you can use them in your Traefik labels on your services.

```yaml
...
labels:
      - "traefik.enable=true"
      - "traefik.tcp.routers.postgres-${UNIQUE_NAME}.entrypoints=postgres"
      - "traefik.tcp.routers.postgres-${UNIQUE_NAME}.rule=HostSNI(`pg-${UNIQUE_NAME}.the-data.xyz`)"
      - "traefik.tcp.services.postgres-${UNIQUE_NAME}.loadbalancer.server.port=5432"
      - "traefik.tcp.routers.postgres-${UNIQUE_NAME}.tls=true"
      - "traefik.tcp.routers.postgres-${UNIQUE_NAME}.tls.certresolver=letsencrypt"
```
