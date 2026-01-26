import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; //

export async function GET() {
  try {
    // We use destructuring [rows] to get only the data part of the MySQL response
    const [rows] = await db.execute(
      'SELECT * FROM attendance ORDER BY date DESC, check_in DESC LIMIT 50'
    );

    // It is safer to return an empty array [] if no rows are found
    // This prevents the frontend .filter() from crashing
    return NextResponse.json(rows || []); 
    
  } catch (error) {
    // Log the error for cPanel Passenger logs
    console.error('Fetch Error:', error);
    
    // Crucial: Return an empty array even on error, so the frontend doesn't crash
    return NextResponse.json([], { status: 500 });
  }
}