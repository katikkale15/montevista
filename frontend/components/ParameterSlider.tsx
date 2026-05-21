'use client'

interface ParameterSliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  format?: (v: number) => string
}

export default function ParameterSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: ParameterSliderProps) {
  const displayValue = format ? format(value) : String(value)
  const pct = ((value - min) / (max - min)) * 100

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.-]/g, '')
    const parsed = parseFloat(raw)
    if (!isNaN(parsed)) {
      const clamped = Math.min(Math.max(parsed, min), max)
      onChange(clamped)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-text-muted text-sm font-medium">{label}</label>
        <input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          className="w-28 text-right bg-surface-offset border border-border rounded-lg px-2 py-1 text-text text-sm tabular-nums focus:outline-none focus:border-primary transition-colors"
        />
      </div>
      <div className="relative h-5 flex items-center">
        {/* Track background */}
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-surface-offset overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-100"
            style={{ width: `${pct}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className="relative w-full h-1.5 appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-surface
            [&::-webkit-slider-thumb]:shadow-sm
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-primary
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-surface
            [&::-moz-range-thumb]:cursor-pointer"
        />
      </div>
      <div className="flex justify-between text-text-muted text-xs">
        <span className="tabular-nums">{format ? format(min) : min}</span>
        <span className="tabular-nums">{format ? format(max) : max}</span>
      </div>
    </div>
  )
}
