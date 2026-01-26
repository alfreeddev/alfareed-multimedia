import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    // Fetch users and their logs
    const [users]: any = await db.execute('SELECT id, full_name, pay_type, pay_rate, overtime_rate FROM users WHERE role = "worker"');
    const [logs]: any = await db.execute('SELECT * FROM attendance ORDER BY date ASC, check_in ASC');

    const payrollData = users.map((user: any) => {
      let totalSeconds = 0;
      let overtimeSeconds = 0;
      let totalPay = 0;
      let daysWorked = 0;

      // Filter logs for this user
      const userLogs = logs.filter((log: any) => log.employee_id === user.id);

      userLogs.forEach((log: any) => {
        if (log.check_in && log.check_out) {
          const start = new Date(`${log.date}T${log.check_in}`);
          const end = new Date(`${log.date}T${log.check_out}`);
          
          // Calculate exact difference in seconds
          let secondsDiff = (end.getTime() - start.getTime()) / 1000;
          if (secondsDiff < 0) secondsDiff = 0; // Handle errors

          const dayOfWeek = new Date(log.date).getDay(); // 0 is Sunday

          // SUNDAY LOGIC: If Sunday, count as Overtime OR Normal based on your rule
          // Here assuming Sunday is always Overtime Rate if set, otherwise standard
          if (dayOfWeek === 0) { 
             overtimeSeconds += secondsDiff;
          } else {
             totalSeconds += secondsDiff;
          }
          
          daysWorked++;
        }
      });

      const totalHours = totalSeconds / 3600;
      const otHours = overtimeSeconds / 3600;

      // MONEY CALCULATION
      if (user.pay_type === 'hourly') {
        totalPay = (totalHours * parseFloat(user.pay_rate)) + (otHours * (parseFloat(user.overtime_rate) || parseFloat(user.pay_rate) * 1.5));
      } 
      else if (user.pay_type === 'daily') {
        // Daily rate assumes 8 hours standard. We calculate pro-rata for precision.
        const hourlyEquivalent = parseFloat(user.pay_rate) / 8; 
        totalPay = ((totalHours + otHours) * hourlyEquivalent);
      } 
      else if (user.pay_type === 'monthly') {
        // Monthly is fixed, but we add Overtime for Sundays
        totalPay = parseFloat(user.pay_rate) + (otHours * (parseFloat(user.overtime_rate) || 0));
      }

      return {
        id: user.id,
        name: user.full_name,
        payType: user.pay_type,
        daysWorked,
        totalHours: totalHours.toFixed(2),
        otHours: otHours.toFixed(2),
        totalPay: Math.round(totalPay).toLocaleString(), // Rounded to nearest Rupee
        details: userLogs // For detailed view
      };
    });

    return NextResponse.json(payrollData);
  } catch (error) {
    return NextResponse.json({ error: 'Payroll calc failed' }, { status: 500 });
  }
}