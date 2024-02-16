import {Router} from "express";
import {HandlerV1} from "../error/v1";
import ContractControllerV2 from '../../controllers/contract/v2'
import SecurityMiddleware from "../middlewares/v1";

const router = Router();

router
    .get('/', HandlerV1.bind(this, ContractControllerV2.getBonds))
    .patch('/description', SecurityMiddleware.signature, HandlerV1.bind(this, ContractControllerV2.updateDescription))

export default router;
