'use client'

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { formatCurrency } from '@/lib/formatters'

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler)

interface FanChartProps {
  paths: number[][]
  percentiles: { p10: number[]; p50: number[]; p90: number[] }
}

export default function FanChart({ paths, percentiles }: FanChartProps) {
  const horizonYears = percentiles.p50.length
  const labels = Array.from({ length: horizonYears }, (_, i) => `Yr ${i + 1}`)

  // Sample up to 150 paths for display
  const samplePaths = paths.length > 150 ? paths.filter((_, i) => i % Math.ceil(paths.length / 150) === 0) : paths

  const pathDatasets = samplePaths.map((path) => ({
    data: path,
    borderColor: 'rgba(45,212,191,0.05)',
    borderWidth: 1,
    pointRadius: 0,
    fill: false,
    tension: 0.3,
    animation: false as const,
    label: '',
  }))

  const data: ChartData<'line'> = {
    labels,
    datasets: [
      ...pathDatasets,
      {
        label: 'P10',
        data: percentiles.p10,
        borderColor: '#fb923c',
        borderWidth: 1.5,
        borderDash: [4, 3],
        pointRadius: 0,
        fill: false,
        tension: 0.3,
      },
      {
        label: 'P90',
        data: percentiles.p90,
        borderColor: '#f87171',
        borderWidth: 1.5,
        borderDash: [4, 3],
        pointRadius: 0,
        fill: false,
        tension: 0.3,
      },
      {
        label: 'P50 (Median)',
        data: percentiles.p50,
        borderColor: '#2dd4bf',
        borderWidth: 2.5,
        pointRadius: 0,
        fill: false,
        tension: 0.3,
      },
    ],
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      duration: 800,
      easing: 'easeInOutQuart',
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#737375',
          boxWidth: 12,
          padding: 16,
          font: { size: 11 },
          filter: (item) => item.text !== '',
        },
      },
      tooltip: {
        backgroundColor: '#141415',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        titleColor: '#e2e2e3',
        bodyColor: '#737375',
        padding: 12,
        filter: (item) => (item.dataset.label ?? '') !== '',
        callbacks: {
          title: (items) => `Year ${items[0].dataIndex + 1}`,
          label: (item) => {
            if ((item.dataset.label ?? '') === '') return ''
            return ` ${item.dataset.label}: ${formatCurrency(item.parsed.y ?? 0)}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#737375', font: { size: 10 }, maxTicksLimit: 10 },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          color: '#737375',
          font: { size: 10 },
          callback: (val) => formatCurrency(Number(val)),
        },
      },
    },
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <h3 className="text-text font-semibold text-sm mb-4">Simulation Paths</h3>
      <div className="relative">
        <Line data={data} options={options} />
      </div>
    </div>
  )
}
