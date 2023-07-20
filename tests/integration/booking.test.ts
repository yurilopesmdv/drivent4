import httpStatus from 'http-status';
import faker from '@faker-js/faker';
import supertest from 'supertest';
import * as jwt from 'jsonwebtoken';
import { TicketStatus } from '.prisma/client';
import { cleanDb, generateValidToken } from '../helpers';
import {
  createBooking,
  createEnrollmentWithAddress,
  createHotel,
  createPayment,
  createRoomWithHotelId,
  createTicket,
  createTicketTypeRemote,
  createTicketTypeWithHotel,
  createUser,
  createValidBody,
} from '../factories';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 200 when user has booking', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, room.id);
      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        id: booking.id,
        Room: {
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          hotelId: room.hotelId,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
        },
      });
    });
    it('should respond with status 404 when user has no booking', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
  });
});

describe('POST /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const body = createValidBody();
    const response = await server.post('/booking').send(body);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it('should respond with status 401 if given token is not valid', async () => {
    const body = createValidBody();
    const token = faker.lorem.word();
    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const body = createValidBody();
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  describe('when token is valid', () => {
    it('should respond with status 200 when user send a correct room id', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const body = {
        roomId: room.id,
      };
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        bookingId: expect.any(Number),
      });
    });
    it('should respond with status 400 when user send a invalid body', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const invalidBody = {
        roomId: 0,
      };
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(invalidBody);
      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });
    it("should respond with status 404 with a invalid body - there's not roomId", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const validBody = createValidBody();
      const response = await server
        .post('/booking')
        .set('Authorization', `Bearer ${token}`)
        .send({
          roomId: room.id + 1,
        });
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
    it.only("should respond with status 403 with a invalid body - there's not vacancy", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      await createBooking(user.id, room.id);
      await createBooking(user.id, room.id);
      await createBooking(user.id, room.id);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId: room.id,
      });
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });
  });
});
