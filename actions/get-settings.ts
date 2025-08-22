"use server"
import { auth } from "@/auth"
import { connectDB } from "@/lib/connectDB";
import UserSettings from "@/models/UserSettings";
export interface UserSettings {
    _id: string,
    userId: string,
    __v: number
    createdAt: Date,
    showGradeCard: boolean,
    smtpPassword: string,
    updatedAt: Date

}
type ServerResponse<T> =
    | { success: true; message: T }
    | { success: false; message: string };

export async function getSettings(): Promise<ServerResponse<UserSettings>> {
    try {
        await connectDB();
        const session = await auth()
        const userId = session?.user?.id
        if (!userId) return { success: false, message: "Unauthorized" }
        const user = await UserSettings.findOne({ userId });
        const parsedUser: UserSettings = JSON.parse(JSON.stringify(user));
        if (!user) {
            return { success: false, message: "User not found" }
        }
        return { success: true, message: parsedUser }
    } catch (error) {
        return { success: false, message: (error as Error).message }
    }
}