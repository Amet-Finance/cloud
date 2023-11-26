import {Router} from "express";
import * as TokenControllerV1 from '../../controllers/token/v1'
import {HandlerV1} from "../error/v1";

const router = Router();

router
    .get('/', HandlerV1.bind(this, TokenControllerV1.get))

export default router;
