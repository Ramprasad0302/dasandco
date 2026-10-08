import { Crown, TrendingUp } from "lucide-react";

const clients = [
  {
    name: "Sri Lakshmi Jewellers",
    orders: 48,
    revenue: 1825000,
    gold: 412,
  },
  {
    name: "ABC Gold House",
    orders: 39,
    revenue: 1468000,
    gold: 356,
  },
  {
    name: "Venkateswara Jewellers",
    orders: 31,
    revenue: 1294000,
    gold: 298,
  },
  {
    name: "Sai Ornaments",
    orders: 28,
    revenue: 985000,
    gold: 241,
  },
  {
    name: "Royal Gold",
    orders: 21,
    revenue: 842000,
    gold: 196,
  },
];

export default function TopClients() {
  return (
    <div className="rounded-3xl border border-gold/20 bg-[#151515] p-6 shadow-xl">

      <div className="mb-6 flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold text-gold">
            Top Clients
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Highest Revenue Customers
          </p>

        </div>

        <div className="rounded-xl border border-gold/30 px-4 py-2 text-sm text-gold">
          Top 5
        </div>

      </div>

      <div className="space-y-4">

        {clients.map((client, index) => (

          <div
            key={client.name}
            className="rounded-2xl border border-white/5 bg-black/20 p-5 transition-all duration-300 hover:border-gold/40 hover:bg-black/30"
          >

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">

                  {index === 0 ? (
                    <Crown
                      className="text-yellow-400"
                      size={22}
                    />
                  ) : (
                    <span className="font-bold text-gold">
                      #{index + 1}
                    </span>
                  )}

                </div>

                <div>

                  <h3 className="font-semibold text-white">
                    {client.name}
                  </h3>

                  <p className="text-sm text-gray-400">
                    {client.orders} Orders
                  </p>

                </div>

              </div>

              <TrendingUp
                className="text-green-400"
                size={22}
              />

            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">

              <div className="rounded-xl bg-black/30 p-4">

                <p className="text-xs text-gray-400">
                  Revenue
                </p>

                <h4 className="mt-2 text-lg font-bold text-green-400">
                  ₹ {client.revenue.toLocaleString("en-IN")}
                </h4>

              </div>

              <div className="rounded-xl bg-black/30 p-4">

                <p className="text-xs text-gray-400">
                  Gold Used
                </p>

                <h4 className="mt-2 text-lg font-bold text-yellow-400">
                  {client.gold} g
                </h4>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}