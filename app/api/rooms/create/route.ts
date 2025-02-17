import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { Liveblocks } from "@liveblocks/node";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

const defaultSettings = {
  roomName: "Untitled Room",
  isPrivate: false,
  enableVoiceChat: true,
  enableTextChat: true,
  requireVoteForCompilation: false,
  maxUsers: 10,
};

export async function POST(request: NextRequest) {
  try {
    const { roomName } = await request.json();
    const roomId = `room-${nanoid(10)}`;
    const settings = {
      ...defaultSettings,
      roomName: roomName || defaultSettings.roomName,
    };

    await liveblocks.createRoom(roomId, {
      defaultAccesses: settings.isPrivate ? [] : ["room:write"],
      metadata: {
        settings: JSON.stringify(settings),
      },
    });

    return NextResponse.json({
      roomId,
      url: `/rooms/${roomId}`,
      settings,
    });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
} 