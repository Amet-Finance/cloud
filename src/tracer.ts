import client from 'prom-client';
import app from "./server";

const register = new client.Registry();

// Enable the collection of default metrics
client.collectDefaultMetrics({register});

// Custom Metrics
const httpRequestDurationSeconds = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.1, 0.3, 1.5, 10.5],
    registers: [register],
});

const httpRequestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'code'],
    registers: [register],
});

const httpErrorCounter = new client.Counter({
    name: 'http_errors_total',
    help: 'Total number of HTTP errors',
    labelNames: ['method', 'route', 'code'],
    registers: [register],
});


// Middleware to collect HTTP metrics
app.use((req, res, next) => {
    const start = process.hrtime();

    res.on('finish', () => {
        const [seconds, nanoseconds] = process.hrtime(start);
        const duration = seconds + nanoseconds / 1e9;

        if (req.baseUrl === "/") {
            httpRequestDurationSeconds.labels(req.method, req.baseUrl, res.statusCode.toString()).observe(duration);
            httpRequestCounter.labels(req.method, req.baseUrl, res.statusCode.toString()).inc();
        }

        if (res.statusCode >= 400) {
            httpErrorCounter.labels(req.method, req.baseUrl, res.statusCode.toString()).inc();
        }
    });

    next();
});

// Metrics endpoint
app.get('/v1/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});
