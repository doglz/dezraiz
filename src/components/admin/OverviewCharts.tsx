import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { growthData, planDistribution } from "@/mocks/admin-data";

const fmtNum = (n: number) => n.toLocaleString("pt-BR");

export default function OverviewCharts() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Crescimento de usuários</h3>
            <p className="text-xs text-white/40">Últimos 30 dias</p>
          </div>
          <span className="rounded-full bg-[#27c166]/10 px-2.5 py-1 text-[11px] font-medium text-[#27c166]">
            +15,4%
          </span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.3)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(d) =>
                  new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
                }
                interval={5}
              />
              <YAxis
                stroke="rgba(255,255,255,0.3)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#0a0a0a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  color: "#f0efe9",
                  fontSize: 12,
                }}
                labelFormatter={(d) => new Date(d).toLocaleDateString("pt-BR")}
                formatter={(v: number) => [fmtNum(v), "Usuários"]}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#27c166"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: "#27c166" }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-white">Distribuição de planos</h3>
          <p className="text-xs text-white/40">Base total de usuários</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={planDistribution}
                dataKey="value"
                nameKey="plan"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                stroke="none"
                isAnimationActive={false}
              >
                {planDistribution.map((entry) => (
                  <Cell key={entry.plan} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#0a0a0a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  color: "#f0efe9",
                  fontSize: 12,
                }}
                formatter={(v: number, name) => [`${v}%`, name]}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: "#f0efe9" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
