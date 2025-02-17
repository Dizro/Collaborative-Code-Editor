// app/api/auth/liveblocks/route.ts

// liveblocks documentation
import { Liveblocks } from "@liveblocks/node";
import { NextRequest, NextResponse } from "next/server";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  if (!process.env.LIVEBLOCKS_SECRET_KEY?.startsWith('sk_')) {
    return NextResponse.json(
      { error: 'Invalid Liveblocks secret key' },
      { status: 500 }
    );
  }

  const { room } = await request.json();
  
  const response = await liveblocks.createRoom(room, {
    defaultAccesses: ["room:write"],
  });

  return NextResponse.json(response);
}