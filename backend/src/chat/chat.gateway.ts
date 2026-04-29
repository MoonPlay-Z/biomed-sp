import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly prisma: PrismaService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody('appointmentId') appointmentId: number,
    @MessageBody('userId') userId: number,
    @ConnectedSocket() client: Socket,
  ) {
    // 1. Validar que la cita existe
    const appointment = await this.prisma.appointments.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      client.emit('error', 'Appointment not found');
      return;
    }

    // 2. Validar que el usuario es el cliente o el técnico asignado
    if (appointment.client_id !== userId && appointment.tech_id !== userId) {
      client.emit('error', 'Unauthorized to join this room');
      return;
    }

    // 3. Unirse a la sala
    void client.join(appointmentId.toString());
    console.log(`User ${userId} joined room ${appointmentId}`);

    client.emit('joinedRoom', {
      appointmentId,
      message: 'Successfully joined',
    });
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    payload: { appointmentId: number; senderId: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // 1. Guardar mensaje en la base de datos a través de Prisma
      const message = await this.prisma.messages.create({
        data: {
          mensaje: payload.content,
          sender_id: payload.senderId,
          appointment_id: payload.appointmentId,
        },
        include: {
          sender: {
            select: {
              nombre: true,
              role: true,
            },
          },
        },
      });

      // 2. Emitir mensaje a la sala específica
      void this.server
        .to(payload.appointmentId.toString())
        .emit('newMessage', message);

      return { success: true, data: message };
    } catch (error) {
      console.error('Error sending message:', error);
      client.emit('error', 'Failed to send message');
      return { success: false, error: 'Failed to save message' };
    }
  }
}
