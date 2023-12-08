import {Router} from "express";
import ContractControllerV1 from '../../controllers/contract/v1'
import {HandlerV1} from "../error/v1";
import SecurityMiddleware from "../middlewares/v1";

const router = Router();

router
    .get('/', HandlerV1.bind(this, ContractControllerV1.getBonds))
    .get('/detailed/:id', HandlerV1.bind(this, ContractControllerV1.getContractDetailed))
    .patch('/description', HandlerV1.bind(this, ContractControllerV1.updateDescription))

    .post('/report/:id', SecurityMiddleware.signature, HandlerV1.bind(this, ContractControllerV1.report))

export default router;
