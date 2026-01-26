import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { client_name, service_type, deadline, description } = await req.json();

    const [result]: any = await db.execute(
      'INSERT INTO project_briefs (client_name, service_type, deadline, description) VALUES (?, ?, ?, ?)',
      [client_name, service_type, deadline, description]
    );

    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Project Submission Error:', error);
    return NextResponse.json({ error: 'Failed to submit brief' }, { status: 500 });
  }
}