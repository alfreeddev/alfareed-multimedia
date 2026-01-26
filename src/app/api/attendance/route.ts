import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // This connects to your db.ts file

export async function POST(req: Request) {
  try {
    const { employee_id, status } = await req.json();
    
    // Get current date and time for Karachi/Pakistan
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const check_in = now.toTimeString().split(' ')[0];

    // Insert the record into your new 'attendance' table
    const [result]: any = await db.execute(
      'INSERT INTO attendance (employee_id, date, check_in, status) VALUES (?, ?, ?, ?)',
      [employee_id, date, check_in, status]
    );

    return NextResponse.json({ 
      message: 'Clock-in recorded successfully', 
      id: result.insertId 
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to record attendance' }, 
      { status: 500 }
    );
  }
}