import {
  FileSpreadsheet,
  FileText,
  Printer,
  Share2,
} from "lucide-react";

const actions = [
  {
    title: "Export PDF",
    icon: FileText,
    color: "from-red-500 to-red-700",
  },
  {
    title: "Export Excel",
    icon: FileSpreadsheet,
    color: "from-green-500 to-green-700",
  },
  {
    title: "Print Report",
    icon: Printer,
    color: "from-blue-500 to-blue-700",
  },
  {
    title: "Share Dashboard",
    icon: Share2,
    color: "from-yellow-500 to-yellow-700",
  },
];

export default function ExportButtons() {
  return (
    <div className="rounded-3xl border border-gold/20 bg-[#151515] p-6 shadow-xl">

      <div className="mb-8">

        <h2 className="text-3xl font-bold text-gold">
          Reports & Export
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          Export business reports in multiple formats
        </p>

      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        {actions.map((action) => {

          const Icon = action.icon;

          return (

            <button
              key={action.title}
              className="
                group
                rounded-2xl
                border
                border-white/10
                bg-black/20
                p-6
                transition-all
                duration-300
                hover:border-gold
                hover:-translate-y-1
                hover:shadow-2xl
              "
            >

              <div
                className={`
                  mx-auto
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  bg-gradient-to-r
                  ${action.color}
                `}
              >
                <Icon
                  size={30}
                  className="text-white"
                />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-white">
                {action.title}
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                Click to generate report
              </p>

            </button>

          );

        })}

      </div>

    </div>
  );
}