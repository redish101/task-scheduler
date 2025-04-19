"use client"

import { useEffect, useRef } from "react"

interface AttentionModelChartProps {
  morningPeak: number
  afternoonDip: number
  eveningRecovery: number
}

export function AttentionModelChart({ morningPeak, afternoonDip, eveningRecovery }: AttentionModelChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 设置画布尺寸
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, rect.width, rect.height)

    // 图表尺寸
    const padding = 30
    const chartWidth = rect.width - padding * 2
    const chartHeight = rect.height - padding * 2

    // 绘制坐标轴
    ctx.beginPath()
    ctx.strokeStyle = "#94a3b8" // slate-400
    ctx.lineWidth = 1

    // X轴
    ctx.moveTo(padding, rect.height - padding)
    ctx.lineTo(rect.width - padding, rect.height - padding)

    // Y轴
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, rect.height - padding)
    ctx.stroke()

    // 绘制时间标签
    ctx.fillStyle = "#64748b" // slate-500
    ctx.font = "10px sans-serif"
    ctx.textAlign = "center"

    const timeLabels = ["6点", "9点", "12点", "15点", "18点", "21点"]
    timeLabels.forEach((label, i) => {
      const x = padding + (i * chartWidth) / (timeLabels.length - 1)
      ctx.fillText(label, x, rect.height - padding + 15)
    })

    // 绘制百分比标签
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"

    const percentLabels = [0, 25, 50, 75, 100]
    percentLabels.forEach((label) => {
      const y = rect.height - padding - (label / 100) * chartHeight
      ctx.fillText(`${label}%`, padding - 5, y)
    })

    // 计算注意力曲线点
    const points = [
      { x: 0, y: 60 }, // 6点
      { x: 0.15, y: morningPeak }, // 9点
      { x: 0.35, y: afternoonDip }, // 13点
      { x: 0.65, y: eveningRecovery }, // 17点
      { x: 1, y: 50 }, // 21点
    ]

    // 绘制注意力曲线
    ctx.beginPath()
    ctx.strokeStyle = "#0ea5e9" // sky-500
    ctx.lineWidth = 3

    points.forEach((point, i) => {
      const x = padding + point.x * chartWidth
      const y = rect.height - padding - (point.y / 100) * chartHeight

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        // 使用贝塞尔曲线使线条更平滑
        const prevPoint = points[i - 1]
        const prevX = padding + prevPoint.x * chartWidth
        const prevY = rect.height - padding - (prevPoint.y / 100) * chartHeight

        const cp1x = prevX + (x - prevX) / 3
        const cp2x = prevX + (2 * (x - prevX)) / 3

        ctx.bezierCurveTo(cp1x, prevY, cp2x, y, x, y)
      }
    })
    ctx.stroke()

    // 填充曲线下方区域
    ctx.lineTo(padding + chartWidth, rect.height - padding)
    ctx.lineTo(padding, rect.height - padding)
    ctx.closePath()
    ctx.fillStyle = "rgba(14, 165, 233, 0.1)" // sky-500 with opacity
    ctx.fill()

    // 绘制关键点
    ctx.fillStyle = "#0ea5e9" // sky-500
    points.forEach((point) => {
      const x = padding + point.x * chartWidth
      const y = rect.height - padding - (point.y / 100) * chartHeight

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()
    })
  }, [morningPeak, afternoonDip, eveningRecovery])

  return <canvas ref={canvasRef} className="w-full h-full" />
}
