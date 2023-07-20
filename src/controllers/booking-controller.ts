import { Response } from 'express';
import httpStatus from 'http-status';
import bookingService from '../services/booking-service/index';
import { AuthenticatedRequest } from '../middlewares/authentication-middleware';

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;
    const booking = await bookingService.getBooking(userId);
    return res.status(httpStatus.OK).send({
      id: booking.id,
      Room: booking.Room,
    });
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;
    const { roomId } = req.body;
    if (!roomId) return res.sendStatus(httpStatus.BAD_REQUEST);
    const booking = await bookingService.postBooking(userId, Number(roomId));
    return res.status(httpStatus.OK).send({
      bookingId: booking.id,
    });
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}
