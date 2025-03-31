import { Webhook } from "svix";
import { headers } from "next/headers";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const body = await req.json();
  const svixHeaders = await headers();

  console.log("Webhook received:", JSON.stringify(body));

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Webhook secret not set");
    return new Response("Webhook secret not set", { status: 500 });
  }

  const webhook = new Webhook(webhookSecret);
  try {
    webhook.verify(JSON.stringify(body), {
      "svix-id": svixHeaders.get("svix-id")!,
      "svix-timestamp": svixHeaders.get("svix-timestamp")!,
      "svix-signature": svixHeaders.get("svix-signature")!,
    });
    console.log("Webhook signature verified successfully");
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Webhook verification failed", { status: 400 });
  }

  if (body.type === "user.created") {
    const userId = body.data.id;
    console.log("Processing user.created event for user:", userId);

    try {
      await (
        await clerkClient()
      ).users.updateUserMetadata(userId, {
        publicMetadata: {
          role: "member",
        },
      });
      console.log(`Successfully assigned 'member' role to user ${userId}`);
    } catch (err) {
      console.error(`Failed to assign role to user ${userId}:`, err);
      return new Response("Failed to update user metadata", { status: 500 });
    }
  } else {
    console.log("Event type not handled:", body.type);
  }

  return new Response("Success", { status: 200 });
}
