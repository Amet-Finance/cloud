import {Router} from "express";
import * as ContractControllerV1 from '../../controllers/contract/v1'
import {HandlerV1} from "../error/v1";

const router = Router();

router
    .get('/', HandlerV1.bind(this, ContractControllerV1.getBonds))
    .patch('/description', HandlerV1.bind(this, ContractControllerV1.updateDescription))

export default router;
