import { Router } from 'express';
import { HandlerV1 } from '../error/v1';
import SecurityMiddleware from '../middlewares/v1';
import BondDescriptionControllerV1 from '../../controllers/bond/v1/description';
import BondReportControllerV1 from '../../controllers/bond/v1/report';
import BondControllerV1 from '../../controllers/bond/v1';

const router = Router();


router
    // .get('/', HandlerV1.bind(this, BondControllerV1.get))
    .patch('/description', SecurityMiddleware.signature, HandlerV1.bind(this, BondDescriptionControllerV1.update))
    .post('/report', SecurityMiddleware.signature, HandlerV1.bind(this, BondReportControllerV1.update));

export default router;
