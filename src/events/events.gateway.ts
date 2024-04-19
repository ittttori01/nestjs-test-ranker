import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EvevntsService } from './events.service';

@WebSocketGateway(9001, { namespace: 'chat', cors: { origin: '*' } })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly eventsService: EvevntsService) {}

  @WebSocketServer() server: Server;
  private roomUsers: { [key: string]: string[] } = {};
  private clientsIds: { [socketId: string]: string } = {};
  private connectedClients: { [socketId: string]: boolean } = {};

  private logger: Logger = new Logger('EventsGateway');

  afterInit(server: Server) {
    this.logger.log('웹소켓 서버 초기화');
  }
  handleMessage(client: Socket, @MessageBody() data: string) {
    this.logger.log(data);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client Connected : ${client.id}`);

    if (this.connectedClients[client.id]) {
      client.disconnect(true);
      return;
    }

    this.connectedClients[client.id] = true;
    // this.eventsService.handleConnected(socket);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client Disconnected : ${client.id}`);
    delete this.connectedClients[client.id];
  }

  @SubscribeMessage('clientInfo')
  async saveClientInfo(client: Socket, data: any) {
    console.log(data);
  }
  //참여
  @SubscribeMessage('join')
  async handleJoin(client: Socket, room: string): Promise<void> {
    if (client.rooms.has(room)) {
      return;
    }

    this.logger.log(`====JOINED ROOM===== ${room}`);
    this.logger.log(`====JOINED CLient===== ${client.id}`);

    client.join(room);
  }

  //수신
  @SubscribeMessage('onSend')
  handleOnsend(userid: string, room: string, message: any) {}

  @SubscribeMessage('SetClientsIds')
  handleSetClientIds(client: Socket, id: string): void {
    this.clientsIds[client.id] = id;
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(room: string): void {
    this.server.except(room);
    console.log(this.server);
  }
}
