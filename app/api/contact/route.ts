import { NextRequest, NextResponse } from "next/server";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, CONTACTS_TABLE } from "@/lib/dynamodb";

// This route must be dynamic so POST requests are handled at request time.
// The GitHub Pages static export excludes it via a webpack stub in next.config.ts.
export const dynamic = "force-dynamic";

type ContactSubmission = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  submittedAt: string;
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
      {
        error: "Failed to process your message",
        detail: message,
        env_check: {
          has_APP_AWS_ACCESS_KEY_ID: !!process.env.APP_AWS_ACCESS_KEY_ID,
          has_APP_AWS_SECRET_ACCESS_KEY: !!process.env.APP_AWS_SECRET_ACCESS_KEY,
          has_APP_AWS_REGION: !!process.env.APP_AWS_REGION,
          has_DYNAMODB_CONTACTS_TABLE: !!process.env.DYNAMODB_CONTACTS_TABLE,
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Protect with a secret admin key — set CONTACT_ADMIN_KEY in environment variables
  const adminKey = req.headers.get("x-admin-key");
  if (!adminKey || adminKey !== process.env.CONTACT_ADMIN_KEY) {
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
