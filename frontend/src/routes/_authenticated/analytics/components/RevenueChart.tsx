import { useEffect, useState } from "react";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AnalyticsPeriod } from "../index";
import { API } from "@/lib/api";

type Props = {
  period: AnalyticsPeriod;
};

type RevenueData = {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
  goldEarned: number;
};

/**
 * Safely converts any backend date value into YYYY-MM-DD.
 */
const normalizeDate = (value: unknown): string => {
  if (!value) return "";

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return "";
    }

    const year = value.getFullYear();
    const month = String(
      value.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      value.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const raw = String(value).trim();

  if (!raw) return "";

  // Already YYYY-MM-DD
  const match = raw.match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  const parsed = new Date(raw);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getFullYear();
  const month = String(
    parsed.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    parsed.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * Formats YYYY-MM-DD without timezone problems.
 */
const formatDate = (value: unknown) => {
  const normalized = normalizeDate(value);

  if (!normalized) {
    return "—";
  }

  const parts = normalized.split("-");

  if (parts.length !== 3) {
    return "—";
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  if (
    !year ||
    !month ||
    !day
  ) {
    return "—";
  }

  const date = new Date(
    year,
    month - 1,
    day
  );

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
    }
  );
};

const money = (value: number) =>
  `₹ ${Number(value || 0).toLocaleString(
    "en-IN"
  )}`;

export default function RevenueChart({
  period,
}: Props) {
  const [data, setData] =
    useState<RevenueData[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    const loadRevenue = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API}/analytics/revenue?period=${period}`
        );

        if (!response.ok) {
          throw new Error(
            `Revenue API failed: ${response.status}`
          );
        }

        const result =
          await response.json();

        console.log(
          "Revenue Analytics:",
          result
        );

        if (cancelled) return;

        if (!result.success && result.success !== undefined) {
          throw new Error(
            result.message ||
              "Failed to load revenue analytics"
          );
        }

        const rows = Array.isArray(
          result.data
        )
          ? result.data
          : [];

        const cleanData =
          rows
            .map((item: any) => {
              const date =
                normalizeDate(item.date);

              if (!date) {
                return null;
              }

              return {
                date,

                revenue:
                  Number(
                    item.revenue
                  ) || 0,

                expenses:
                  Number(
                    item.expenses
                  ) || 0,

                profit:
                  Number(
                    item.profit
                  ) || 0,

                goldEarned:
                  Number(
                    item.goldEarned
                  ) || 0,
              };
            })
            .filter(
              (
                item: RevenueData | null
              ): item is RevenueData =>
                item !== null
            );

        setData(cleanData);
      } catch (err) {
        console.error(
          "Revenue chart error:",
          err
        );

        if (!cancelled) {
          setData([]);

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load revenue data"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadRevenue();

    return () => {
      cancelled = true;
    };
  }, [period]);

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-br from-[#141414] via-[#1b1b1b] to-[#101010] p-6 shadow-xl">

      {/* HEADER */}

      <div className="mb-6 flex items-start justify-between gap-4">

        <div>
          <h2 className="text-2xl font-bold text-gold">
            Revenue Analytics
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Revenue vs Profit vs Expenses
          </p>
        </div>

        <div className="rounded-xl border border-gold/30 px-4 py-2 text-sm capitalize text-gold">
          {period}
        </div>

      </div>

      {/* LOADING */}

      {loading ? (
        <div className="flex h-[320px] items-center justify-center">
          <p className="text-sm text-gray-500">
            Loading revenue...
          </p>
        </div>
      ) : error ? (

        <div className="flex h-[320px] items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-red-400">
              Unable to load revenue
            </p>

            <p className="mt-2 text-xs text-gray-600">
              {error}
            </p>
          </div>
        </div>

      ) : data.length === 0 ? (

        <div className="flex h-[320px] items-center justify-center">
          <p className="text-sm text-gray-500">
            No revenue data available
          </p>
        </div>

      ) : (

        <div className="h-[320px] w-full min-w-0">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <LineChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 10,
              }}
            >

              <CartesianGrid
                stroke="#292929"
                strokeDasharray="4 4"
              />

              <XAxis
                dataKey="date"
                stroke="#999"
                tick={{
                  fill: "#999",
                  fontSize: 12,
                }}
                tickLine={false}
                axisLine={{
                  stroke: "#333",
                }}
                tickFormatter={(value) =>
                  formatDate(value)
                }
              />

              <YAxis
                stroke="#999"
                tick={{
                  fill: "#999",
                  fontSize: 12,
                }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  `₹${Number(value).toLocaleString(
                    "en-IN"
                  )}`
                }
              />

              <Tooltip
                contentStyle={{
                  backgroundColor:
                    "#111111",
                  border:
                    "1px solid #B89432",
                  borderRadius: 12,
                  color: "#ffffff",
                }}
                labelStyle={{
                  color: "#ffffff",
                  marginBottom: 8,
                }}
                itemStyle={{
                  color: "#ffffff",
                }}
                labelFormatter={(value) =>
                  formatDate(value)
                }
                formatter={(
                  value,
                  name
                ) => [
                  money(Number(value || 0)),
                  String(name),
                ]}
              />

              <Legend />

              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#FFD700"
                strokeWidth={3}
                dot={{
                  r: 4,
                }}
                activeDot={{
                  r: 7,
                }}
              />

              <Line
                type="monotone"
                dataKey="profit"
                name="Profit"
                stroke="#00E676"
                strokeWidth={3}
                dot={{
                  r: 4,
                }}
                activeDot={{
                  r: 7,
                }}
              />

              <Line
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#FF5252"
                strokeWidth={3}
                dot={{
                  r: 4,
                }}
                activeDot={{
                  r: 7,
                }}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>
      )}

    </div>
  );
}