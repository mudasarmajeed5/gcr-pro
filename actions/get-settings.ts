"use server"
import { auth } from "@/auth"
import { connectDB } from "@/lib/connectDB";
import UserSettings from "@/models/UserSettings";

export interface UserSettingsType {
  _id: string,
  userId: string,
  __v: number
  createdAt: Date,
  showGradeCard: boolean,
  smtpPassword: string,
  themeId?: string,
  updatedAt: Date
}

type ServerResponse<T> =
  | { success: true; message: T }
  | { success: false; message: string };

export async function getSettings(): Promise<ServerResponse<UserSettingsType>> {
  try {
    await connectDB();
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, message: "Unauthorized" };

    const user = await UserSettings.findOne({ userId });
    if (!user) return { success: false, message: "User not found" };

    const parsedUser: UserSettingsType = JSON.parse(JSON.stringify(user));

    return { success: true, message: parsedUser };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}
