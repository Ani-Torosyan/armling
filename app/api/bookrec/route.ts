import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URL!;
const client = new MongoClient(uri);
const dbName = 'ArmLing';
const collectionName = 'BookRec';

export async function GET() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const books = await collection.find().toArray();

    return NextResponse.json({ success: true, data: books });
  } catch (error) {
    console.error('MongoDB Fetch Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 });
  } finally {
    await client.close();
  }
}
