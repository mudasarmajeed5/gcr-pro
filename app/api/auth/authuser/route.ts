// app/api/authuser/route.js
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import UserSettings from "@/models/UserSettings";
import { connectDB } from "@/lib/connectDB";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", authUserId: null, themeId: "neutral" },
        { status: 401 },
      );
    }

    await connectDB();
    const cookieStore = await cookies();
    const authuser = cookieStore.get("authuser")?.value;

    const parsedAuthUser = authuser ? Number.parseInt(authuser, 10) : null;
    const isValidAuthUser = Number.isFinite(parsedAuthUser);

    // Ensure a settings document always exists for an authenticated user.
    const updatedUser = await UserSettings.findOneAndUpdate(
      { userId },
      {
        ...(isValidAuthUser ? { authUserId: parsedAuthUser } : {}),
        $setOnInsert: {
          userId,
          authUserId: 0,
          themeId: "neutral",
        },
      },
      { new: true, upsert: true },
    );

    const themeId = updatedUser.themeId ?? "neutral";

    const res = NextResponse.json({
      authUserId: updatedUser.authUserId ?? null,
      themeId,
    });

    // Keep theme in a cookie for quick client-side reads.
    try {
      res.cookies.set("themeId", String(themeId), {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
      });
    } catch (e) {
      console.error("Unable to set themeId cookie", e);
    }

    return res;
  } catch (error) {
    console.error("authuser route failed", error);
    return NextResponse.json(
      {
        error: "Auth user service unavailable",
        authUserId: null,
        themeId: "neutral",
      },
      { status: 503 },
    );
  }
}
