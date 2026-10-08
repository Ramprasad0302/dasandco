import { useEffect, useState } from "react";
import {
  DollarSign,
  Gem,
  ShoppingBag,
  Users,
  Wallet,
  TrendingUp,
} from "lucide-react";

import type { AnalyticsPeriod } from "../index";
import { API } from "@/lib/api";

type Props = {
  period: AnalyticsPeriod;
};

type Summary = {
  totalClients: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  totalGoldEarned: number;
  totalExpenses: number;
  totalGoldLoss: number;
  goldBalance: number;
  profit: number;
};

const money = (value: number) =>
  `₹ ${Number(value || 0).toLocaleString(
    "en-IN"
  )}`;

const gold = (value: number) =>
  `${Number(value || 0).toFixed(3)} g`;

export default function KPICards({
  period,
}: Props) {
  const [data, setData] =
    useState<Summary | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);

        const response =
          await fetch(
            `${API}/analytics/summary?period=${period}`
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to load analytics"
          );
        }

        if (!cancelled) {
          setData(result.data);
        }
      } catch (error) {
        console.error(
          "KPI Error:",
          error
        );

        if (!cancelled) {
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [period]);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(
          (item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-3xl border border-gold/10 bg-[#151515]"
            />
          )
        )}
      </div>
    );
  }

  const cards = [
    {
      title: "Revenue",
      value: money(
        data?.totalRevenue || 0
      ),
      icon: DollarSign,
      positive: true,
    },
    {
      title: "Gold Balance",
      value: gold(
        data?.goldBalance || 0
      ),
      icon: Gem,
      positive: true,
    },
    {
      title: "Orders",
      value: (
        data?.totalOrders || 0
      ).toLocaleString("en-IN"),
      icon: ShoppingBag,
      positive: true,
    },
    {
      title: "Clients",
      value: (
        data?.totalClients || 0
      ).toLocaleString("en-IN"),
      icon: Users,
      positive: true,
    },
    {
      title: "Expenses",
      value: money(
        data?.totalExpenses || 0
      ),
      icon: Wallet,
      positive: false,
    },
    {
      title: "Profit",
      value: money(
        data?.profit || 0
      ),
      icon: TrendingUp,
      positive:
        (data?.profit || 0) >= 0,
    },
  ];

  return (
    <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">

      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="relative min-w-0 overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-br from-[#141414] via-[#1d1d1d] to-[#111111] p-6 shadow-xl transition-all duration-300 hover:border-gold/50"
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gold/10 blur-2xl" />

            <div className="relative flex min-w-0 items-start justify-between gap-4">

              <div className="min-w-0">
                <p className="text-sm text-gray-500">
                  {card.title}
                </p>

                <h2 className="mt-2 break-words text-2xl font-bold text-white sm:text-3xl">
                  {card.value}
                </h2>
              </div>

              <div className="shrink-0 rounded-2xl bg-gold/10 p-4">
                <Icon
                  size={28}
                  className="text-gold"
                />
              </div>

            </div>
          </div>
        );
      })}

    </div>
  );
}