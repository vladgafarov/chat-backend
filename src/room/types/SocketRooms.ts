import { User } from '@prisma/client';

export type SocketRooms = Record<
   string,
   { roomId: number; user: Pick<User, 'id' | 'name' | 'email'> }
>;
