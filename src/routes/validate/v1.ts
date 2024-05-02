import { Router } from 'express';
import { HandlerV1 } from '../error/v1';
import ValidateControllerV1 from '../../controllers/validate/v1';

const router = Router();

router
    .get('/twitter', HandlerV1.bind(null, ValidateControllerV1.twitter))
    .get('/discord', HandlerV1.bind(null, ValidateControllerV1.discord))
    .get('/email', HandlerV1.bind(null, ValidateControllerV1.email))

export default router;
