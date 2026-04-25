export const dynamic = 'force-dynamic';

/**
 * Admin Service Management
 * GET    — List all services (including inactive)
 * POST   — Create new service
 * PATCH  — Edit service (price, active status)
 * DELETE — Soft-delete (set isActive = false)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, verifyAdminRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    const isAdmin = await verifyAdminRole(currentUser.userId);
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const services = await db.service.findMany({
      include: {
        _count: { select: { applications: true } },
      },
      orderBy: { key: 'asc' },
    });

    return NextResponse.json({ services });
  } catch (error) {
    console.error('Admin services list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    // Re-verify admin role from DB (JWT role could be stale)
    const freshUser = await db.user.findFirst({
      where: { id: currentUser.userId, deletedAt: null },
      select: { role: true },
    });
    if (freshUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { key, price } = body;

    if (!key || price === undefined) {
      return NextResponse.json({ error: 'key and price are required' }, { status: 400 });
    }

    const sanitizedKey = key.toLowerCase().replace(/[^a-z0-9_]/g, '_');

    const existing = await db.service.findUnique({ where: { key: sanitizedKey } });
    if (existing) {
      return NextResponse.json({ error: 'Service key already exists' }, { status: 409 });
    }

    const service = await db.$transaction(async (tx: any) => {
      const newService = await tx.service.create({
        data: {
          key: sanitizedKey,
          price: Number(price),
          isActive: true,
        },
      });

      await tx.auditLog.create({
        data: {
          adminId: currentUser.userId,
          action: 'CREATE_SERVICE',
          entity: 'Service',
          entityId: newService.id,
          newData: { key: sanitizedKey, price: Number(price) },
        },
      });

      return newService;
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    console.error('Admin service create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    // Re-verify admin role from DB (JWT role could be stale)
    const freshUser = await db.user.findFirst({
      where: { id: currentUser.userId, deletedAt: null },
      select: { role: true },
    });
    if (freshUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, price, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const data: any = {};
    if (price !== undefined) data.price = Number(price);
    if (isActive !== undefined) data.isActive = isActive;

    const service = await db.$transaction(async (tx: any) => {
      const oldService = await tx.service.findUnique({ where: { id } });
      const updatedService = await tx.service.update({
        where: { id },
        data,
      });

      await tx.auditLog.create({
        data: {
          adminId: currentUser.userId,
          action: 'UPDATE_SERVICE',
          entity: 'Service',
          entityId: id,
          oldData: oldService as any,
          newData: data,
        },
      });

      return updatedService;
    });

    return NextResponse.json({ service });
  } catch (error) {
    console.error('Admin service update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    // Re-verify admin role from DB (JWT role could be stale)
    const freshUser = await db.user.findFirst({
      where: { id: currentUser.userId, deletedAt: null },
      select: { role: true },
    });
    if (freshUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Soft delete — don't break existing applications
    const service = await db.$transaction(async (tx: any) => {
      const oldService = await tx.service.findUnique({ where: { id } });
      const updatedService = await tx.service.update({
        where: { id },
        data: { isActive: false },
      });

      await tx.auditLog.create({
        data: {
          adminId: currentUser.userId,
          action: 'DELETE_SERVICE',
          entity: 'Service',
          entityId: id,
          oldData: oldService as any,
          newData: { isActive: false },
        },
      });

      return updatedService;
    });

    return NextResponse.json({ service, message: 'Service deactivated (soft delete)' });
  } catch (error) {
    console.error('Admin service delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
