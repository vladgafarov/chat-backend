import { User } from '@prisma/client';

export type CallRooms = Record<
   number,
   Pick<User, 'id' | 'name' | 'avatarThumbnailUrl'>[]
>;
