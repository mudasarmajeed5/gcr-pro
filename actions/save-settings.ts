"use server"
import { auth } from "@/auth" // your auth config
import UserSettings from "@/models/UserSettings";
import { connectDB } from "@/lib/connectDB";

export async function saveSettings(formData: FormData) {
    try {
        await connectDB();
        const session = await auth()
        const userId = session?.user?.id
        if (!userId) return { success: false, message: "Unauthorized" }
        const smtpPassword = formData.get("smtpPassword") as string;
        const smtp = smtpPassword.replace(/\s+/g, "");

        const showGradeCard = formData.get("showGradeCard") === "on"
        const updatedSettings = await UserSettings.findOneAndUpdate(
            { userId: userId },
            {
                smtpPassword: smtp,
                showGradeCard
            },
            { new: true, upsert: true }
        )

        if (!updatedSettings._id) return { success: false, message: "Unable to save settings." }

        return { success: true, message: "Settings saved" }
    } catch (error) {
        return { success: false, message: "Error saving settings" }
    }
}