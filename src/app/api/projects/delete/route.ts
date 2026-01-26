import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await db.execute('DELETE FROM project_briefs WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}