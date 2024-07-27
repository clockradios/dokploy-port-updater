const path = require('node:path');
const fs = require('fs');
const Docker = require('dockerode');

export const BASE_PATH ="/etc/dokploy";
export const MAIN_TRAEFIK_PATH = `${BASE_PATH}/traefik`;
export const DYNAMIC_TRAEFIK_PATH = `${BASE_PATH}/traefik/dynamic`;
export const docker = new Docker();

const TRAEFIK_SSL_PORT =
    Number.parseInt(process.env.TRAEFIK_SSL_PORT ?? "", 10) || 443;
const TRAEFIK_PORT = Number.parseInt(process.env.TRAEFIK_PORT ?? "", 10) || 80;

const verifyPaths = () => {
    const paths = [
        path.resolve(`${MAIN_TRAEFIK_PATH}/traefik.yml`),
        path.resolve(DYNAMIC_TRAEFIK_PATH),
        '/var/run/docker.sock'
    ];

    for (const p of paths) {
        if (!fs.existsSync(p)) {
            throw new Error(`Path does not exist: ${p}`);
        }
    }
};

const loadAdditionalPorts = () => {
    try {
        const data = fs.readFileSync(path.resolve('./ADDITIONAL_PORTS.json'), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Failed to load ADDITIONAL_PORTS.json', error);
        return [];
    }
};

export const initializeTraefik = async () => {
    try {
        verifyPaths();
    } catch (error) {
        console.error("error verifying paths");
        process.exit(1);
    }

    const imageName = "traefik:v3.0";
    const containerName = "dokploy-traefik";
    const basePorts = [
        {
            TargetPort: 443,
            PublishedPort: TRAEFIK_SSL_PORT,
            PublishMode: "host",
        },
        {
            TargetPort: 80,
            PublishedPort: TRAEFIK_PORT,
            PublishMode: "host",
        },
        {
            TargetPort: 8080,
            PublishedPort: 8080,
            PublishMode: "host",
        },
    ];

    const additionalPorts = loadAdditionalPorts();

    const settings = {
        Name: containerName,
        TaskTemplate: {
            ContainerSpec: {
                Image: imageName,
                Mounts: [
                    {
                        Type: "bind",
                        Source: path.resolve(`${MAIN_TRAEFIK_PATH}/traefik.yml`),
                        Target: "/etc/traefik/traefik.yml",
                    },
                    {
                        Type: "bind",
                        Source: path.resolve(DYNAMIC_TRAEFIK_PATH),
                        Target: "/etc/dokploy/traefik/dynamic",
                    },
                    {
                        Type: "bind",
                        Source: "/var/run/docker.sock",
                        Target: "/var/run/docker.sock",
                    },
                ],
            },
            Networks: [{ Target: "dokploy-network" }],
            Placement: {
                Constraints: ["node.role==manager"],
            },
        },
        Mode: {
            Replicated: {
                Replicas: 1,
            },
        },
        EndpointSpec: {
            Ports: [...basePorts, ...additionalPorts],
        },
    };

    try {
        const service = docker.getService(containerName);
        await service.remove();
        console.log(`Existing Traefik service removed ✅`);
    } catch (error) {
        console.error(`Failed to remove existing Traefik service:`, error);
    }

    try {
        console.log('Creating new Traefik service with settings:', settings);
        await docker.createService(settings);
        console.log("New Traefik service created and started ✅");
    } catch (createError) {
        console.error('Failed to create the new Traefik service:', createError);
    }
};

initializeTraefik().catch(console.error);
