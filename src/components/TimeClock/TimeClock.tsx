import { useState } from 'react'
import { ClockIcon } from '../../icons'
import { Popover, PopoverContent, PopoverTrigger } from '../Popover/Popover'
import { formatTimeValue, parseTimeString, useTimeClock } from './useTimeClock'
import type { Period, TimeValue, TimeView } from './useTimeClock'
import './TimeClock.css'

// ── TimeClockPicker ───────────────────────────────────────────

type TimeClockPickerProps = {
  value?: string
  onValueChange?: (value: string) => void
  label?: string
  error?: string | string[]
  disabled?: boolean
  name?: string
}

function stringToTimeValue(str?: string): TimeValue | undefined {
  if (!str) return undefined
  return parseTimeString(str) ?? undefined
}

export function TimeClockPicker({
  value: controlledValue,
  onValueChange,
  label,
  error,
  disabled = false,
  name,
}: TimeClockPickerProps) {
  const [open, setOpen] = useState(false)
  const [internalValue, setInternalValue] = useState<string | undefined>(undefined)

  const isControlled = controlledValue !== undefined && onValueChange !== undefined
  const value = isControlled ? controlledValue : internalValue

  const timeValue = stringToTimeValue(value)

  const handleChange = (t: TimeValue) => {
    const formatted = formatTimeValue(t)
    if (isControlled) {
      onValueChange(formatted)
    } else {
      setInternalValue(formatted)
    }
  }

  const displayValue = value ?? '-- : -- --'

  const triggerClass = [
    'timeclock-trigger',
    open && 'timeclock-trigger--open',
    error && 'timeclock-trigger--error',
    disabled && 'timeclock-trigger--disabled',
  ].filter(Boolean).join(' ')

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <div>
        {label && <label className="timeclock-label">{label}</label>}
        <PopoverTrigger asChild>
          <button
            type="button"
            name={name}
            disabled={disabled}
            className={triggerClass}
          >
            <ClockIcon className="timeclock-trigger-icon" />
            <span className={`timeclock-trigger-value${!value ? ' timeclock-trigger-value--placeholder' : ''}`}>
              {displayValue}
            </span>
          </button>
        </PopoverTrigger>

        {error && (
          <label className="timeclock-error">
            {Array.isArray(error) && error.length > 0 ? error[0] : error}
          </label>
        )}
      </div>

      <PopoverContent>
        <TimeClock value={timeValue} onChange={handleChange} />
      </PopoverContent>
    </Popover>
  )
}

// ── Clock constants ───────────────────────────────────────────

const SIZE = 280
const CENTER = SIZE / 2
const HOUR_NUM_RADIUS = 100
const MINUTE_NUM_RADIUS = 108
const TICK_OUTER_R = 130
const TICK_INNER_MAJOR_R = 122
const TICK_INNER_MINOR_R = 126

function polarToXY(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  }
}

const HOUR_MARKS = Array.from({ length: 12 }, (_, i) => {
  const h = i + 1
  const angle = h * 30
  return { h, angle, ...polarToXY(angle, HOUR_NUM_RADIUS) }
})

const HOUR_TICKS = Array.from({ length: 72 }, (_, i) => {
  const angle = i * 5
  const isMajor = i % 6 === 0
  return {
    angle,
    isMajor,
    outer: polarToXY(angle, TICK_OUTER_R),
    inner: polarToXY(angle, isMajor ? TICK_INNER_MAJOR_R : TICK_INNER_MINOR_R),
  }
})

const MINUTE_MARKS = Array.from({ length: 60 }, (_, i) => {
  const angle = i * 6
  const isMajor = i % 5 === 0
  return {
    i,
    angle,
    isMajor,
    numPos: polarToXY(angle, MINUTE_NUM_RADIUS),
    outer: polarToXY(angle, TICK_OUTER_R),
    inner: polarToXY(angle, isMajor ? TICK_INNER_MAJOR_R : TICK_INNER_MINOR_R),
  }
})

// ── TimeClock ─────────────────────────────────────────────────

export type { TimeValue, Period, TimeView }

type TimeClockProps = {
  value?: TimeValue
  onChange?: (time: TimeValue) => void
}

export function TimeClock({ value, onChange }: TimeClockProps) {
  const {
    view, setView,
    hour, minute, period,
    handAngle,
    selectHour, selectMinute, selectPeriod,
  } = useTimeClock({ value, onChange })

  const handRadius = view === 'hours' ? HOUR_NUM_RADIUS : MINUTE_NUM_RADIUS
  const handEnd = polarToXY(handAngle, handRadius)

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - CENTER
    const y = e.clientY - rect.top - CENTER

    let angle = (Math.atan2(y, x) * 180) / Math.PI + 90
    if (angle < 0) angle += 360

    if (view === 'hours') {
      let h = Math.round(angle / 30) % 12
      if (h === 0) h = 12
      selectHour(h)
    } else {
      const m = Math.round(angle / 6) % 60
      selectMinute(m)
    }
  }

  return (
    <div className="timeclock-root">

      {/* Cabecera HH:MM AM/PM */}
      <div className="timeclock-header">
        <button
          type="button"
          onClick={() => setView('hours')}
          className={`timeclock-segment${view === 'hours' ? ' timeclock-segment--active' : ''}`}
        >
          {String(hour).padStart(2, '0')}
        </button>

        <span className="timeclock-separator">:</span>

        <button
          type="button"
          onClick={() => setView('minutes')}
          className={`timeclock-segment${view === 'minutes' ? ' timeclock-segment--active' : ''}`}
        >
          {String(minute).padStart(2, '0')}
        </button>

        <div className="timeclock-period">
          {(['AM', 'PM'] as Period[]).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => selectPeriod(p)}
              className={`timeclock-period-btn${period === p ? ' timeclock-period-btn--active' : ''}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Cara del reloj */}
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        onClick={handleSvgClick}
        className="timeclock-face"
      >
        <circle cx={CENTER} cy={CENTER} r={136} className="tc-fill-muted" />

        {/* Vista horas */}
        {view === 'hours' && <>
          {HOUR_TICKS.map((tick, i) => (
            <line
              key={i}
              x1={tick.inner.x} y1={tick.inner.y}
              x2={tick.outer.x} y2={tick.outer.y}
              strokeWidth={tick.isMajor ? 2 : 1}
              className={tick.isMajor ? 'tc-stroke-subtle' : 'tc-stroke-faint'}
            />
          ))}

          <line x1={CENTER} y1={CENTER} x2={handEnd.x} y2={handEnd.y}
            strokeWidth={2} strokeLinecap="round" className="tc-stroke-primary" />
          <circle cx={CENTER} cy={CENTER} r={4} className="tc-fill-primary" />

          {HOUR_MARKS.map(({ h, x, y }) => (
            <g key={h} onClick={e => { e.stopPropagation(); selectHour(h) }} style={{ cursor: 'pointer' }}>
              <circle cx={x} cy={y} r={20}
                className={hour === h ? 'tc-fill-primary' : 'tc-fill-none tc-hover-primary'}
              />
              <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
                fontSize={14} fontWeight={500}
                className={`pointer-events-none ${hour === h ? 'tc-fill-primary-fg' : 'tc-fill-fg'}`}
              >
                {h}
              </text>
            </g>
          ))}
        </>}

        {/* Vista minutos */}
        {view === 'minutes' && <>
          {MINUTE_MARKS.map(mark => (
            <line key={mark.i}
              x1={mark.inner.x} y1={mark.inner.y}
              x2={mark.outer.x} y2={mark.outer.y}
              strokeWidth={mark.isMajor ? 2 : 1}
              className={mark.isMajor ? 'tc-stroke-subtle' : 'tc-stroke-faint'}
            />
          ))}

          <line x1={CENTER} y1={CENTER} x2={handEnd.x} y2={handEnd.y}
            strokeWidth={2} strokeLinecap="round" className="tc-stroke-primary" />
          <circle cx={CENTER} cy={CENTER} r={4} className="tc-fill-primary" />

          {MINUTE_MARKS.filter(m => m.isMajor).map(({ i, numPos }) => (
            <g key={i} onClick={e => { e.stopPropagation(); selectMinute(i) }} style={{ cursor: 'pointer' }}>
              <circle cx={numPos.x} cy={numPos.y} r={16}
                className={minute === i ? 'tc-fill-primary' : 'tc-fill-none tc-hover-primary'}
              />
              <text x={numPos.x} y={numPos.y} textAnchor="middle" dominantBaseline="central"
                fontSize={11} fontWeight={500}
                className={minute === i ? 'tc-fill-primary-fg' : 'tc-fill-fg'}
              >
                {String(i).padStart(2, '0')}
              </text>
            </g>
          ))}

          {MINUTE_MARKS.filter(m => !m.isMajor).map(({ i, numPos }) => (
            <circle key={i} cx={numPos.x} cy={numPos.y} r={9}
              onClick={e => { e.stopPropagation(); selectMinute(i) }}
              className={`timeclock-face ${minute === i ? 'tc-fill-primary' : 'tc-fill-none tc-hover-primary2'}`}
            />
          ))}
        </>}
      </svg>

      <p className="timeclock-hint">
        {view === 'hours' ? 'Selecciona la hora' : 'Selecciona los minutos'}
      </p>
    </div>
  )
}
