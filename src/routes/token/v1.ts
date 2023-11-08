import {Router} from "express";
import * as TokenControllerV1 from '../../controllers/token/v1'

const router = Router();

router
    .get('/', TokenControllerV1.get)

export default router;
