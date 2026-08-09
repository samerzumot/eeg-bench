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

    // Forward the submission to formsubmit.co (free, no API key required)
    const formSubmitResponse = await fetch(`https://formsubmit.co/ajax/${targetRecipient}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        subject: "New Website Submission - bniAdam AI Lab",
        email: email,
        submission_type: type,
        area_of_interest: area_of_interest || "N/A",
        timestamp: new Date().toLocaleString(),
      }),
    });

    console.log(`FormSubmit response status: ${formSubmitResponse.status}`);
    const formSubmitText = await formSubmitResponse.text();
    console.log(`FormSubmit response text: ${formSubmitText}`);

    if (!formSubmitResponse.ok) {
      throw new Error(`Failed to forward submission: ${formSubmitResponse.statusText}`);
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
