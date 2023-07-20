import { Router } from 'express';
import { changeBooking, getBooking, postBooking } from '../controllers/booking-controller';
import { authenticateToken } from '@/middlewares';

const bookingRouter = Router();

bookingRouter
  .all('/*', authenticateToken)
  .get('/', getBooking)
  .post('/', postBooking)
  .put('/:bookingId', changeBooking);

export { bookingRouter };
