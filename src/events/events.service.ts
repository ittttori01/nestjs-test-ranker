import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class EvevntsService {
  private readonly connectedClientId: Map<string, Socket> = new Map();

  handleConnected(socket: Socket): void {
    const clientId = socket.id;
    this.connectedClientId.set(clientId, socket);

    socket.on('disconnect', () => {
      this.connectedClientId.delete(clientId);
    });
  }
}
