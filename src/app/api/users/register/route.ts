import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; //

export async function POST(req: Request) {
  try {
    const { full_name, username, password, role, designation } = await req.json();

    // Insert the new user into the database
    const [result]: any = await db.execute(
      'INSERT INTO users (full_name, username, password, role, designation) VALUES (?, ?, ?, ?, ?)',
      [full_name, username, password, role, designation]
    );

    return NextResponse.json({ message: 'User registered successfully', userId: result.insertId });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}