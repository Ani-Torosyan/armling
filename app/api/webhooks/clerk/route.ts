import { clerkClient } from "@clerk/nextjs/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { createUser } from "@/db/actions/user.actions";
import { stringify } from "querystring";

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

    if(!WEBHOOK_SECRET) {
        throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard.')
    }

    const headerPayLoad = await headers();
    const svix_id = headerPayLoad.get("svix-id");
    const svix_timestamp = headerPayLoad.get("svix-timestamp");
    const svix_signature = headerPayLoad.get("svix-signature");

    if(!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error occured -- no svix headers', {
            status: 400
        })
    }

    const payload = await req.json()
    const body = JSON.stringify(payload);

    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent

    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent
    } catch (err) {
        console.error('Error verifying webhook:', err);
        return new Response('Error occured', {
            status: 400
        })
    }

    const { id } = evt.data;
    const eventType = evt.type;

    if(eventType == "user.created") {
        const {id, image_url, username} =
        evt.data;

        const user = {
            clerkId: id,
            userName: username!,
            userImg: image_url,
        };

        console.log(user);

        const newUser = await createUser(user);

        if(newUser) {
            const client = await clerkClient();
            await client.users.updateUserMetadata(id, {
                publicMetadata: {
                    userId: newUser._id,

                },
            });
        }

        return NextResponse.json({message: "New user created", user: newUser});
    }

    console.log(`Webhook with and ID of ${id} and type of ${eventType}`)
    console.log('Webhook body:', body)

    return new Response ('', { status: 200 })
}
