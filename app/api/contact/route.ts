import { NextRequest, NextResponse } from "next/server";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, CONTACTS_TABLE, DeleteCommand, UpdateCommand } from "@/lib/dynamodb";
import { isValidAdminKey } from "@/lib/adminAuth";

// This route must be dynamic so POST requests are handled at request time.
// The GitHub Pages static export excludes it via a webpack stub in next.config.ts.
export const dynamic = "force-dynamic";

type SenderType = "recruiter" | "visitor" | "friend" | "test" | null;

type ContactSubmission = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  submittedAt: string;
  read: boolean;
  senderType: SenderType;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, message } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const submission: ContactSubmission = {
      id: crypto.randomUUID(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      submittedAt: new Date().toISOString(),
      read: false,
      senderType: null,
    };

    await docClient.send(
      new PutCommand({
        TableName: CONTACTS_TABLE,
        Item: submission,
      })
    );

    return NextResponse.json(
      { success: true, message: "Message received!" },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Contact form error:", message, error);
    return NextResponse.json(
      { error: "Failed to process your message" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  if (!isValidAdminKey(req.headers.get("x-admin-key"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await docClient.send(
      new ScanCommand({ TableName: CONTACTS_TABLE })
    );
    return NextResponse.json(result.Items ?? []);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!isValidAdminKey(req.headers.get("x-admin-key"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing or invalid id" }, { status: 400 });
    }

    await docClient.send(
      new DeleteCommand({ TableName: CONTACTS_TABLE, Key: { id } })
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting submission:", error);
    return NextResponse.json({ error: "Failed to delete submission" }, { status: 500 });
  }
}

const VALID_SENDER_TYPES = new Set(["recruiter", "visitor", "friend", "test", null]);

export async function PATCH(req: NextRequest) {
  if (!isValidAdminKey(req.headers.get("x-admin-key"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, read, senderType } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing or invalid id" }, { status: 400 });
    }

    const updates: string[] = [];
    const names: Record<string, string> = {};
    const values: Record<string, unknown> = {};

    if (typeof read === "boolean") {
      updates.push("#rd = :read");
      names["#rd"] = "read";
      values[":read"] = read;
    }

    if ("senderType" in body) {
      if (!VALID_SENDER_TYPES.has(senderType)) {
        return NextResponse.json({ error: "Invalid senderType" }, { status: 400 });
      }
      updates.push("senderType = :senderType");
      values[":senderType"] = senderType ?? null;
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    await docClient.send(
      new UpdateCommand({
        TableName: CONTACTS_TABLE,
        Key: { id },
        UpdateExpression: `SET ${updates.join(", ")}`,
        ExpressionAttributeNames: Object.keys(names).length ? names : undefined,
        ExpressionAttributeValues: values,
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating submission:", error);
    return NextResponse.json({ error: "Failed to update submission" }, { status: 500 });
  }
}
