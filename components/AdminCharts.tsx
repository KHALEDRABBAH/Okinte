'use client';

/**
 * AdminCharts — Pure CSS/SVG charts for admin analytics.
 * No external chart library needed.
 */

interface MonthlyData {
  label: string;
  applications: number;
  revenue: number;
  users: number;
}

interface AdminChartsProps {
  monthlyData: MonthlyData[];
  statusCounts: Record<string, number>;
}

export default function AdminCharts({ monthlyData, statusCounts }: AdminChartsProps) {
  const maxApps = Math.max(...monthlyData.map(m => m.applications), 1);
  const maxRevenue = Math.max(...monthlyData.map(m => m.revenue), 1);
  const maxUsers = Math.max(...monthlyData.map(m => m.users), 1);

  const statusColors: Record<string, string> = {
    DRAFT: '#9ca3af',
    SUBMITTED: '#3b82f6',
    UNDER_REVIEW: '#f59e0b',
    APPROVED: '#10b981',
    REJECTED: '#ef4444',
    RETURNED: '#f97316',
  };

  const totalApps = Object.values(statusCounts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-6">
      {/* Status Distribution */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-600 mb-4">Status Distribution</h3>
        <div className="space-y-3">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">{status.replace('_', ' ')}</span>
                <span className="font-medium text-gray-900">{count}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max((count / totalApps) * 100, 2)}%`,
                    backgroundColor: statusColors[status] || '#6b7280',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Applications Trend */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-600 mb-4">Applications (Last 6 Months)</h3>
        <div className="flex items-end gap-3 pt-6">
          {monthlyData.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full h-32 flex flex-col justify-end items-center relative">
                <span className="text-xs font-medium text-gray-900 absolute -top-5">{m.applications}</span>
                <div
                  className="w-full rounded-t-lg transition-all duration-500"
                  style={{
                    height: `${Math.max((m.applications / maxApps) * 100, 4)}%`,
                    backgroundColor: '#3b82f6',
                  }}
                />
              </div>
              <span className="text-[10px] text-gray-400">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Trend */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-600 mb-4">Revenue (Last 6 Months)</h3>
        <div className="flex items-end gap-3 pt-6">
          {monthlyData.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full h-32 flex flex-col justify-end items-center relative">
                <span className="text-xs font-medium text-gray-900 absolute -top-5">${m.revenue}</span>
                <div
                  className="w-full rounded-t-lg transition-all duration-500"
                  style={{
                    height: `${Math.max((m.revenue / maxRevenue) * 100, 4)}%`,
                    backgroundColor: '#10b981',
                  }}
                />
              </div>
              <span className="text-[10px] text-gray-400">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Users Trend */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-600 mb-4">New Users (Last 6 Months)</h3>
        <div className="flex items-end gap-3 pt-6">
          {monthlyData.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full h-32 flex flex-col justify-end items-center relative">
                <span className="text-xs font-medium text-gray-900 absolute -top-5">{m.users}</span>
                <div
                  className="w-full rounded-t-lg transition-all duration-500"
                  style={{
                    height: `${Math.max((m.users / maxUsers) * 100, 4)}%`,
                    backgroundColor: '#8b5cf6',
                  }}
                />
              </div>
              <span className="text-[10px] text-gray-400">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
