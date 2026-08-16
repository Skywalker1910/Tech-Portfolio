import { NextRequest, NextResponse } from "next/server";
import { isValidAdminRequest } from "@/lib/adminAuth";
import { deleteContent, listContent, saveContent } from "@/lib/content/repository";
import type { ContentKind } from "@/lib/content/types";
import { validateContent } from "@/lib/content/validation";

export const dynamic = "force-dynamic";
async function kindFrom(context: { params:Promise<{ kind:string }> }): Promise<ContentKind | null> { const { kind } = await context.params; return kind === "projects" || kind === "experience" ? kind : null; }
const unauthorized = () => NextResponse.json({ error:"Unauthorized" }, { status:401 });

export async function GET(req: NextRequest, context: { params:Promise<{ kind:string }> }) {
  if (!isValidAdminRequest(req)) return unauthorized();
  const kind = await kindFrom(context); if (!kind) return NextResponse.json({ error:"Unknown content type." }, { status:404 });
  return NextResponse.json(await listContent(kind, true));
}

export async function PUT(req: NextRequest, context: { params:Promise<{ kind:string }> }) {
  if (!isValidAdminRequest(req)) return unauthorized();
  const kind = await kindFrom(context); if (!kind) return NextResponse.json({ error:"Unknown content type." }, { status:404 });
  const item = validateContent(kind, await req.json().catch(() => null));
  if (!item) return NextResponse.json({ error:"Please complete all required fields." }, { status:400 });
  try { return NextResponse.json(await saveContent(kind, item)); }
  catch (error) { console.error("[admin content] Save failed", error); return NextResponse.json({ error:"Could not save. Run the content table setup first." }, { status:503 }); }
}

export async function DELETE(req: NextRequest, context: { params:Promise<{ kind:string }> }) {
  if (!isValidAdminRequest(req)) return unauthorized();
  const kind = await kindFrom(context); if (!kind) return NextResponse.json({ error:"Unknown content type." }, { status:404 });
  const id = String((await req.json().catch(() => ({}))).id ?? "").trim();
  if (!id) return NextResponse.json({ error:"Missing id." }, { status:400 });
  try { await deleteContent(kind, id); return NextResponse.json({ success:true }); }
  catch (error) { console.error("[admin content] Delete failed", error); return NextResponse.json({ error:"Could not delete content." }, { status:503 }); }
}
