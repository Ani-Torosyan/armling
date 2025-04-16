import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import { NextResponse } from "next/server";
import { connect } from "@/db";
import User from "@/modals/user.modal";

const AZURE_STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME || "";
const AZURE_STORAGE_ACCOUNT_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY || "";

if (!AZURE_STORAGE_ACCOUNT_NAME || !AZURE_STORAGE_ACCOUNT_KEY) {
  throw new Error("Azure Storage account credentials are not defined in environment variables.");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, exerciseUUID } = body;

    if (!text || !exerciseUUID) {
      return NextResponse.json({ message: "Text and exercise UUID are required." }, { status: 400 });
    }

    await connect();

    const clerkId = request.headers.get("x-clerk-user-id");
    if (!clerkId) {
      return NextResponse.json({ message: "User not authenticated." }, { status: 401 });
    }

    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // Check if the exercise UUID already exists
    if (user.writing.includes(exerciseUUID)) {
      return NextResponse.json({ message: "Exercise already submitted." }, { status: 400 });
    }

    // Azure Blob Storage setup
    const blobServiceClient = new BlobServiceClient(
      `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
      new StorageSharedKeyCredential(AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_ACCOUNT_KEY)
    );

    const containerName = "user-writing";
    const blobName = `${clerkId}-${Date.now()}.txt`;
    const containerClient = blobServiceClient.getContainerClient(containerName);

    await containerClient.createIfNotExists();

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(text, Buffer.byteLength(text));

    // Add exercise UUID to user's writing array
    user.writing.push(exerciseUUID);
    await user.save();

    return NextResponse.json({
      message: "Text saved successfully.",
      blobName,
      containerName,
    });
  } catch (error) {
    console.error("Error saving text to Azure Blob Storage:", error);
    return NextResponse.json(
      { message: "Internal server error.", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
