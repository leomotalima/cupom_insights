export type Role = 'user' | 'model';

export type Message = {
  id: string;
  role: Role;
  parts: string;
  timestamp: Date;
};
