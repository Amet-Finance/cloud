import { Router } from 'express';
import { HandlerV1 } from '../error/v1';
import ValidateControllerV1 from '../../controllers/validate/v1';

const router = Router();

router.post('/twitter', HandlerV1.bind(null, ValidateControllerV1.twitter));

export default router;
