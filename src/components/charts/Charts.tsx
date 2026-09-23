import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartTooltip, Legend } from './ChartTooltip'
import { GRID, SERIES, axisProps } from './theme'

export interface SeriesDef {
  key: string
  label: string
  color?: string
  dashed?: boolean
  area?: boolean
}

/** Visually-hidden table so every chart has a non-visual equivalent. */
function SrTable({ data, xKey, series, caption }: { data: Record<string, unknown>[]; xKey: string; series: SeriesDef[]; caption: string }) {
  return (
    <div className="sr-only">
    <table>
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th>{xKey}</th>
          {series.map((s) => <th key={s.key}>{s.label}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map((d, i) => (
          <tr key={i}>
            <td>{String(d[xKey])}</td>
            {series.map((s) => <td key={s.key}>{String(d[s.key] ?? '')}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  )
}

interface TimeSeriesProps {
  data: Record<string, unknown>[]
  xKey: string
  series: SeriesDef[]
  height?: number
  unit?: string
  xFormatter?: (v: string) => string
  caption: string
  showLegend?: boolean
  band?: { low: string; high: string; label: string }
  /** false = fit the y-axis to the data (for change-over-time lines without area fill) */
  zeroBaseline?: boolean
}

export function TimeSeriesChart({ data, xKey, series, height = 260, unit, xFormatter, caption, showLegend = true, band, zeroBaseline = true }: TimeSeriesProps) {
  const withArea = series.some((s) => s.area) || band
  const Chart = withArea ? AreaChart : LineChart
  return (
    <figure className="w-full">
      {showLegend && series.length > 1 && (
        <Legend items={[...series.map((s, i) => ({ label: s.label, color: s.color ?? SERIES[i], dashed: s.dashed })), ...(band ? [{ label: band.label, color: '#bfdbfe' }] : [])]} />
      )}
      <div style={{ height }} className="mt-3" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <Chart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              {series.map((s, i) => (
                <linearGradient key={s.key} id={`g-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color ?? SERIES[i]} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={s.color ?? SERIES[i]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey={xKey} {...axisProps} tickFormatter={xFormatter} minTickGap={24} dy={6} />
            <YAxis {...axisProps} width={44} domain={zeroBaseline ? [0, 'auto'] : [(min: number) => Math.floor((min * 0.9) / 100) * 100, (max: number) => Math.ceil((max * 1.05) / 100) * 100]} />
            <Tooltip content={<ChartTooltip unit={unit} labelFormatter={xFormatter as never} />} />
            {band && withArea && (
              <Area
                dataKey={(d: Record<string, number>) => [d[band.low], d[band.high]]}
                stroke="none"
                fill="#dbeafe"
                fillOpacity={0.8}
                isAnimationActive={false}
                activeDot={false}
                name={band.label}
              />
            )}
            {series.map((s, i) => {
              const color = s.color ?? SERIES[i]
              return withArea ? (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={color}
                  strokeWidth={2}
                  strokeDasharray={s.dashed ? '5 4' : undefined}
                  fill={s.area ? `url(#g-${s.key})` : 'transparent'}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                  animationDuration={900}
                />
              ) : (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={color}
                  strokeWidth={2}
                  strokeDasharray={s.dashed ? '5 4' : undefined}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                  animationDuration={900}
                />
              )
            })}
          </Chart>
        </ResponsiveContainer>
      </div>
      <SrTable data={data} xKey={xKey} series={series} caption={caption} />
    </figure>
  )
}

interface BarProps {
  data: Record<string, unknown>[]
  xKey: string
  series: SeriesDef[]
  height?: number
  unit?: string
  horizontal?: boolean
  caption: string
  highlightMax?: boolean
}

export function BarSeriesChart({ data, xKey, series, height = 260, unit, horizontal, caption, highlightMax }: BarProps) {
  const max = highlightMax ? Math.max(...data.map((d) => Number(d[series[0].key]))) : null
  return (
    <figure className="w-full">
      {series.length > 1 && <Legend items={series.map((s, i) => ({ label: s.label, color: s.color ?? SERIES[i] }))} />}
      <div style={{ height }} className="mt-3" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ top: 8, right: 8, left: horizontal ? 8 : 0, bottom: 0 }} barGap={2} barCategoryGap={horizontal ? '28%' : '30%'}>
            <CartesianGrid vertical={horizontal} horizontal={!horizontal} stroke={GRID} />
            {horizontal ? (
              <>
                <XAxis type="number" {...axisProps} />
                <YAxis type="category" dataKey={xKey} {...axisProps} width={96} />
              </>
            ) : (
              <>
                <XAxis dataKey={xKey} {...axisProps} dy={6} />
                <YAxis {...axisProps} width={44} />
              </>
            )}
            <Tooltip cursor={{ fill: '#f1f5f9' }} content={<ChartTooltip unit={unit} />} />
            {series.map((s, i) => (
              <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color ?? SERIES[i]} radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={36} animationDuration={800}>
                {max !== null && i === 0 && data.map((d, j) => <Cell key={j} fill={Number(d[s.key]) === max ? '#d97706' : s.color ?? SERIES[i]} />)}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <SrTable data={data} xKey={xKey} series={series} caption={caption} />
    </figure>
  )
}

export function DonutChart({ data, height = 220, unit = '%', caption }: { data: { name: string; value: number }[]; height?: number; unit?: string; caption: string }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <figure className="@container w-full">
      <div className="flex flex-col items-center gap-5 @sm:flex-row">
      <div style={{ height, width: height }} className="relative shrink-0" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="64%" outerRadius="100%" paddingAngle={1.5} stroke="#fff" strokeWidth={2} animationDuration={900}>
              {data.map((d, i) => <Cell key={d.name} fill={d.name === 'Other' ? '#94a3b8' : SERIES[i % SERIES.length]} />)}
            </Pie>
            <Tooltip content={<ChartTooltip unit={unit} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="num text-xl font-bold text-ink">{total}{unit}</p>
            <p className="text-[11px] text-ink-subtle">of surplus</p>
          </div>
        </div>
      </div>
      <ul className="w-full space-y-2 text-sm">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-ink-muted">
              <span className="size-2.5 rounded-sm" style={{ background: d.name === 'Other' ? '#94a3b8' : SERIES[i % SERIES.length] }} aria-hidden />
              {d.name}
            </span>
            <span className="num font-semibold text-ink">{d.value}{unit}</span>
          </li>
        ))}
      </ul>
      </div>
      <figcaption className="sr-only">{caption}</figcaption>
    </figure>
  )
}
