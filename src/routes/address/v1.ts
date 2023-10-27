import {Router} from "express";
import * as AddressControllerV1 from '../../controllers/address/v1'

const router = Router();

router
    .get('/', AddressControllerV1.get)
    .post('/', AddressControllerV1.post)
    .delete('/', AddressControllerV1.del)

export default router;
