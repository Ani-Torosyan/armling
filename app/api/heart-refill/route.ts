import { NextResponse } from 'next/server';
import { heartRefillJob } from '@/jobs/heartRefillJob';
export async function GET() {
  try {
    await heartRefillJob();
    
    return new NextResponse("Heart refill job executed successfully.", { status: 200 });
  } catch (error) {
    console.error("Error executing heart refill job:", error);
    return new NextResponse("Failed to execute heart refill job.", { status: 500 });
  }
}
