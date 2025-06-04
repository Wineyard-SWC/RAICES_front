import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface BurndownChartProps {
  data: {
    day: string
    Remaining: number
    Ideal: number
    date: string // Asegúrate de que los datos incluyan una fecha en formato ISO
  }[]
  height?: number
  totalSP?: number
}

export function BurndownChart({ data, height = 250, totalSP = 0 }: BurndownChartProps) {
  const isEmpty = data.length === 0;

  // Obtener la fecha actual
  const today = new Date();

  // Filtrar datos para excluir días futuros
  const filteredData = isEmpty
    ? []
    : data.filter((point) => new Date(point.date) <= today);

  return (
    <div className="bg-white border border-[#D3C7D3] rounded-md p-4 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-[#4a2b5c]">Burndown Chart</h3>
      </div>
      
      {isEmpty ? (
        <div className="text-center text-[#888] py-10">No data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              domain={[0, totalSP]} 
              tickCount={6}
              tick={{ fontSize: 12 }}
              label={{ 
                value: 'Story Points', 
                angle: -90, 
                position: 'insideLeft', 
                style: { textAnchor: 'middle' },
              }}
            />
            <Tooltip 
              formatter={(value) => [`${value} SP`]}
              labelFormatter={(label) => `Día ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="Remaining" 
              name="Actual Burn" 
              stroke="#4a2b5c" 
              strokeWidth={3} 
              dot={{ r: 4 }} 
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={500}
            />
            <Line 
              type="monotone" 
              dataKey="Ideal" 
              name="Ideal Burn" 
              stroke="#b491c8" 
              strokeDasharray="5 5" 
              strokeWidth={2} 
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}