import {Router} from "express";
import {HandlerV1} from "../error/v1";
import ContractControllerV2 from '../../controllers/contract/v2'

const router = Router();

router
    .get('/', HandlerV1.bind(this, ContractControllerV2.getBonds))

export default router;
