import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; //

export async function PUT(req: Request) {
  try {
    const { employee_id } = await req.json();
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const check_out = now.toTimeString().split(' ')[0];

    // 1. Find the latest check-in for this employee today
    const [rows]: any = await db.execute(
      'SELECT id, check_in FROM attendance WHERE employee_id = ? AND date = ? AND check_out IS NULL ORDER BY id DESC LIMIT 1',
      [employee_id, date]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No active clock-in found for today' }, { status: 404 });
    }

    const attendanceId = rows[0].id;
    const checkInTime = rows[0].check_in;

    // 2. Calculate Overtime (Example: standard 9-hour shift)
    const start = new Date(`${date}T${checkInTime}`);
    const end = new Date(`${date}T${check_out}`);
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const overtime = Math.max(0, diffHours - 9).toFixed(2);

    // 3. Update the record
    await db.execute(
      'UPDATE attendance SET check_out = ?, overtime_hrs = ? WHERE id = ?',
      [check_out, overtime, attendanceId]
    );

    return NextResponse.json({ message: 'Clock-out recorded', overtime_hrs: overtime });
  } catch (error) {
    return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
  }
}