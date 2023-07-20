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

type UpdateParams = Omit<Booking, 'createdAt' | 'updatedAt'>;
async function upsertBooking({ id, roomId, userId }: UpdateParams) {
  return prisma.booking.upsert({
    where: {
      id,
    },
    create: {
      roomId,
      userId,
    },
    update: {
      roomId,
    },
  });
}

type CreateBookingParams = Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>;

const bookingRepository = {
  findBookingByRoomId,
  createBooking,
  findBookingByUserId,
  upsertBooking,
};

export default bookingRepository;
