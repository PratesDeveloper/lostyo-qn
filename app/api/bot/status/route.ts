import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/firebase";

const AUTH_KEY = "c0f8b1d2-3e4f-4a5b-8c6d-7e8f9a0b1c2d";

interface StatusBody {
  servers: number;
  members: number;
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  if (key !== AUTH_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: StatusBody = await request.json();

    if (
      typeof body.servers !== "number" ||
      typeof body.members !== "number" ||
      body.servers < 0 ||
      body.members < 0
    ) {
      return NextResponse.json(
        { error: "Invalid body, expected non-negative numbers for servers and members" },
        { status: 400 }
      );
    }

    await db.doc("bot/servers").set({ count: body.servers });
    await db.doc("bot/members_servers").set({ count: body.members });

    return NextResponse.json({ success: true, servers: body.servers, members: body.members });
  } catch (err) {
    console.error("POST /status error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const serversDoc = await db.doc("bot/servers").get();
    const membersDoc = await db.doc("bot/members_servers").get();

    const servers = serversDoc.exists ? serversDoc.data()?.count ?? 0 : 0;
    const members = membersDoc.exists ? membersDoc.data()?.count ?? 0 : 0;

    const votes = 43274; // Valor fixo

    return NextResponse.json({ servers, members, votes });
  } catch (err) {
    console.error("GET /status error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
