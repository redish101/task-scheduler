"use client"

import { useState, useEffect } from "react"
import { useTaskContext } from "@/context/task-context"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, CheckCircle, XCircle } from "lucide-react"
import { formatTime } from "@/lib/utils"

interface ActiveTaskViewProps {
  onTaskComplete: () => void
  onExit: () => void
}

export function ActiveTaskView({ onTaskComplete, onExit }: ActiveTaskViewProps) {
  const { currentTask, completeCurrentTask } = useTaskContext()
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (!currentTask) return

    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 60000) // 每分钟更新一次

    return () => clearInterval(interval)
  }, [currentTask])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  }

  const handleCompleteTask = () => {
    if (!currentTask) return
    completeCurrentTask(timeElapsed)
    onTaskComplete()
  }

  if (!currentTask) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">没有活动任务</h2>
        <p className="text-muted-foreground mb-6">所有任务已完成或尚未生成日程安排。</p>
        <Button onClick={onExit}>返回设置</Button>
      </div>
    )
  }

  const progress = Math.min(100, (timeElapsed / currentTask.task.estimatedMinutes) * 100)
  const currentTime = new Date()

  return (
    <div className={`min-h-[80vh] flex flex-col justify-center items-center ${isFullscreen ? "bg-background" : ""}`}>
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="text-6xl font-bold mb-2">{formatTime(currentTime)}</div>
          <div className="text-xl text-muted-foreground">
            {currentTime.toLocaleDateString("zh-CN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">{currentTask.task.title}</CardTitle>
            <div className="flex justify-center items-center mt-2 text-muted-foreground">
              <Clock className="mr-2 h-5 w-5" />
              <span>预计: {currentTask.task.estimatedMinutes} 分钟</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>已用时间: {timeElapsed} 分钟</span>
                <span>学科: {getDisciplineName(currentTask.task.discipline)}</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-sm">
                <span>开始: {formatTime(currentTask.startTime)}</span>
                <span>结束: {formatTime(currentTask.endTime)}</span>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">任务详情</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>难度: {currentTask.task.difficulty}/5</div>
                  <div>优先级: {currentTask.task.priority}/5</div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={toggleFullscreen}>
              {isFullscreen ? "退出全屏" : "进入全屏"}
            </Button>
            <div className="space-x-2">
              <Button variant="destructive" onClick={onExit}>
                <XCircle className="mr-2 h-4 w-4" />
                退出
              </Button>
              <Button onClick={handleCompleteTask}>
                <CheckCircle className="mr-2 h-4 w-4" />
                完成任务
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

function getDisciplineName(discipline: string): string {
  const disciplineMap: Record<string, string> = {
    general: "通用",
    mathematics: "数学",
    science: "科学",
    humanities: "人文",
    languages: "语言",
    arts: "艺术",
    programming: "编程",
    research: "研究",
  }

  return disciplineMap[discipline] || discipline
}
