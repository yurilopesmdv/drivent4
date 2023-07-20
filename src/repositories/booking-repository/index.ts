import { Booking } from '@prisma/client';
import { prisma } from '@/config';

async function findBookingByRoomId(roomId: number) {
  return prisma.booking.findMany({
    where: {
      roomId,
    },
  });
}

async function createBooking({ roomId, userId }: CreateBookingParams) {
  return prisma.booking.create({
    data: {
      roomId,
      userId,
    },
  });
}

async function findBookingByUserId(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId,
    },
    include: {
      Room: true,
    },
  });
}

type CreateBookingParams = Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>;

const bookingRepository = {
  findBookingByRoomId,
  createBooking,
  findBookingByUserId,
};

export default bookingRepository;
