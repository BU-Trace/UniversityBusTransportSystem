import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Bus from '@/models/Bus';

export async function POST(req: Request) {
  await connectDB();
  const { busId, lat, lng } = await req.json();

  await Bus.findOneAndUpdate({ busId }, { lat, lng, updatedAt: new Date() }, { upsert: true });

  return NextResponse.json({ success: true });
}

export async function GET() {
  await connectDB();
  const buses = await Bus.find();
  return NextResponse.json(buses);
}
