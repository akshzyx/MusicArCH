import { Webhook } from "svix";
import { headers } from "next/headers";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const body = await req.json();
  const svixHeaders = await headers();

  // Verify webhook signature
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new Response("Webhook secret not set", { status: 500 });
  }

  const webhook = new Webhook(webhookSecret);
  try {
    webhook.verify(JSON.stringify(body), {
      "svix-id": svixHeaders.get("svix-id")!,
      "svix-timestamp": svixHeaders.get("svix-timestamp")!,
      "svix-signature": svixHeaders.get("svix-signature")!,
    });
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Webhook verification failed", { status: 400 });
  }

  // Handle user creation event
  if (body.type === "user.created") {
    const userId = body.data.id;

    // Assign "member" role to the user's publicMetadata
    await (
      await clerkClient()
    ).users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "member",
      },
    });

    console.log(`Assigned 'member' role to user ${userId}`);
  }

  return new Response("Success", { status: 200 });
}
