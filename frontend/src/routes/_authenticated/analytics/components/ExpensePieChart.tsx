import { useEffect, useMemo, useState } from "react";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { AnalyticsPeriod } from "../index";
import { API } from "@/lib/api";

type Props = {
  period: AnalyticsPeriod;
};

type ExpenseData = {
  category: string;
  amount: number;
  goldLoss: number;
};

const COLORS = [
  "#FFD740",
  "#00C853",
  "#42A5F5",
  "#EF5350",
  "#AB47BC",
  "#FF9800",
  "#26A69A",
  "#EC407A",
];

const money = (value: number) =>
  `₹ ${Number(value || 0).toLocaleString(
    "en-IN"
  )}`;

const CustomTooltip = ({
  active,
  payload,
}: any) => {
  if (
    !active ||
    !payload ||
    !payload.length
  ) {
    return null;
  }

  const item = payload[0];

  return (
    <div className="rounded-xl border border-gold/60 bg-[#111111] px-4 py-3 shadow-2xl">

      <p className="text-sm font-semibold text-white">
        {item.name}
      </p>

      <p className="mt-1 text-sm font-bold text-gold">
        {money(
          Number(item.value || 0)
        )}
      </p>

    </div>
  );
};

export default function ExpensePieChart({
  period,
}: Props) {
  const [data, setData] =
    useState<ExpenseData[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError("");

    fetch(
      `${API}/analytics/expenses?period=${period}`
    )
      .then(async (response) => {
        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to load expenses"
          );
        }

        return result;
      })
      .then((result) => {
        if (!cancelled) {
          setData(
            (result.data || []).map(
              (item: any) => ({
                category:
                  item.category ||
                  "Other",

                amount: Number(
                  item.amount || 0
                ),

                goldLoss: Number(
                  item.goldLoss || 0
                ),
              })
            )
          );
        }
      })
      .catch((err) => {
        console.error(
          "Expense analytics error:",
          err
        );

        if (!cancelled) {
          setError(
            err.message ||
              "Failed to load expense analytics"
          );

          setData([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [period]);

  // ---------------------------------------------------
  // ONLY RUPEE EXPENSES GO INTO THE PIE
  // ---------------------------------------------------

  const monetaryExpenses =
    useMemo(
      () =>
        data.filter(
          (item) =>
            Number(item.amount) > 0
        ),
      [data]
    );

  const total = useMemo(
    () =>
      monetaryExpenses.reduce(
        (sum, item) =>
          sum +
          Number(item.amount || 0),
        0
      ),
    [monetaryExpenses]
  );

  const totalGoldLoss =
    useMemo(
      () =>
        data.reduce(
          (sum, item) =>
            sum +
            Number(
              item.goldLoss || 0
            ),
          0
        ),
      [data]
    );

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-br from-[#141414] via-[#1b1b1b] to-[#101010] p-6 shadow-xl">

      {/* HEADER */}

      <div className="flex min-w-0 items-start justify-between gap-4">

        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-gold">
            Expense Analytics
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Expense Category Distribution
          </p>
        </div>

        <div className="shrink-0 rounded-full border border-gold/30 bg-black/30 px-4 py-2">
          <span className="whitespace-nowrap text-sm font-semibold text-gold">
            {money(total)}
          </span>
        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* LOADING */}

      {loading ? (
        <div className="flex h-[400px] items-center justify-center">
          <p className="text-sm text-gray-500">
            Loading expense data...
          </p>
        </div>
      ) : monetaryExpenses.length ===
        0 ? (
        <div className="mt-6">

          <div className="flex h-[300px] items-center justify-center rounded-2xl bg-[#111111]">

            <p className="text-sm text-gray-500">
              No rupee expense data available
            </p>

          </div>

          {totalGoldLoss > 0 && (
            <div className="mt-4 rounded-2xl border border-gold/20 bg-[#111111] p-5">

              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                Casting Gold Loss
              </p>

              <p className="mt-2 text-2xl font-bold text-gold">
                {totalGoldLoss.toFixed(
                  3
                )}{" "}
                g
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Casting is tracked separately from ₹ expenses.
              </p>

            </div>
          )}

        </div>
      ) : (
        <div className="mt-6 grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,1fr)]">

          {/* PIE */}

          <div className="relative flex h-[360px] min-w-0 items-center justify-center">

            <div className="h-full w-full min-w-0">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>

                  <Pie
                    data={monetaryExpenses}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={125}
                    paddingAngle={4}
                    stroke="#111111"
                    strokeWidth={2}
                  >
                    {monetaryExpenses.map(
                      (_, index) => (
                        <Cell
                          key={`expense-${index}`}
                          fill={
                            COLORS[
                              index %
                                COLORS.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip
                    content={
                      <CustomTooltip />
                    }
                    cursor={false}
                  />

                </PieChart>
              </ResponsiveContainer>

            </div>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

              <div className="text-center">

                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  Total
                </p>

                <p className="mt-1 text-lg font-bold text-white">
                  {money(total)}
                </p>

              </div>

            </div>

          </div>

          {/* LIST */}

          <div className="min-w-0 space-y-3">

            {monetaryExpenses.map(
              (item, index) => {
                const percentage =
                  total > 0
                    ? (item.amount /
                        total) *
                      100
                    : 0;

                const color =
                  COLORS[
                    index %
                      COLORS.length
                  ];

                return (
                  <div
                    key={`${item.category}-${index}`}
                    className="min-w-0 rounded-2xl border border-white/5 bg-[#111111] p-4 transition-all hover:border-gold/30"
                  >

                    <div className="flex min-w-0 items-start justify-between gap-3">

                      <div className="flex min-w-0 items-start gap-3">

                        <span
                          className="mt-1 h-3 w-3 shrink-0 rounded-full"
                          style={{
                            backgroundColor:
                              color,
                          }}
                        />

                        <div className="min-w-0">

                          <p className="break-words text-sm font-semibold text-white">
                            {item.category}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {percentage.toFixed(
                              1
                            )}
                            % of total
                          </p>

                        </div>

                      </div>

                      <p className="shrink-0 whitespace-nowrap text-sm font-bold text-gold">
                        {money(
                          item.amount
                        )}
                      </p>

                    </div>

                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">

                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(
                            percentage,
                            100
                          )}%`,
                          backgroundColor:
                            color,
                        }}
                      />

                    </div>

                  </div>
                );
              }
            )}

            {totalGoldLoss > 0 && (
              <div className="rounded-2xl border border-gold/20 bg-[#111111] p-4">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Casting Gold Loss
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Gold used minus gold returned
                    </p>
                  </div>

                  <p className="text-sm font-bold text-gold">
                    {totalGoldLoss.toFixed(
                      3
                    )}{" "}
                    g
                  </p>

                </div>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}