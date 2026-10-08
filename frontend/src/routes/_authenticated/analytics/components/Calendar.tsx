import { useEffect, useMemo, useState } from "react";
import type { AnalyticsPeriod } from "../index";
import { API } from "@/lib/api";

type Props = {
  period: AnalyticsPeriod;
};

type OrderDetail = {
  id: number;
  order_number: string;
  client_id: number;
  project_name: string | null;
  category: string | null;

  gold_weight: number;
  percentage: number;
  earning_gold: number;
  gold_earned: number;

  gross_weight: number;
  stone_weight: number;
  net_gold_weight: number;
  wastage_percent: number;

  labour_charge: number;

  delivery_date: string | null;
  status: string;
  created_at: string;
};

type CalendarData = {
  date: string;

  orders: number;
  revenue: number;
  expenses: number;

  goldAdded: number;
  goldUsed: number;

  profit: number;

  orderDetails: OrderDetail[];
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

const money = (value: number) =>
  `₹ ${Number(value || 0).toLocaleString("en-IN")}`;

/* =========================================================
   DATE HELPERS
   ========================================================= */

/**
 * Converts every date format used by the backend
 * into:
 *
 * YYYY-MM-DD
 *
 * Examples:
 *
 * 2026-08-08
 * 2026-08-08T02:59:12.000Z
 * Sat Aug 08
 */
const normalizeDate = (value: unknown): string => {
  if (!value) {
    return "";
  }

  /* ---------------------------------------------
     Date object
  --------------------------------------------- */

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return "";
    }

    const year = value.getFullYear();

    const month = String(
      value.getMonth() + 1,
    ).padStart(2, "0");

    const day = String(
      value.getDate(),
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const raw = String(value).trim();

  if (!raw) {
    return "";
  }

  /* ---------------------------------------------
     YYYY-MM-DD
  --------------------------------------------- */

  const isoDateMatch = raw.match(
    /^(\d{4})-(\d{2})-(\d{2})/,
  );

  if (isoDateMatch) {
    return `${isoDateMatch[1]}-${isoDateMatch[2]}-${isoDateMatch[3]}`;
  }

  /* ---------------------------------------------
     Backend format:
     
     Sat Aug 08
     Mon Aug 03
  --------------------------------------------- */

  const shortDateMatch = raw.match(
    /^(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+([A-Za-z]{3})\s+(\d{1,2})$/,
  );

  if (shortDateMatch) {
    const monthNames: Record<string, number> = {
      Jan: 1,
      Feb: 2,
      Mar: 3,
      Apr: 4,
      May: 5,
      Jun: 6,
      Jul: 7,
      Aug: 8,
      Sep: 9,
      Oct: 10,
      Nov: 11,
      Dec: 12,
    };

    const month =
      monthNames[shortDateMatch[1]];

    const day = Number(
      shortDateMatch[2],
    );

    if (month && day) {
      const year =
        new Date().getFullYear();

      return `${year}-${String(month).padStart(
        2,
        "0",
      )}-${String(day).padStart(2, "0")}`;
    }
  }

  /* ---------------------------------------------
     Try normal JavaScript date parsing
  --------------------------------------------- */

  const parsed = new Date(raw);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getFullYear();

  const month = String(
    parsed.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    parsed.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * Creates calendar key.
 *
 * month is zero-based because JavaScript Date uses:
 *
 * January = 0
 * February = 1
 * ...
 * August = 7
 */
const dateKey = (
  year: number,
  month: number,
  day: number,
) =>
  `${year}-${String(month + 1).padStart(
    2,
    "0",
  )}-${String(day).padStart(2, "0")}`;

/**
 * Converts YYYY-MM-DD to a readable date.
 */
const formatLongDate = (
  value: string,
) => {
  const normalized =
    normalizeDate(value);

  if (!normalized) {
    return "Selected Date";
  }

  const parts =
    normalized.split("-");

  if (parts.length !== 3) {
    return "Selected Date";
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  if (
    !year ||
    !month ||
    !day
  ) {
    return "Selected Date";
  }

  const date = new Date(
    year,
    month - 1,
    day,
  );

  if (Number.isNaN(date.getTime())) {
    return "Selected Date";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );
};

/**
 * Format a date inside an order.
 */
const formatOrderDate = (
  value: string | null,
) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
};

/* =========================================================
   COMPONENT
   ========================================================= */

export default function Calendar({
  period,
}: Props) {
  const today = new Date();

  const todayKey = dateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const [
    calendarMonth,
    setCalendarMonth,
  ] = useState(
    today.getMonth(),
  );

  const [
    calendarYear,
    setCalendarYear,
  ] = useState(
    today.getFullYear(),
  );

  const [
    data,
    setData,
  ] = useState<CalendarData[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    selectedDate,
    setSelectedDate,
  ] = useState<string>(
    todayKey,
  );

  /* =======================================================
     LOAD CALENDAR DATA
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadCalendar = async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await fetch(
            `${API}/analytics/calendar?period=${period}`,
          );

        if (!response.ok) {
          throw new Error(
            `Calendar API failed: ${response.status}`,
          );
        }

        const result =
          await response.json();

        console.log(
          "Calendar Analytics Response:",
          result,
        );

        if (
          result.success === false
        ) {
          throw new Error(
            result.message ||
              "Failed to load calendar data",
          );
        }

        const rows =
          Array.isArray(result.data)
            ? result.data
            : [];

        const cleanData: CalendarData[] =
          rows
            .map(
              (item: any) => {
                const date =
                  normalizeDate(
                    item.date,
                  );

                if (!date) {
                  return null;
                }

                const revenue =
                  Number(
                    item.revenue ?? 0,
                  ) || 0;

                const expenses =
                  Number(
                    item.expenses ?? 0,
                  ) || 0;

                const orderDetails =
                  Array.isArray(
                    item.orderDetails,
                  )
                    ? item.orderDetails
                    : [];

                return {
                  date,

                  orders:
                    Number(
                      item.orders ?? 0,
                    ) || 0,

                  revenue,

                  expenses,

                  goldAdded:
                    Number(
                      item.goldAdded ??
                        item.gold_added ??
                        0,
                    ) || 0,

                  goldUsed:
                    Number(
                      item.goldUsed ??
                        item.gold_used ??
                        0,
                    ) || 0,

                  profit:
                    Number(
                      item.profit ??
                        revenue -
                          expenses,
                    ) ||
                    0,

                  orderDetails,
                };
              },
            )
            .filter(
              (
                item,
              ): item is CalendarData =>
                item !== null,
            );

        if (cancelled) {
          return;
        }

        setData(cleanData);

        /*
         * If today's date doesn't exist in the API,
         * automatically select the first date
         * that actually has business activity.
         *
         * This prevents the calendar from saying
         * "No business activity" when the API has
         * activity on another date.
         */
        if (
          cleanData.length > 0 &&
          !cleanData.some(
            (item) =>
              item.date ===
              selectedDate,
          )
        ) {
          const firstDate =
            cleanData[0].date;

          setSelectedDate(firstDate);

          const [
            year,
            month,
          ] = firstDate
            .split("-")
            .map(Number);

          if (
            year &&
            month
          ) {
            setCalendarYear(year);
            setCalendarMonth(
              month - 1,
            );
          }
        }
      } catch (err) {
        console.error(
          "Calendar error:",
          err,
        );

        if (!cancelled) {
          setData([]);

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load calendar",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCalendar();

    return () => {
      cancelled = true;
    };
  }, [period]);

  /* =======================================================
     DATA MAP
  ======================================================= */

  const dataMap = useMemo(() => {
    const map =
      new Map<
        string,
        CalendarData
      >();

    data.forEach((item) => {
      const key =
        normalizeDate(item.date);

      if (!key) {
        return;
      }

      const existing =
        map.get(key);

      /*
       * If backend ever returns multiple
       * records for the same date, merge them.
       */
      if (existing) {
        existing.orders +=
          item.orders;

        existing.revenue +=
          item.revenue;

        existing.expenses +=
          item.expenses;

        existing.goldAdded +=
          item.goldAdded;

        existing.goldUsed +=
          item.goldUsed;

        existing.profit =
          existing.revenue -
          existing.expenses;

        existing.orderDetails = [
          ...existing.orderDetails,
          ...item.orderDetails,
        ];
      } else {
        map.set(key, {
          ...item,
          date: key,
          orderDetails: [
            ...item.orderDetails,
          ],
        });
      }
    });

    return map;
  }, [data]);

  /* =======================================================
     CALENDAR DAYS
  ======================================================= */

  const calendarDays = useMemo(() => {
    const firstDay =
      new Date(
        calendarYear,
        calendarMonth,
        1,
      );

    const lastDay =
      new Date(
        calendarYear,
        calendarMonth + 1,
        0,
      );

    /*
     * JavaScript:
     *
     * Sunday = 0
     * Monday = 1
     *
     * Our calendar starts Monday.
     */
    const jsDay =
      firstDay.getDay();

    const mondayIndex =
      jsDay === 0
        ? 6
        : jsDay - 1;

    const daysInMonth =
      lastDay.getDate();

    const cells: Array<
      number | null
    > = [];

    /* Empty cells before month starts */
    for (
      let i = 0;
      i < mondayIndex;
      i++
    ) {
      cells.push(null);
    }

    /* Actual days */
    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      cells.push(day);
    }

    /* Complete final row */
    while (
      cells.length % 7 !== 0
    ) {
      cells.push(null);
    }

    return cells;
  }, [
    calendarMonth,
    calendarYear,
  ]);

  /* =======================================================
     SELECTED ACTIVITY
  ======================================================= */

  const selectedActivity =
    dataMap.get(selectedDate);

  const selectedProfit =
    selectedActivity
      ? selectedActivity.revenue -
        selectedActivity.expenses
      : 0;

  /* =======================================================
     MONTH NAVIGATION
  ======================================================= */

  const previousMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(
        calendarYear - 1,
      );
    } else {
      setCalendarMonth(
        calendarMonth - 1,
      );
    }
  };

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(
        calendarYear + 1,
      );
    } else {
      setCalendarMonth(
        calendarMonth + 1,
      );
    }
  };

  const goToday = () => {
    const now = new Date();

    const key = dateKey(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    setCalendarMonth(
      now.getMonth(),
    );

    setCalendarYear(
      now.getFullYear(),
    );

    setSelectedDate(key);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-br from-[#141414] via-[#1b1b1b] to-[#101010] p-6 shadow-xl">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h2 className="text-2xl font-bold text-gold">
            Business Calendar
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Complete monthly calendar with business
            activity
          </p>
        </div>

        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={
              previousMonth
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-lg text-gray-300 transition hover:border-gold/40 hover:bg-gold/10 hover:text-gold"
            aria-label="Previous month"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={goToday}
            className="rounded-xl border border-gold/30 px-4 py-2 text-sm font-medium text-gold transition hover:bg-gold/10"
          >
            Today
          </button>

          <button
            type="button"
            onClick={
              nextMonth
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-lg text-gray-300 transition hover:border-gold/40 hover:bg-gold/10 hover:text-gold"
            aria-label="Next month"
          >
            ›
          </button>

        </div>
      </div>

      {/* =================================================
          MONTH TITLE
      ================================================= */}

      <div className="mb-5 flex items-center justify-center">

        <h3 className="text-xl font-semibold text-white">
          {MONTHS[calendarMonth]}{" "}
          {calendarYear}
        </h3>

      </div>

      {/* =================================================
          LOADING
      ================================================= */}

      {loading ? (
        <div className="flex min-h-[500px] items-center justify-center">

          <p className="text-sm text-gray-500">
            Loading calendar...
          </p>

        </div>
      ) : error ? (
        <div className="flex min-h-[500px] items-center justify-center">

          <div className="text-center">

            <p className="text-sm text-red-400">
              Unable to load calendar
            </p>

            <p className="mt-2 text-xs text-gray-600">
              {error}
            </p>

          </div>

        </div>
      ) : (
        <>
          {/* ============================================
              WEEKDAYS
          ============================================ */}

          <div className="grid grid-cols-7 border-b border-white/10">

            {WEEKDAYS.map(
              (day) => (
                <div
                  key={day}
                  className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  {day}
                </div>
              ),
            )}

          </div>

          {/* ============================================
              CALENDAR GRID
          ============================================ */}

          <div className="grid grid-cols-7 border-l border-t border-white/10">

            {calendarDays.map(
              (day, index) => {
                if (
                  day === null
                ) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="min-h-[150px] border-b border-r border-white/10 bg-[#101010]/50"
                    />
                  );
                }

                const key =
                  dateKey(
                    calendarYear,
                    calendarMonth,
                    day,
                  );

                const activity =
                  dataMap.get(key);

                const isToday =
                  key === todayKey;

                const isSelected =
                  key ===
                  selectedDate;

                const hasOrders =
                  Number(
                    activity?.orders ??
                      0,
                  ) > 0;

                const hasRevenue =
                  Number(
                    activity?.revenue ??
                      0,
                  ) > 0;

                const hasExpenses =
                  Number(
                    activity?.expenses ??
                      0,
                  ) > 0;

                const hasGold =
                  Number(
                    activity?.goldAdded ??
                      0,
                  ) > 0 ||
                  Number(
                    activity?.goldUsed ??
                      0,
                  ) > 0;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setSelectedDate(
                        key,
                      )
                    }
                    className={`group relative min-h-[150px] border-b border-r border-white/10 p-3 text-left transition ${
                      isSelected
                        ? "bg-gold/[0.10]"
                        : "bg-[#151515] hover:bg-white/[0.04]"
                    }`}
                  >

                    {/* DATE */}

                    <div className="flex items-start justify-between">

                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                          isToday
                            ? "bg-gold text-black"
                            : isSelected
                              ? "border border-gold/50 text-gold"
                              : "text-gray-300"
                        }`}
                      >
                        {day}
                      </span>

                      {activity && (
                        <span className="text-[9px] uppercase tracking-wider text-gold/60">
                          active
                        </span>
                      )}

                    </div>

                    {/* ACTIVITY */}

                    {activity && (
                      <div className="mt-3 space-y-2">

                        {/* ORDERS */}

                        {hasOrders && (
                          <div className="space-y-1">

                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-white">

                              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />

                              {activity.orders}{" "}
                              {activity.orders ===
                              1
                                ? "Order"
                                : "Orders"}

                            </div>

                            {/* Show actual order numbers */}

                            {activity.orderDetails
                              ?.slice(
                                0,
                                2,
                              )
                              .map(
                                (
                                  order,
                                ) => (
                                  <div
                                    key={
                                      order.id
                                    }
                                    className="ml-3 truncate text-[9px] text-gray-500"
                                  >
                                    {
                                      order.order_number
                                    }
                                  </div>
                                ),
                              )}

                            {activity
                              .orderDetails
                              ?.length >
                              2 && (
                              <div className="ml-3 text-[9px] text-gold">
                                +
                                {activity
                                  .orderDetails
                                  .length -
                                  2}{" "}
                                more
                              </div>
                            )}

                          </div>
                        )}

                        {/* REVENUE */}

                        {hasRevenue && (
                          <div className="flex items-center gap-1.5 text-[11px] text-gold">

                            <span className="h-1.5 w-1.5 rounded-full bg-gold" />

                            {money(
                              activity.revenue,
                            )}

                          </div>
                        )}

                        {/* EXPENSES */}

                        {hasExpenses && (
                          <div className="flex items-center gap-1.5 text-[11px] text-red-400">

                            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />

                            {money(
                              activity.expenses,
                            )}

                          </div>
                        )}

                        {/* GOLD */}

                        {hasGold && (
                          <div className="flex items-center gap-1.5 text-[11px] text-green-400">

                            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />

                            {Number(
                              activity.goldAdded ||
                                0,
                            ).toFixed(3)}{" "}
                            g gold

                          </div>
                        )}

                      </div>
                    )}

                  </button>
                );
              },
            )}

          </div>

          {/* ============================================
              LEGEND
          ============================================ */}

          <div className="mt-5 flex flex-wrap gap-5 text-xs text-gray-400">

            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              Orders
            </span>

            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gold" />
              Revenue
            </span>

            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              Expenses
            </span>

            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Gold
            </span>

          </div>

          {/* ============================================
              SELECTED DATE
          ============================================ */}

          <div className="mt-6 rounded-2xl border border-gold/20 bg-[#111111] p-5">

            <div className="mb-5">

              <p className="text-xs uppercase tracking-wider text-gray-500">
                Selected Date
              </p>

              <h3 className="mt-1 text-lg font-semibold text-white">
                {formatLongDate(
                  selectedDate,
                )}
              </h3>

            </div>

            {selectedActivity ? (
              <>
                {/* ======================================
                    SUMMARY CARDS
                ====================================== */}

                <div className="grid grid-cols-2 gap-3 md:grid-cols-6">

                  {/* ORDERS */}

                  <div className="rounded-xl bg-white/[0.03] p-4">

                    <p className="text-xs text-gray-500">
                      Orders
                    </p>

                    <p className="mt-2 text-lg font-bold text-white">
                      {
                        selectedActivity.orders
                      }
                    </p>

                  </div>

                  {/* REVENUE */}

                  <div className="rounded-xl bg-white/[0.03] p-4">

                    <p className="text-xs text-gray-500">
                      Revenue
                    </p>

                    <p className="mt-2 text-lg font-bold text-gold">
                      {money(
                        selectedActivity.revenue,
                      )}
                    </p>

                  </div>

                  {/* EXPENSES */}

                  <div className="rounded-xl bg-white/[0.03] p-4">

                    <p className="text-xs text-gray-500">
                      Expenses
                    </p>

                    <p className="mt-2 text-lg font-bold text-red-400">
                      {money(
                        selectedActivity.expenses,
                      )}
                    </p>

                  </div>

                  {/* PROFIT */}

                  <div className="rounded-xl bg-white/[0.03] p-4">

                    <p className="text-xs text-gray-500">
                      Profit
                    </p>

                    <p
                      className={`mt-2 text-lg font-bold ${
                        selectedProfit >=
                        0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {money(
                        selectedProfit,
                      )}
                    </p>

                  </div>

                  {/* GOLD ADDED */}

                  <div className="rounded-xl bg-white/[0.03] p-4">

                    <p className="text-xs text-gray-500">
                      Gold Added
                    </p>

                    <p className="mt-2 text-lg font-bold text-green-400">
                      {Number(
                        selectedActivity.goldAdded ||
                          0,
                      ).toFixed(3)}{" "}
                      g
                    </p>

                  </div>

                  {/* GOLD USED */}

                  <div className="rounded-xl bg-white/[0.03] p-4">

                    <p className="text-xs text-gray-500">
                      Gold Used
                    </p>

                    <p className="mt-2 text-lg font-bold text-red-400">
                      {Number(
                        selectedActivity.goldUsed ||
                          0,
                      ).toFixed(3)}{" "}
                      g
                    </p>

                  </div>

                </div>

                {/* ======================================
                    ORDER DETAILS
                ====================================== */}

                {selectedActivity.orderDetails
                  ?.length > 0 && (
                  <div className="mt-7">

                    <div className="mb-4">

                      <h4 className="text-base font-semibold text-white">
                        Orders on this date
                      </h4>

                      <p className="mt-1 text-xs text-gray-500">
                        Complete order information
                        from the backend
                      </p>

                    </div>

                    <div className="space-y-3">

                      {selectedActivity.orderDetails.map(
                        (order) => (
                          <div
                            key={
                              order.id
                            }
                            className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition hover:border-gold/20"
                          >

                            {/* ORDER HEADER */}

                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                              <div>

                                <p className="text-base font-semibold text-white">
                                  {
                                    order.order_number
                                  }
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                  Order ID #
                                  {
                                    order.id
                                  }
                                </p>

                              </div>

                              <span
                                className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                                  order.status?.toLowerCase() ===
                                  "delivered"
                                    ? "bg-green-400/10 text-green-400"
                                    : order.status?.toLowerCase() ===
                                        "pending"
                                      ? "bg-yellow-400/10 text-yellow-400"
                                      : "bg-white/10 text-gray-300"
                                }`}
                              >
                                {
                                  order.status
                                }
                              </span>

                            </div>

                            {/* ORDER DATA */}

                            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">

                              {/* PROJECT */}

                              <div>

                                <p className="text-[10px] uppercase tracking-wider text-gray-500">
                                  Project
                                </p>

                                <p className="mt-1 truncate text-sm text-white">
                                  {
                                    order.project_name ||
                                    "—"
                                  }
                                </p>

                              </div>

                              {/* CATEGORY */}

                              <div>

                                <p className="text-[10px] uppercase tracking-wider text-gray-500">
                                  Category
                                </p>

                                <p className="mt-1 truncate text-sm text-white">
                                  {
                                    order.category ||
                                    "—"
                                  }
                                </p>

                              </div>

                              {/* GROSS WEIGHT */}

                              <div>

                                <p className="text-[10px] uppercase tracking-wider text-gray-500">
                                  Gross Weight
                                </p>

                                <p className="mt-1 text-sm text-white">
                                  {Number(
                                    order.gross_weight ||
                                      0,
                                  ).toFixed(
                                    3,
                                  )}{" "}
                                  g
                                </p>

                              </div>

                              {/* NET GOLD */}

                              <div>

                                <p className="text-[10px] uppercase tracking-wider text-gray-500">
                                  Net Gold
                                </p>

                                <p className="mt-1 text-sm text-green-400">
                                  {Number(
                                    order.net_gold_weight ||
                                      0,
                                  ).toFixed(
                                    3,
                                  )}{" "}
                                  g
                                </p>

                              </div>

                              {/* GOLD EARNED */}

                              <div>

                                <p className="text-[10px] uppercase tracking-wider text-gray-500">
                                  Gold Earned
                                </p>

                                <p className="mt-1 text-sm text-gold">
                                  {Number(
                                    order.gold_earned ||
                                      0,
                                  ).toFixed(
                                    3,
                                  )}{" "}
                                  g
                                </p>

                              </div>

                              {/* WASTAGE */}

                              <div>

                                <p className="text-[10px] uppercase tracking-wider text-gray-500">
                                  Wastage
                                </p>

                                <p className="mt-1 text-sm text-white">
                                  {Number(
                                    order.wastage_percent ||
                                      0,
                                  ).toFixed(
                                    2,
                                  )}
                                  %
                                </p>

                              </div>

                            </div>

                            {/* SECOND ROW */}

                            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-white/5 pt-4 md:grid-cols-4">

                              {/* STONE */}

                              <div>

                                <p className="text-[10px] uppercase tracking-wider text-gray-500">
                                  Stone Weight
                                </p>

                                <p className="mt-1 text-sm text-white">
                                  {Number(
                                    order.stone_weight ||
                                      0,
                                  ).toFixed(
                                    3,
                                  )}{" "}
                                  g
                                </p>

                              </div>

                              {/* PERCENTAGE */}

                              <div>

                                <p className="text-[10px] uppercase tracking-wider text-gray-500">
                                  Percentage
                                </p>

                                <p className="mt-1 text-sm text-white">
                                  {Number(
                                    order.percentage ||
                                      0,
                                  ).toFixed(
                                    2,
                                  )}
                                  %
                                </p>

                              </div>

                              {/* LABOUR */}

                              <div>

                                <p className="text-[10px] uppercase tracking-wider text-gray-500">
                                  Labour Charge
                                </p>

                                <p className="mt-1 text-sm text-gold">
                                  {money(
                                    order.labour_charge,
                                  )}
                                </p>

                              </div>

                              {/* DELIVERY */}

                              <div>

                                <p className="text-[10px] uppercase tracking-wider text-gray-500">
                                  Delivery Date
                                </p>

                                <p className="mt-1 text-sm text-white">
                                  {formatOrderDate(
                                    order.delivery_date,
                                  )}
                                </p>

                              </div>

                            </div>

                          </div>
                        ),
                      )}

                    </div>

                  </div>
                )}

              </>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">

                <p className="text-sm text-gray-500">
                  No business activity recorded
                  for this date.
                </p>

                <p className="mt-2 text-xs text-gray-600">
                  Select a date containing business
                  activity.
                </p>

              </div>
            )}

          </div>
        </>
      )}

    </div>
  );
}