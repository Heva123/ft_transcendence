import { createContext } from "react";

export type User = {
  id: string;
  email: string;
  username: string;
};

export const UserContext = createContext<User | null>(null);
