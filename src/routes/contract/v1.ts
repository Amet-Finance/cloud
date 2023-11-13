import {Router} from "express";
import * as ContractControllerV1 from '../../controllers/contract/v1'

const router = Router();

router
    .get('/', ContractControllerV1.getBonds);

export default router;
