import {Router} from "express";
import * as StatisticsV1 from '../../controllers/statistics/v1'
import {HandlerV1} from "../error/v1";

const router = Router();

router
    .get('/', HandlerV1.bind(this, StatisticsV1.getStats));

export default router;
