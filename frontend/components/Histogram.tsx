'use client'

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { formatCurrency } from '@/lib/formatters'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

interface HistogramProps {
  bins: number[]
  counts: number[]
  p25: number
  p75: number
}

export default function Histogram({ bins, counts, p25, p75 }: HistogramProps) {
  const backgroundColors = bins.map((bin) => {
    if (bin < p25) return 'rgba(248,113,113,0.8)'
    if (bin <= p75) return 'rgba(45,212,191,0.8)'
    return 'rgba(74,222,128,0.8)'
  })

  const labels = bins.map((b) => formatCurrency(b))

  const data: ChartData<'bar'> = {
    labels,
    datasets: [
      {
        label: 'Count',
        data: counts,
        backgroundColor: backgroundColors,
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 2,
      },
    ],
  }

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: true,
    animation: { duration: 800 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#141415',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        titleColor: '#e2e2e3',
        bodyColor: '#737375',
        padding: 12,
        callbacks: {
          title: (items) => `Value: ${items[0].label}`,
          label: (item) => ` Count: ${(item.parsed.y ?? 0).toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#737375',
          font: { size: 9 },
          maxTicksLimit: 8,
          maxRotation: 30,
        },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          color: '#737375',
          font: { size: 10 },
          callback: (val) => Number(val).toLocaleString(),
        },
      },
    },
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text font-semibold text-sm">Distribution of Final Values</h3>
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: 'rgba(248,113,113,0.8)' }} />
            Below P25
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: 'rgba(45,212,191,0.8)' }} />
            P25–P75
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: 'rgba(74,222,128,0.8)' }} />
            Above P75
          </span>
        </div>
      </div>
      <Bar data={data} options={options} />
    </div>
  )
}
