import { Router } from 'express';
import { HandlerV1 } from '../error/v1';
import XpSystemControllerV1 from '../../controllers/address/v1/xp';

const router = Router();

router
    .post('/activate', HandlerV1.bind(null, XpSystemControllerV1.activateAccount));
export default router;
