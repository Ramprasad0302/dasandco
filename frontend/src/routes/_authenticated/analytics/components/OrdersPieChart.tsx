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

type OrderData = {
  status: string;
  count: number;
};

const COLORS: Record<
  string,
  string
> = {
  Pending: "#FFD740",
  "In Progress": "#42A5F5",
  Completed: "#66BB6A",
  Delivered: "#AB47BC",
};

export default function OrdersPieChart({
  period,
}: Props) {
  const [data, setData] =
    useState<OrderData[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);

    fetch(
      `${API}/analytics/orders?period=${period}`
    )
      .then((res) => res.json())
      .then((result) => {
        if (!cancelled) {
          setData(
            (result.data || []).map(
              (item: any) => ({
                status:
                  item.status,
                count: Number(
                  item.count || 0
                ),
              })
            )
          );
        }
      })
      .catch((error) => {
        console.error(
          "Order analytics error:",
          error
        );

        if (!cancelled) {
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

  const total = useMemo(
    () =>
      data.reduce(
        (sum, item) =>
          sum + item.count,
        0
      ),
    [data]
  );

  const completed =
    data.find(
      (item) =>
        item.status ===
        "Completed"
    )?.count || 0;

  const delivered =
    data.find(
      (item) =>
        item.status ===
        "Delivered"
    )?.count || 0;

  const completionRate =
    total > 0
      ? Math.round(
          ((completed +
            delivered) /
            total) *
            100
        )
      : 0;

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-br from-[#141414] via-[#1b1b1b] to-[#101010] p-6 shadow-xl">

      <div className="flex min-w-0 items-start justify-between gap-4">

        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-gold">
            Order Analytics
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Order Status Distribution
          </p>
        </div>

        <div className="shrink-0 rounded-full border border-gold/30 bg-black/30 px-4 py-2 text-sm font-semibold text-gold">
          {total} Orders
        </div>

      </div>

      {loading ? (
        <div className="flex h-[400px] items-center justify-center">
          <p className="text-sm text-gray-500">
            Loading...
          </p>
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-[400px] items-center justify-center">
          <p className="text-sm text-gray-500">
            No order data available
          </p>
        </div>
      ) : (
        <div className="mt-5 grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_180px]">

          <div className="h-[360px] min-w-0">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>

                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={125}
                  paddingAngle={4}
                  stroke="#111111"
                  strokeWidth={2}
                >
                  {data.map(
                    (item, index) => (
                      <Cell
                        key={`${item.status}-${index}`}
                        fill={
                          COLORS[
                            item.status
                          ] ||
                          [
                            "#FFD740",
                            "#42A5F5",
                            "#66BB6A",
                            "#AB47BC",
                          ][
                            index % 4
                          ]
                        }
                      />
                    )
                  )}
                </Pie>

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
                  }}
                  itemStyle={{
                    color: "#ffffff",
                  }}
                />

              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col justify-center gap-3">

            <div className="rounded-2xl bg-[#111111] p-4">
              <p className="text-xs text-gray-500">
                Completion Rate
              </p>

              <p className="mt-1 text-3xl font-bold text-green-400">
                {completionRate}%
              </p>
            </div>

            {data.map(
              (item, index) => (
                <div
                  key={item.status}
                  className="rounded-2xl bg-[#111111] p-4"
                >
                  <div className="flex items-center justify-between gap-3">

                    <div className="flex min-w-0 items-center gap-3">

                      <span
                        className="h-4 w-4 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            COLORS[
                              item.status
                            ] ||
                            [
                              "#FFD740",
                              "#42A5F5",
                              "#66BB6A",
                              "#AB47BC",
                            ][
                              index % 4
                            ],
                        }}
                      />

                      <span className="break-words text-sm text-white">
                        {item.status}
                      </span>

                    </div>

                    <span className="text-sm font-bold text-gold">
                      {item.count}
                    </span>

                  </div>
                </div>
              )
            )}

          </div>

        </div>
      )}

    </div>
  );
}