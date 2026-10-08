import {
  TrendingUp,
  TrendingDown,
  Users,
  Gem,
  ShoppingBag,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

const insights = [
  {
    title: "Revenue Growth",
    description: "Revenue increased by 18.4% compared to last month.",
    icon: TrendingUp,
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    title: "Gold Consumption",
    description: "Gold usage decreased by 6.2% this week.",
    icon: Gem,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  {
    title: "Top Client",
    description: "Sri Lakshmi Jewellers generated the highest revenue.",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    title: "Best Selling",
    description: "Gold Rings remain the highest selling category.",
    icon: ShoppingBag,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    title: "Expense Alert",
    description: "Gold purchase expenses are 12% higher than average.",
    icon: AlertTriangle,
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
  {
    title: "Business Forecast",
    description: "Current trend projects 15% higher revenue next month.",
    icon: TrendingDown,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
];

export default function BusinessInsights() {
  return (
    <div className="rounded-3xl border border-gold/20 bg-[#151515] p-6 shadow-xl">

      <div className="mb-8 flex items-center gap-3">

        <div className="rounded-2xl bg-gold/10 p-3">
          <Sparkles className="text-gold" size={26} />
        </div>

        <div>
          <h2 className="text-3xl font-bold text-gold">
            AI Business Insights
          </h2>

          <p className="text-sm text-gray-400">
            Automatically generated business recommendations
          </p>
        </div>

      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

        {insights.map((item) => {

          const Icon = item.icon;

          return (

            <div
              key={item.title}
              className="rounded-2xl border border-white/5 bg-black/20 p-5 transition-all duration-300 hover:border-gold/40 hover:scale-[1.02]"
            >

              <div className="flex items-center gap-4">

                <div className={`rounded-xl p-3 ${item.bg}`}>
                  <Icon
                    size={24}
                    className={item.color}
                  />
                </div>

                <h3 className="text-lg font-semibold text-white">
                  {item.title}
                </h3>

              </div>

              <p className="mt-5 text-sm leading-6 text-gray-400">
                {item.description}
              </p>

            </div>

          );

        })}

      </div>

    </div>
  );
}