import { useEffect, useState } from "react";

import {
  CartesianGrid,
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

type GoldData = {
  date: string;
  balance: number;
  added: number;
  used: number;
};

const normalizeDate = (
  value: unknown
): string => {
  if (!value) return "";

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return "";
    }

    const year =
      value.getFullYear();

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

  const year =
    parsed.getFullYear();

  const month = String(
    parsed.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    parsed.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDate = (
  value: unknown
) => {
  const normalized =
    normalizeDate(value);

  if (!normalized) {
    return "—";
  }

  const parts =
    normalized.split("-");

  if (parts.length !== 3) {
    return "—";
  }

  const year =
    Number(parts[0]);

  const month =
    Number(parts[1]);

  const day =
    Number(parts[2]);

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

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
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

const grams = (
  value: number
) =>
  `${Number(
    value || 0
  ).toFixed(3)} g`;

export default function GoldChart({
  period,
}: Props) {
  const [data, setData] =
    useState<GoldData[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    const loadGold = async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await fetch(
            `${API}/analytics/gold?period=${period}`
          );

        if (!response.ok) {
          throw new Error(
            `Gold API failed: ${response.status}`
          );
        }

        const result =
          await response.json();

        console.log(
          "Gold Analytics:",
          result
        );

        if (cancelled) return;

        if (
          !result.success &&
          result.success !== undefined
        ) {
          throw new Error(
            result.message ||
              "Failed to load gold analytics"
          );
        }

        /*
         * Backend response:
         *
         * {
         *   success: true,
         *   data: {
         *     period,
         *     currentBalance,
         *     data: [...]
         *   }
         * }
         *
         * Some versions of the API may return
         * the array directly under result.data.
         */

        const rows =
          Array.isArray(result.data)
            ? result.data
            : Array.isArray(
                result.data?.data
              )
            ? result.data.data
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

                balance:
                  Number(
                    item.balance
                  ) || 0,

                added:
                  Number(
                    item.added
                  ) || 0,

                used:
                  Number(
                    item.used
                  ) || 0,
              };
            })
            .filter(
              (
                item: GoldData | null
              ): item is GoldData =>
                item !== null
            );

        setData(cleanData);
      } catch (err) {
        console.error(
          "Gold chart error:",
          err
        );

        if (!cancelled) {
          setData([]);

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load gold data"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadGold();

    return () => {
      cancelled = true;
    };
  }, [period]);

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-br from-[#141414] via-[#1b1b1b] to-[#101010] p-6 shadow-xl">

      <div className="mb-6">

        <h2 className="text-2xl font-bold text-gold">
          Gold Analytics
        </h2>

        <p className="mt-1 text-sm text-gray-400">
          Gold balance, added and used
        </p>

      </div>

      {loading ? (

        <div className="flex h-[320px] items-center justify-center">
          <p className="text-sm text-gray-500">
            Loading gold...
          </p>
        </div>

      ) : error ? (

        <div className="flex h-[320px] items-center justify-center">
          <div className="text-center">

            <p className="text-sm text-red-400">
              Unable to load gold
            </p>

            <p className="mt-2 text-xs text-gray-600">
              {error}
            </p>

          </div>
        </div>

      ) : data.length === 0 ? (

        <div className="flex h-[320px] items-center justify-center">
          <p className="text-sm text-gray-500">
            No gold data available
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
                left: 0,
                bottom: 10,
              }}
            >

              <CartesianGrid
                stroke="#292929"
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="date"
                tick={{
                  fill: "#999",
                  fontSize: 12,
                }}
                axisLine={{
                  stroke: "#333",
                }}
                tickLine={false}
                tickFormatter={(value) =>
                  formatDate(value)
                }
              />

              <YAxis
                tick={{
                  fill: "#999",
                  fontSize: 12,
                }}
                axisLine={false}
                tickLine={false}
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
                  grams(
                    Number(value || 0)
                  ),
                  String(name),
                ]}
              />

              <Line
                type="monotone"
                dataKey="balance"
                name="Balance"
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
                dataKey="added"
                name="Added"
                stroke="#00E676"
                strokeWidth={2}
                dot={{
                  r: 3,
                }}
                activeDot={{
                  r: 6,
                }}
              />

              <Line
                type="monotone"
                dataKey="used"
                name="Used"
                stroke="#FF5252"
                strokeWidth={2}
                dot={{
                  r: 3,
                }}
                activeDot={{
                  r: 6,
                }}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-6 text-sm">

        <span className="text-gold">
          ● Balance
        </span>

        <span className="text-green-400">
          ● Added
        </span>

        <span className="text-red-400">
          ● Used
        </span>

      </div>

    </div>
  );
}