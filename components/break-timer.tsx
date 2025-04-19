"use client"

import { useState, useEffect } from "react"
import { useTaskContext } from "@/context/task-context"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Coffee, SkipForward } from "lucide-react"

interface BreakTimerProps {
  onBreakComplete: () => void
  onExit: () => void
}

export function BreakTimer({ onBreakComplete, onExit }: BreakTimerProps) {
  const { breakDuration, lastCompletedTask } = useTaskContext()
  const [timeRemaining, setTimeRemaining] = useState(breakDuration)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused || timeRemaining <= 0) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining, isPaused])

  useEffect(() => {
    if (timeRemaining === 0) {
      // 播放声音或通知
      const audio = new Audio("/notification.mp3")
      audio.play().catch((e) => console.log("音频播放失败:", e))
    }
  }, [timeRemaining])

  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const progress = ((breakDuration - timeRemaining) / breakDuration) * 100

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center">
      <div className="w-full max-w-xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">休息时间</CardTitle>
            {lastCompletedTask && <p className="text-muted-foreground mt-2">完成任务后: {lastCompletedTask.title}</p>}
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="flex justify-center">
              <Coffee className="h-24 w-24 text-primary" />
            </div>

            <div className="text-6xl font-bold">{formatTimeRemaining()}</div>

            <Progress value={progress} className="h-2" />

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">休息详情</h4>
              <p className="text-sm">此休息时间是根据您上一个任务的难度和完成所花费的时间计算的。</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="default" className="h-10" onClick={() => setIsPaused(!isPaused)}>
              {isPaused ? "继续" : "暂停"}
            </Button>
            <div className="space-x-2">
              <Button variant="outline" size="default" className="h-10" onClick={onExit}>
                退出
              </Button>
              <Button
                variant="default"
                size="default"
                className="h-10"
                onClick={onBreakComplete}
                disabled={timeRemaining > 0 && !isPaused}
              >
                <SkipForward className="mr-2 h-4 w-4" />
                {timeRemaining > 0 ? "跳过休息" : "继续"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
