import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/firebase";

const AUTH_KEY = "c0f8b1d2-3e4f-4a5b-8c6d-7e8f9a0b1c2d";
const docRef = db.doc("bot/statistics");

export async function POST(req: NextRequest) {
  if (new URL(req.url).searchParams.get("key") !== AUTH_KEY)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { servers, members } = await req.json();
    if (![servers, members].every(n => typeof n === "number" && n >= 0))
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

    await docRef.set({ servers, members }, { merge: true });
    return NextResponse.json({ success: true, servers, members });
  } catch (e) {
    console.error("POST /status error:", e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const snap = await docRef.get();
    const data = snap.exists ? snap.data() : { servers: 0, members: 0 };
    return NextResponse.json({ ...data, votes: 43274 });
  } catch (e) {
    console.error("GET /status error:", e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
