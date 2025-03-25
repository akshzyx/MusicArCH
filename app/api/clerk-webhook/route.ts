// app/api/clerk-webhook/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  console.log("Webhook received:", { svix_id, svix_timestamp });

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing Svix headers");
    return new Response("Missing Svix headers", { status: 400 });
  }

  const body = await req.text();
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is not set in .env.local");
    throw new Error("CLERK_WEBHOOK_SECRET is not set");
  }

  const wh = new Webhook(webhookSecret);
  let evt;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as any;
    console.log("Webhook verified, event type:", evt.type);
  } catch (err) {
    console.error("Webhook verification failed:", err.message);
    return new Response("Webhook verification failed", { status: 400 });
  }

  if (evt.type === "user.created") {
    const userId = evt.data.id;
    const orgId = "org_2uozBkNYWI2mY6TFUSOdk3f7FcM"; // Your JojiArCHOrg ID

    console.log("Processing user.created event:", { userId, orgId });

    try {
      const membership =
        await clerkClient.organizations.createOrganizationMembership({
          organizationId: orgId,
          userId: userId,
          role: "org:member",
        });
      console.log(`User ${userId} added to JojiArCHOrg:`, membership);
      return new Response("User added to JojiArCHOrg", { status: 200 });
    } catch (error) {
      console.error("Error adding user to JojiArCHOrg:", error.message);
      return new Response(`Failed to add user: ${error.message}`, {
        status: 500,
      });
    }
  }

  console.log("Unhandled event type:", evt.type);
  return new Response("Event processed", { status: 200 });
}
