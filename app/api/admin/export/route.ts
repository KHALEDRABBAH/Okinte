export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/export?type=applications&format=csv
 * Export data as CSV or Excel
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, verifyAdminRole } from '@/lib/auth';

function escapeCSV(val: any): string {
  const s = String(val ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    const isAdmin = await verifyAdminRole(currentUser.userId);
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'applications';
    const format = searchParams.get('format') || 'csv';

    let csvContent = '';
    let filename = '';

    if (type === 'applications') {
      const applications = await db.application.findMany({
        where: { deletedAt: null },
        include: {
          user: { select: { firstName: true, lastName: true, email: true, phone: true, country: true, city: true } },
          service: { select: { key: true } },
          payment: { select: { amount: true, status: true, paidAt: true } },
          documents: { select: { type: true, fileName: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const headers = ['Reference', 'Status', 'Service', 'First Name', 'Last Name', 'Email', 'Phone', 'Country', 'City', 'Payment Status', 'Amount', 'Documents', 'Created', 'Notes'];
      csvContent = headers.join(',') + '\n';

      for (const app of applications) {
        const row = [
          app.referenceCode,
          app.status,
          app.service?.key || 'pending',
          app.user.firstName,
          app.user.lastName,
          app.user.email,
          app.user.phone,
          app.user.country,
          app.user.city,
          app.payment?.status || 'N/A',
          app.payment ? Number(app.payment.amount) : 'N/A',
          app.documents.map((d: { type: string }) => d.type).join('; '),
          new Date(app.createdAt).toISOString().split('T')[0],
          app.notes || '',
        ];
        csvContent += row.map(escapeCSV).join(',') + '\n';
      }
      filename = `okinte-applications-${new Date().toISOString().split('T')[0]}`;
    } else if (type === 'users') {
      const users = await db.user.findMany({
        where: { deletedAt: null },
        select: {
          firstName: true, lastName: true, email: true, phone: true,
          country: true, city: true, role: true, createdAt: true,
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Country', 'City', 'Role', 'Applications', 'Joined'];
      csvContent = headers.join(',') + '\n';

      for (const u of users) {
        const row = [
          u.firstName, u.lastName, u.email, u.phone,
          u.country, u.city, u.role, u._count.applications,
          new Date(u.createdAt).toISOString().split('T')[0],
        ];
        csvContent += row.map(escapeCSV).join(',') + '\n';
      }
      filename = `okinte-users-${new Date().toISOString().split('T')[0]}`;
    } else {
      return NextResponse.json({ error: 'Invalid type. Use: applications, users' }, { status: 400 });
    }

    if (format === 'xlsx') {
      try {
        const ExcelJS = await import('exceljs');
        const Workbook = ExcelJS.default.Workbook;
        
        // Parse CSV data into rows
        const rows = csvContent.split('\n').filter(r => r.trim()).map(r => {
          // Simple CSV parse for our controlled output
          return r.split(',').map(c => c.replace(/^"|"$/g, '').replace(/""/g, '"'));
        });

        // Create workbook and worksheet
        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet('Data');

        // Add rows to worksheet
        for (const row of rows) {
          worksheet.addRow(row);
        }

        // Format header row (first row)
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD3D3D3' },
        };

        // Auto-fit column widths
        worksheet.columns.forEach((col: any) => {
          let maxLength = 0;
          col.eachCell?.({ includeEmpty: true }, (cell: any) => {
            const cellLength = cell.value ? String(cell.value).length : 0;
            if (cellLength > maxLength) {
              maxLength = cellLength;
            }
          });
          col.width = Math.min(maxLength + 2, 50);
        });

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();

        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
          },
        });
      } catch (error) {
        console.error('Excel export error:', error);
        return NextResponse.json({ error: 'Failed to generate Excel file' }, { status: 500 });
      }
    }

    // Default: CSV
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
