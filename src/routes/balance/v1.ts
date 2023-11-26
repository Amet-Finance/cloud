import {Router} from "express";
import * as BalanceV1 from '../../controllers/balance/v1'
import {HandlerV1} from "../error/v1";

const router = Router();

router
    .get('/:address', HandlerV1.bind(this, BalanceV1.getBalance));

export default router;
