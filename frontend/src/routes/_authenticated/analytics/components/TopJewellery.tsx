import { Gem, TrendingUp } from "lucide-react";

const jewellery = [
  {
    name: "Gold Rings",
    orders: 152,
    revenue: 2480000,
    gold: 845,
  },
  {
    name: "Chains",
    orders: 118,
    revenue: 1940000,
    gold: 702,
  },
  {
    name: "Necklaces",
    orders: 86,
    revenue: 1680000,
    gold: 620,
  },
  {
    name: "Bangles",
    orders: 74,
    revenue: 1420000,
    gold: 512,
  },
  {
    name: "Pendants",
    orders: 59,
    revenue: 985000,
    gold: 348,
  },
];

const maxOrders = Math.max(...jewellery.map((j) => j.orders));

export default function TopJewellery() {
  return (
    <div className="rounded-3xl border border-gold/20 bg-[#151515] p-6 shadow-xl">

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h2 className="text-2xl font-bold text-gold">
            Top Jewellery
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Best Performing Categories
          </p>
        </div>

        <div className="rounded-xl border border-gold/30 px-4 py-2 text-sm text-gold">
          Top 5
        </div>

      </div>

      <div className="space-y-5">

        {jewellery.map((item, index) => (

          <div
            key={item.name}
            className="rounded-2xl border border-white/5 bg-black/20 p-5 transition-all duration-300 hover:border-gold/40 hover:bg-black/30"
          >

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">

                  <Gem
                    size={22}
                    className="text-yellow-400"
                  />

                </div>

                <div>

                  <h3 className="font-semibold text-white">
                    #{index + 1} {item.name}
                  </h3>

                  <p className="text-sm text-gray-400">
                    {item.orders} Orders
                  </p>

                </div>

              </div>

              <TrendingUp
                size={22}
                className="text-green-400"
              />

            </div>

            <div className="mt-5">

              <div className="flex justify-between text-sm">

                <span className="text-gray-400">
                  Popularity
                </span>

                <span className="text-gold">
                  {Math.round((item.orders / maxOrders) * 100)}%
                </span>

              </div>

              <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-800">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-300"
                  style={{
                    width: `${(item.orders / maxOrders) * 100}%`,
                  }}
                />

              </div>

            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">

              <div className="rounded-xl bg-black/30 p-4">

                <p className="text-xs text-gray-400">
                  Revenue
                </p>

                <h4 className="mt-2 text-lg font-bold text-green-400">
                  ₹ {item.revenue.toLocaleString("en-IN")}
                </h4>

              </div>

              <div className="rounded-xl bg-black/30 p-4">

                <p className="text-xs text-gray-400">
                  Gold Used
                </p>

                <h4 className="mt-2 text-lg font-bold text-yellow-400">
                  {item.gold} g
                </h4>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}