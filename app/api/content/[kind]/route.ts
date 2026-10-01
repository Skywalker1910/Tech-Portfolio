import { NextRequest, NextResponse } from "next/server";
import { listContent } from "@/lib/content/repository";
import type { ContentKind } from "@/lib/content/types";
import { withProjectPresentation } from "@/lib/project-presentation";

export const dynamic = "force-dynamic";
export async function GET(_req: NextRequest, context: { params:Promise<{ kind:string }> }) {
  const { kind } = await context.params;
  if (kind !== "projects" && kind !== "experience") return NextResponse.json({ error:"Unknown content type." }, { status:404 });
  const items = await listContent(kind as ContentKind);
  return NextResponse.json(items.map(item=>item.kind === "project" ? withProjectPresentation(item) : item));
}
