import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import LiveLocation from '@/models/LiveLocaton';

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();

  const data = await LiveLocation.findOneAndUpdate(
    { busId: body.busId },
    { lat: body.lat, lng: body.lng },
    { upsert: true, new: true }
  );

  return NextResponse.json(data);
}

export async function GET() {
  await connectDB();
  const data = await LiveLocation.find();
  return NextResponse.json(data);
}
