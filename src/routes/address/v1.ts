import { Router } from 'express';
import XpSystem from './xp';
import AddressControllerV1 from '../../controllers/address/v1';
import { HandlerV1 } from '../error/v1';
import SecurityMiddleware from '../middlewares/v1';

const router = Router();

router
    .use('/xp', SecurityMiddleware.signature, XpSystem)
    .get('/', HandlerV1.bind(this, AddressControllerV1.get))
    .patch(
        '/',
        SecurityMiddleware.signature,
        HandlerV1.bind(this, AddressControllerV1.patch),
    )
    .post(
        '/',
        SecurityMiddleware.signature,
        HandlerV1.bind(this, AddressControllerV1.post),
    )
    .delete(
        '/',
        SecurityMiddleware.signature,
        HandlerV1.bind(this, AddressControllerV1.del),
    );

export default router;
