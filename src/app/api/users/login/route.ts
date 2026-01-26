import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; //

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    // Query the database for the user
    const [rows]: any = await db.execute(
      'SELECT id, username, role, full_name FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (rows.length > 0) {
      // Return user data if credentials match
      return NextResponse.json({ 
        success: true, 
        user: rows[0] 
      });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid username or password' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
}