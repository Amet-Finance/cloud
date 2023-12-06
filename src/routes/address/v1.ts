import {Router} from "express";
import * as AddressControllerV1 from '../../controllers/address/v1'
import {HandlerV1} from "../error/v1";
import SecurityMiddleware from "../middlewares/v1";

const router = Router();
// middleware
router
    .get('/', HandlerV1.bind(this, AddressControllerV1.get))
    .post('/', SecurityMiddleware.signature, HandlerV1.bind(this, AddressControllerV1.post))
    .delete('/', SecurityMiddleware.signature, HandlerV1.bind(this, AddressControllerV1.del))

export default router;
