import { Webhook } from "svix";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req) {
  const payload = await req.json();
  const headers = req.headers;

  const wh = new Webhook(process.env.CLERK_SECRET_KEY);
  try {
    wh.verify(JSON.stringify(payload), {
      "svix-id": headers.get("svix-id"),
      "svix-timestamp": headers.get("svix-timestamp"),
      "svix-signature": headers.get("svix-signature"),
    });
  } catch (err) {
    return new Response("Invalid signature", { status: 400 });
  }

  if (payload.type === "user.created") {
    const userId = payload.data.id;
    await clerkClient.organizations.createOrganizationMembership({
      organizationId: "org_2uozBkNYWI2mY6TFUSOdk3f7FcM", // Replace with your org ID
      userId,
      role: "org:member",
    });
  }

  return new Response("OK", { status: 200 });
}
