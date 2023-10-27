import {Router} from "express";
import * as AddressControllerV1 from '../../controllers/address/v1'

const router = Router();

router
    .get('/', (req, res) => AddressControllerV1.get)
    .post('/', (req, res) => AddressControllerV1.post)
    .delete('/', (req, res) => AddressControllerV1.del)

export default router;
