import {Router} from "express";
import AffiliateControllerV1 from '../../controllers/affiliate/v1'
import SecurityMiddleware from "../middlewares/v1";

const router = Router();

router
    .post('/', SecurityMiddleware.signature, AffiliateControllerV1.becomeAnAffiliate)

export default router;
