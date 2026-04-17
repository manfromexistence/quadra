import { Buffer } from "node:buffer";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { edmsFileAssets } from "@/db/schema/edms-file-assets";
import { auth } from "@/lib/auth";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "You must be signed in to access files." },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  const [asset] = await db
    .select({
      fileName: edmsFileAssets.fileName,
      fileType: edmsFileAssets.fileType,
      dataBase64: edmsFileAssets.dataBase64,
    })
    .from(edmsFileAssets)
    .where(eq(edmsFileAssets.id, id))
    .limit(1);

  if (!asset) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  const fileBuffer = Buffer.from(asset.dataBase64, "base64");

  return new Response(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": asset.fileType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${encodeURIComponent(asset.fileName)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
