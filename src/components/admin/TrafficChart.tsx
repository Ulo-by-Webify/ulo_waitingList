"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, parseISO } from "date-fns";

type DailyPoint = { day: string; visitors: number; pageviews: number };

const SERIES_COLOR = "hsl(var(--primary))";
const GRID_COLOR = "#E5E7EB";
const AXIS_TEXT = "#6B7280";

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: DailyPoint }[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-gray-900">{format(parseISO(point.day), "EEE d MMM yyyy")}</p>
      <p className="mt-1 text-gray-600">
        <span className="tabular-nums font-medium text-gray-900">{point.visitors}</span> visitors
      </p>
      <p className="text-gray-600">
        <span className="tabular-nums font-medium text-gray-900">{point.pageviews}</span> page views
      </p>
    </div>
  );
}

export default function TrafficChart({ data }: { data: DailyPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="visitorsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SERIES_COLOR} stopOpacity={0.18} />
              <stop offset="100%" stopColor={SERIES_COLOR} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={GRID_COLOR} strokeDasharray="0" />
          <XAxis
            dataKey="day"
            tickFormatter={(d: string) => format(parseISO(d), "d MMM")}
            tick={{ fontSize: 11, fill: AXIS_TEXT }}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: AXIS_TEXT }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: AXIS_TEXT, strokeWidth: 1, strokeDasharray: "3 3" }} />
          <Area
            type="monotone"
            dataKey="visitors"
            stroke={SERIES_COLOR}
            strokeWidth={2}
            fill="url(#visitorsFill)"
            activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff", fill: SERIES_COLOR }}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
