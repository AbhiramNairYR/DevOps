const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
app.use(cors()); // Allows frontend to request data
app.use(express.json());

const parts = {
    cpus: [
        { id: "cpu-1", name: "Intel Core i3-14100", socket: "LGA1700", price: 149 },
        { id: "cpu-2", name: "Intel Core i5-13600K", socket: "LGA1700", price: 289 },
        { id: "cpu-3", name: "Intel Core i5-14600K", socket: "LGA1700", price: 319 },
        { id: "cpu-4", name: "Intel Core i7-14700K", socket: "LGA1700", price: 409 },
        { id: "cpu-5", name: "Intel Core i9-14900K", socket: "LGA1700", price: 589 },
        { id: "cpu-6", name: "AMD Ryzen 3 8300G", socket: "AM5", price: 179 },
        { id: "cpu-7", name: "AMD Ryzen 5 7600", socket: "AM5", price: 229 },
        { id: "cpu-8", name: "AMD Ryzen 7 7800X3D", socket: "AM5", price: 389 },
        { id: "cpu-9", name: "AMD Ryzen 9 7900X", socket: "AM5", price: 429 },
        { id: "cpu-10", name: "AMD Ryzen 9 7950X3D", socket: "AM5", price: 649 }
    ],
    motherboards: [
        { id: "mb-1", name: "ASUS PRIME B760M-A", socket: "LGA1700", formFactor: "micro ATX", price: 169 },
        { id: "mb-2", name: "MSI PRO B760-P WIFI", socket: "LGA1700", formFactor: "ATX", price: 189 },
        { id: "mb-3", name: "Gigabyte Z790 AORUS ELITE AX", socket: "LGA1700", formFactor: "ATX", price: 279 },
        { id: "mb-4", name: "ASRock Z790M-ITX", socket: "LGA1700", formFactor: "mini ATX", price: 259 },
        { id: "mb-5", name: "MSI MEG Z790 GODLIKE", socket: "LGA1700", formFactor: "EATX", price: 999 },
        { id: "mb-6", name: "MSI MPG B650 CARBON WIFI", socket: "AM5", formFactor: "ATX", price: 299 },
        { id: "mb-7", name: "Gigabyte B650M DS3H", socket: "AM5", formFactor: "micro ATX", price: 159 },
        { id: "mb-8", name: "ASRock B650E PG-ITX", socket: "AM5", formFactor: "mini ATX", price: 289 },
        { id: "mb-9", name: "ASUS ROG Crosshair X670E Hero", socket: "AM5", formFactor: "ATX", price: 639 },
        { id: "mb-10", name: "ASUS ROG Crosshair X670E Extreme", socket: "AM5", formFactor: "EATX", price: 999 }
    ],
    gpus: [
        { id: "gpu-1", name: "GeForce RTX 4060 Solo", fans: 1, price: 299 },
        { id: "gpu-2", name: "Radeon RX 6600 ITX", fans: 1, price: 229 },
        { id: "gpu-3", name: "GeForce RTX 4060 Twin", fans: 2, price: 319 },
        { id: "gpu-4", name: "Radeon RX 7600 Dual", fans: 2, price: 269 },
        { id: "gpu-5", name: "GeForce RTX 4070 SUPER Dual", fans: 2, price: 589 },
        { id: "gpu-6", name: "Radeon RX 7700 XT Dual", fans: 2, price: 429 },
        { id: "gpu-7", name: "GeForce RTX 4080 SUPER Triple", fans: 3, price: 999 },
        { id: "gpu-8", name: "GeForce RTX 4090 Triple", fans: 3, price: 1599 },
        { id: "gpu-9", name: "Radeon RX 7900 XT Triple", fans: 3, price: 749 },
        { id: "gpu-10", name: "Radeon RX 7900 XTX Triple", fans: 3, price: 949 }
    ],
    cases: [
        { id: "case-1", name: "NZXT H210", size: "small", maxGpuFans: 2, maxFormFactor: "mini ATX", price: 89 },
        { id: "case-2", name: "Cooler Master NR200", size: "small", maxGpuFans: 2, maxFormFactor: "micro ATX", price: 99 },
        { id: "case-3", name: "Thermaltake Core V1", size: "small", maxGpuFans: 2, maxFormFactor: "mini ATX", price: 59 },
        { id: "case-4", name: "Corsair 4000D Airflow", size: "mid", maxGpuFans: 3, maxFormFactor: "ATX", price: 104 },
        { id: "case-5", name: "NZXT H5 Flow", size: "mid", maxGpuFans: 3, maxFormFactor: "ATX", price: 94 },
        { id: "case-6", name: "Lian Li Lancool 216", size: "mid", maxGpuFans: 3, maxFormFactor: "ATX", price: 109 },
        { id: "case-7", name: "Fractal Pop Air", size: "mid", maxGpuFans: 3, maxFormFactor: "ATX", price: 89 },
        { id: "case-8", name: "Corsair 7000D Airflow", size: "full tower", maxGpuFans: 3, maxFormFactor: "EATX", price: 269 },
        { id: "case-9", name: "Fractal Define 7 XL", size: "full tower", maxGpuFans: 3, maxFormFactor: "EATX", price: 229 },
        { id: "case-10", name: "Phanteks Enthoo Pro 2", size: "full tower", maxGpuFans: 3, maxFormFactor: "EATX", price: 139 }
    ]
};

// Health check endpoint for Kubernetes
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

app.get('/api/parts', (req, res) => {
    res.json(parts);
});

function execCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, { timeout: 15000 }, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(stderr || error.message));
                return;
            }
            resolve(stdout.trim());
        });
    });
}

app.get('/api/swarm/services', async (req, res) => {
    try {
        const output = await execCommand("docker service ls --format '{{json .}}'");
        const services = output
            .split('\n')
            .filter(Boolean)
            .map((line) => JSON.parse(line));
        res.json({ services });
    } catch (error) {
        res.status(500).json({ error: `Unable to fetch services: ${error.message}` });
    }
});

app.get('/api/swarm/tasks/:service', async (req, res) => {
    const service = req.params.service;
    try {
        const output = await execCommand(`docker service ps ${service} --format '{{json .}}'`);
        const tasks = output
            .split('\n')
            .filter(Boolean)
            .map((line) => JSON.parse(line));
        res.json({ service, tasks });
    } catch (error) {
        res.status(500).json({ error: `Unable to fetch tasks: ${error.message}` });
    }
});

app.post('/api/swarm/scale', async (req, res) => {
    const { service, replicas } = req.body;
    if (!service || Number.isNaN(Number(replicas))) {
        return res.status(400).json({ error: 'service and replicas are required.' });
    }

    try {
        await execCommand(`docker service scale ${service}=${Number(replicas)}`);
        return res.json({ ok: true, message: `Scaled ${service} to ${Number(replicas)}.` });
    } catch (error) {
        return res.status(500).json({ error: `Scale failed: ${error.message}` });
    }
});

app.post('/api/swarm/restart', async (req, res) => {
    const { service } = req.body;
    if (!service) {
        return res.status(400).json({ error: 'service is required.' });
    }

    try {
        await execCommand(`docker service update --force ${service}`);
        return res.json({ ok: true, message: `Restart triggered for ${service}.` });
    } catch (error) {
        return res.status(500).json({ error: `Restart failed: ${error.message}` });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Catalog service running on port ${PORT}`);
});