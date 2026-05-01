import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Temporary diagnostic endpoint — returns whether key env vars are set (not their values).
// DELETE THIS FILE after the production issue is resolved.
export async function GET() {
  return NextResponse.json({
    ADMIN_KEY_set: !!process.env.ADMIN_KEY,
    ADMIN_KEY_length: process.env.ADMIN_KEY?.length ?? 0,
    APP_AWS_ACCESS_KEY_ID_set: !!process.env.APP_AWS_ACCESS_KEY_ID,
    DYNAMODB_CONTACTS_TABLE_set: !!process.env.DYNAMODB_CONTACTS_TABLE,
    NODE_ENV: process.env.NODE_ENV,
  });
}
