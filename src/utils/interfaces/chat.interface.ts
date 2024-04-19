export interface User {
  userSeq: number;
  nickName: string;
  socketId: string;
}

export interface Room {
  name: string;
  host: User;
  users: User[];
}

export interface Message {
  user: User;
  timeSent: string;
  message: string;
  roomName: string;
}

export interface ServerToClientEvents {
  chat: (e: Message) => void;
}

export interface ClientToServerEvents {
  chat: (e: Message) => void;
  joinRoom: (e: { user: User; roomName: string }) => void;
}
