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
    // En un entorno real, extraeríamos el token (ej. JWT), validaríamos el usuario
    // y asignaríamos el cliente a sus rooms según sus citas.
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody('appointmentId') appointmentId: string,
    @MessageBody('userId') userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    // 1. Validar que la cita existe
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      client.emit('error', 'Appointment not found');
      return;
    }

    // 2. Validar que el usuario es el cliente o el técnico asignado
    if (appointment.clientId !== userId && appointment.techId !== userId) {
      client.emit('error', 'Unauthorized to join this room');
      return;
    }

    // 3. Unirse a la sala
    client.join(appointmentId);
    console.log(`User ${userId} joined room ${appointmentId}`);
    
    client.emit('joinedRoom', { appointmentId, message: 'Successfully joined' });
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() payload: { appointmentId: string; senderId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // 1. Guardar mensaje en la base de datos a través de Prisma
      const message = await this.prisma.message.create({
        data: {
          content: payload.content,
          senderId: payload.senderId,
          appointmentId: payload.appointmentId,
        },
        include: {
          sender: {
            select: {
              name: true,
              role: true,
            }
          }
        }
      });

      // 2. Emitir mensaje a la sala específica
      this.server.to(payload.appointmentId).emit('newMessage', message);
      
      return { success: true, data: message };
    } catch (error) {
      console.error('Error sending message:', error);
      client.emit('error', 'Failed to send message');
      return { success: false, error: 'Failed to save message' };
    }
  }
}
