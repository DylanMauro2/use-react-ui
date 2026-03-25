"use client"

import { useEffect, useState } from "react"

export type Period = "AM" | "PM"

export type TimeValue = {
  hour: number
  minute: number
  period: Period
}

export type TimeView = "hours" | "minutes"

type UseTimeClockOptions = {
  value?: TimeValue
  onChange?: (time: TimeValue) => void
}

export function parseTimeString(str: string): TimeValue | null {
  const match = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return null
  return {
    hour: parseInt(match[1]),
    minute: parseInt(match[2]),
    period: match[3].toUpperCase() as Period,
  }
}

export function formatTimeValue(t: TimeValue): string {
  return `${t.hour}:${String(t.minute).padStart(2, "0")} ${t.period}`
}

export function useTimeClock({ value, onChange }: UseTimeClockOptions = {}) {
  const [view, setView] = useState<TimeView>("hours")
  const [hour, setHour] = useState(value?.hour ?? 12)
  const [minute, setMinute] = useState(value?.minute ?? 0)
  const [period, setPeriod] = useState<Period>(value?.period ?? "AM")

  // Sincroniza cuando el valor externo cambia (react-hook-form controlled)
  useEffect(() => {
    if (!value) return
    setHour(value.hour)
    setMinute(value.minute)
    setPeriod(value.period)
  }, [value?.hour, value?.minute, value?.period])

  const selectHour = (h: number) => {
    setHour(h)
    setView("minutes")
    onChange?.({ hour: h, minute, period })
  }

  const selectMinute = (m: number) => {
    setMinute(m)
    onChange?.({ hour, minute: m, period })
  }

  const selectPeriod = (p: Period) => {
    setPeriod(p)
    onChange?.({ hour, minute, period: p })
  }

  const handAngle = view === "hours" ? hour * 30 : minute * 6

  const formatted = formatTimeValue({ hour, minute, period })

  return {
    view,
    setView,
    hour,
    minute,
    period,
    handAngle,
    formatted,
    selectHour,
    selectMinute,
    selectPeriod,
  }
}
