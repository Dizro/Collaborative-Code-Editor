// app/api/liveblocks-auth/route.ts

// liveblocks documentation
import { Liveblocks } from "@liveblocks/node";
import { NextRequest, NextResponse } from "next/server";

const secret = process.env.LIVEBLOCKS_SECRET_KEY;

if (!secret) {
  throw new Error("Missing LIVEBLOCKS_SECRET_KEY");
}

if (!secret.startsWith("sk_")) {
  throw new Error("Invalid LIVEBLOCKS_SECRET_KEY");
}

const liveblocks = new Liveblocks({
  secret,
});

export async function POST(request: NextRequest) {
  const user = {
    id: "user-" + Math.random().toString(36).substring(2),
    info: {
      name: "Anonymous",
      avatar: "https://example.com/avatar.png",
    },
  };

  const session = liveblocks.prepareSession(user.id, {
    userInfo: user.info,
  });

  const { room } = await request.json();
  session.allow(room, session.FULL_ACCESS);

  const { status, body } = await session.authorize();
  return new NextResponse(body, { status });
}