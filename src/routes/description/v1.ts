import { Router } from 'express';
import { HandlerV1 } from '../error/v1';
import SecurityMiddleware from '../middlewares/v1';
import DescriptionControllerV1 from '../../controllers/description/v1';

const router = Router();

router.patch('/', SecurityMiddleware.signature, HandlerV1.bind(this, DescriptionControllerV1.update));

export default router;
