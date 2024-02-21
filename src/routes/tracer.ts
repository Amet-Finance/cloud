import {Router} from "express";
import client from "prom-client"

const router = Router();
const register = new client.Registry();

// Enable the collection of default metrics
client.collectDefaultMetrics({register});

// Define a route to expose the metrics
// Return all metrics the Prometheus exposition format
router.get('/', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await register.metrics());
});

export default router;
