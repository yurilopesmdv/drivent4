import { Router } from 'express';
import { getBooking, postBooking } from '../controllers/booking-controller';
import { authenticateToken } from '@/middlewares';

const bookingRouter = Router();

bookingRouter.all('/*', authenticateToken).get('/', getBooking).post('/', postBooking);

export { bookingRouter };
