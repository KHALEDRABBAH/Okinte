export const dynamic = 'force-dynamic';

/**
 * POST /api/applications  — Create a new application (DRAFT status)
 * GET  /api/applications  — List all applications for the current user
 * 
 * POST FLOW:
 * 1. Verify user is authenticated (JWT cookie)
 * 2. Validate input: serviceKey is required
 * 3. Find the service by key (validate it exists and is active)
 * 4. Check user doesn't already have an application for this service
 * 5. Generate unique reference code (BOL-2026-XXXXXX)
 * 6. Create application in DRAFT status
 * 7. Return application with reference code
 * 
 * GET FLOW:
 * 1. Verify user is authenticated
 * 2. Fetch all applications for this user with related service + documents + payment
 * 3. Return sorted by creation date (newest first)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// Generate unique reference code: BOL-2026-A3F8K2
function generateReferenceCode(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `OKT-${year}-${code}`;
}

export async function POST(request: NextRequest) {
  try {
    // Step 1: Authenticate
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Step 2: Parse input
    const body = await request.json();
    const { serviceKey } = body;

    let serviceId: string | null = null;

    // If serviceKey is provided, validate and find the service
    if (serviceKey) {
      if (!['study', 'internship', 'scholarship', 'sabbatical', 'employment'].includes(serviceKey)) {
        return NextResponse.json(
          { error: 'Valid service key is required (study, internship, scholarship, sabbatical, employment)' },
          { status: 400 }
        );
      }

      const service = await db.service.findUnique({ where: { key: serviceKey } });
      if (!service || !service.isActive) {
        return NextResponse.json({ error: 'Service not found or not active' }, { status: 404 });
      }

      // Check for duplicate application for this service
      const existing = await db.application.findFirst({
        where: {
          userId: currentUser.userId,
          serviceId: service.id,
          status: { notIn: ['REJECTED'] },
          deletedAt: null,
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'You already have an active application for this service', existingRef: existing.referenceCode },
          { status: 409 }
        );
      }

      serviceId = service.id;
    }

    // Step 3: Generate unique reference code (retry if collision)
    let referenceCode = generateReferenceCode();
    let attempts = 0;
    let isUnique = false;
    while (attempts < 5) {
      const exists = await db.application.findUnique({ where: { referenceCode } });
      if (!exists) { isUnique = true; break; }
      referenceCode = generateReferenceCode();
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: 'Unable to generate a unique reference code. Please try again.' },
        { status: 503 }
      );
    }

    // Step 4: Create application (serviceId can be null for registration flow)
    const application = await db.application.create({
      data: {
        userId: currentUser.userId,
        serviceId,
        referenceCode,
        status: 'DRAFT',
      },
      include: {
        service: true,
      },
    });

    // Step 5: Return
    return NextResponse.json({
      application: {
        id: application.id,
        referenceCode: application.referenceCode,
        status: application.status,
        serviceKey: application.service?.key || null,
        createdAt: application.createdAt,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Application creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Step 1: Authenticate
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Step 2: Fetch all applications with related data
    const applications = await db.application.findMany({
      where: { userId: currentUser.userId, deletedAt: null },
      include: {
        service: true,
        documents: {
          select: {
            id: true,
            type: true,
            fileName: true,
            fileSize: true,
            uploadedAt: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            paidAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Step 3: Return
    return NextResponse.json({ applications });

  } catch (error) {
    console.error('Applications list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
