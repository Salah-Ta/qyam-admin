import { User } from "better-auth";

export type Material = {
  id?: string;
  storageKey: string;
  title: string;
  categoryId: string;
  published: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Category = {
  id?: string;
  title: string;
  icon: string;
  Material: Material[];
};

export type Program = {
  id?: string;
  link: string;
  title: string;
  description: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
};
export type Statistics = {
  registeredUsers:number;
  curriculums:number;
  trainingHours:number;
}

export type Article = {
  id?: string;
  image: string|null;
  content: string;
  title: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type AcceptenceState = "accepted" | "denied" | "pending" | "idle";
export type QUser = User & {
  acceptenceState: AcceptenceState;
  cvKey: string;
  bio: string;
  phone: number;
  trainingHours: number;
  noStudents: number;
  role: "user" | "admin";
  region:string,
  level:string
};

export type StatusResponse<T> = {
  status: "success" | "error" | "warning";
  message?: string;
  data?: T | T[];
};

type UserCertificate = {
  userId: string;
  certificateKey: string;
  size: number;
  contentType: string;
  name: DialogTitleProps;
  id?: string;
};

export type Region = {
  id?: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
};
