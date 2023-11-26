import {Router} from "express";
import * as AddressControllerV1 from '../../controllers/address/v1'
import {HandlerV1} from "../error/v1";

const router = Router();

router
    .get('/', HandlerV1.bind(this, AddressControllerV1.get))
    .post('/', HandlerV1.bind(this, AddressControllerV1.post))
    .delete('/', HandlerV1.bind(this, AddressControllerV1.del))

export default router;
