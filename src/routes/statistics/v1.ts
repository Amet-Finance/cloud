import {Router} from "express";
import * as StatisticsV1 from '../../controllers/statistics/v1'

const router = Router();

router.get('/', StatisticsV1.getStats);

export default router;