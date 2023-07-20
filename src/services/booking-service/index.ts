import { notFoundError } from '../../errors/not-found-error';
import bookingRepository from '../../repositories/booking-repository/index';
import enrollmentRepository from '../../repositories/enrollment-repository/index';
import roomRepository from '../../repositories/room-repository/index';
import ticketsRepository from '../../repositories/tickets-repository/index';

async function getBooking(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();
  const booking = await bookingRepository.findBookingByUserId(userId);
  if (!booking) throw notFoundError();
  return booking;
}

async function postBooking(userId: number, roomId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();
  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket || ticket.status === 'RESERVED' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw notFoundError();
  }
  const room = await roomRepository.findRoomById(roomId);
  const bookings = await bookingRepository.findBookingByRoomId(roomId);
  if (room.capacity <= bookings.length) throw new Error();
  return bookingRepository.createBooking({ roomId, userId });
}

const bookingService = {
  getBooking,
  postBooking,
};

export default bookingService;
