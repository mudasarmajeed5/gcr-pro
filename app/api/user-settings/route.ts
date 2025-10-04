import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { connectDB } from "@/lib/connectDB"
import UserSettings from "@/models/UserSettings"

export async function GET() {
    try {
        await connectDB()
        const session = await auth()
        const userId = session?.user?.id
        if (!userId) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

        const settings = await UserSettings.findOne({ userId })
        return NextResponse.json({ success: true, message: settings || {} })
    } catch (e) {
        console.error('Error in user-settings API', e)
        return NextResponse.json({ success: false, message: 'Error' }, { status: 500 })
    }
}
