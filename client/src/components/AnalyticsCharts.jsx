'use client';

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// ─── Color Palettes ────────────────────────────────────────
const GREEN_SHADES = ['#22c55e', '#16a34a', '#15803d', '#166534', '#4ade80', '#86efac'];
const CATEGORY_COLORS = {
  Handicrafts: '#f59e0b',
  'Organic Produce': '#22c55e',
  'Processed Food': '#3b82f6',
  Textiles: '#a855f7',
  Other: '#6b7280',
};

// ─── Shared tooltip style ──────────────────────────────────
const tooltipStyle = {
  backgroundColor: '#1a211a',
  border: '1px solid rgba(34,197,94,0.2)',
  borderRadius: '12px',
  color: '#f0fdf4',
  fontSize: '12px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
};

// ─── Revenue per Cluster BarChart ──────────────────────────
export function RevenuePerClusterChart({ data = [] }) {
  if (!data.length) return <EmptyChart message="No cluster revenue data yet" />;

  const chartData = data.map((d) => ({
    name: d.clusterName?.split(' ')[0] || 'Unknown',
    revenue: Math.round(d.revenue / 1000), // in thousands
    orders: d.orderCount,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.08)" />
        <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}K`} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value, name) => [name === 'revenue' ? `₹${value}K` : value, name === 'revenue' ? 'Revenue' : 'Orders']}
        />
        <Bar dataKey="revenue" fill="#22c55e" radius={[6, 6, 0, 0]} name="Revenue" />
        <Bar dataKey="orders" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Orders" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Orders Over Time LineChart ────────────────────────────
export function OrdersOverTimeChart({ data = [] }) {
  if (!data.length) return <EmptyChart message="No order history data yet" />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.08)" />
        <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: '12px', color: '#6b7280' }} />
        <Line
          type="monotone"
          dataKey="orders"
          stroke="#22c55e"
          strokeWidth={2.5}
          dot={{ fill: '#22c55e', strokeWidth: 0, r: 4 }}
          activeDot={{ r: 6, fill: '#4ade80' }}
          name="Orders"
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#f59e0b"
          strokeWidth={2.5}
          dot={{ fill: '#f59e0b', strokeWidth: 0, r: 4 }}
          activeDot={{ r: 6, fill: '#fbbf24' }}
          name="Revenue (₹)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Category Breakdown PieChart ───────────────────────────
export function CategoryBreakdownChart({ data = [] }) {
  if (!data.length) return <EmptyChart message="No product category data yet" />;

  const chartData = data.map((d) => ({ name: d._id, value: d.count }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {chartData.map((entry, i) => (
            <Cell
              key={`cell-${i}`}
              fill={CATEGORY_COLORS[entry.name] || GREEN_SHADES[i % GREEN_SHADES.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v, n) => [v, n]}
        />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }}
          formatter={(value) => value}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── Milestone Distribution BarChart ──────────────────────
export function MilestoneDistributionChart({ data = [] }) {
  if (!data.length) return <EmptyChart message="No milestone data yet" />;

  const MILESTONE_COLORS = {
    PLACED: '#6b7280',
    RAW_MATERIAL: '#8b5cf6',
    IN_PRODUCTION: '#3b82f6',
    PACKED: '#f59e0b',
    DISPATCHED: '#06b6d4',
    DELIVERED: '#22c55e',
    FUNDS_RELEASED: '#10b981',
    CANCELLED: '#ef4444',
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.08)" horizontal={false} />
        <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          dataKey="_id"
          type="category"
          tick={{ fill: '#9ca3af', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={100}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Orders">
          {data.map((entry, i) => (
            <Cell key={i} fill={MILESTONE_COLORS[entry._id] || '#22c55e'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Shared empty state ────────────────────────────────────
function EmptyChart({ message }) {
  return (
    <div className="h-[260px] flex items-center justify-center text-gray-500 text-sm">
      {message}
    </div>
  );
}
