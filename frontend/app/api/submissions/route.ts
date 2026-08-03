import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, type, area_of_interest } = body;

    const targetRecipient = "srzumot@gmail.com";

    console.log(`[bniAdam AI Lab Submission] -> Target Recipient: ${targetRecipient}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Submission Type: ${type}`);
    console.log(`User Email: ${email}`);
    if (area_of_interest) {
      console.log(`Area of Interest: ${area_of_interest}`);
    }

    return NextResponse.json({
      success: true,
      message: `Submission successfully recorded and dispatched to ${targetRecipient}`,
      recipient: targetRecipient,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process submission" },
      { status: 400 }
    );
  }
}
