import { CreateUserModel } from "@/models/createUserModel";
import { User } from "@prisma/client";
import axios from "axios";

export async function createUser(createUser: CreateUserModel) {
  await axios.post("/api/create-user", createUser);
}

export async function getUser(uid: string): Promise<User | null> {
  const result = await axios.get(`/api/get-user/${uid}`);
  const userResult: User = await result.data;
  return userResult;
}
