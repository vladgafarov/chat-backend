export type IUser = Record<number, UserValues>;

export type UserValues = {
   name: string;
   online: boolean;
};
