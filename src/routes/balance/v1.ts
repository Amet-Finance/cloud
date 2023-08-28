import {Router} from "express";
import * as BalanceV1 from '../../controllers/balance/v1'

const router = Router();

router.get('/:address', BalanceV1.getBalance);

export default router;