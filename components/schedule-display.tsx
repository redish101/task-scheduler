"use client"

import { useEffect } from "react"
import { useTaskContext } from "@/context/task-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Clock, Calendar, CheckCircle } from "lucide-react"
import { formatTime } from "@/lib/utils"

interface ScheduleDisplayProps {
  onStartSchedule: () => void
}

export function ScheduleDisplay({ onStartSchedule }: ScheduleDisplayProps) {
  const { tasks, schedule, generateSchedule, isScheduleGenerated, settings } = useTaskContext()
  const { toast } = useToast()

  // 过滤出未完成的任务
  const uncompletedTasks = tasks.filter((task) => !task.completed)

  useEffect(() => {
    if (uncompletedTasks.length > 0 && !isScheduleGenerated) {
      generateSchedule()
    }
  }, [uncompletedTasks, isScheduleGenerated, generateSchedule])

  const handleStartSchedule = () => {
    if (schedule.length === 0) {
      toast({
        title: "没有安排任务",
        description: "请在开始日程安排前添加任务",
        variant: "destructive",
      })
      return
    }
    onStartSchedule()
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} 分钟`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}小时 ${mins > 0 ? `${mins}分钟` : ""}`
  }

  return (
    <div className="space-y-6 py-4">
      <Card>
        <CardHeader>
          <CardTitle>生成的日程安排</CardTitle>
          <CardDescription>基于任务参数和最佳注意力模式</CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">暂无添加任务</p>
              <p className="text-sm text-muted-foreground mt-2">添加任务以生成日程安排</p>
            </div>
          ) : uncompletedTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">所有任务已完成</p>
              <p className="text-sm text-muted-foreground mt-2">添加新任务或重置已完成任务以生成新的日程安排</p>
            </div>
          ) : schedule.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">正在生成日程安排...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {schedule.map((scheduledTask, index) => (
                <Card key={index} className={`overflow-hidden ${scheduledTask.completed ? "opacity-70" : ""}`}>
                  <div className={`h-2 ${getDifficultyColor(scheduledTask.task.difficulty)}`} />
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        {scheduledTask.completed && <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />}
                        <div>
                          <h4
                            className={`font-medium ${scheduledTask.completed ? "line-through text-muted-foreground" : ""}`}
                          >
                            {scheduledTask.task.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {getDisciplineName(scheduledTask.task.discipline)} • 难度: {scheduledTask.task.difficulty}
                            {settings.scheduling.alternateTaskDifficulty && scheduledTask.task.difficulty <= 2 && (
                              <span className="ml-1 text-green-500"> • 放松任务</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{formatDuration(scheduledTask.task.estimatedMinutes)}</span>
                        </div>
                        <div className="flex items-center text-sm font-medium">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>
                            {formatTime(scheduledTask.startTime)} - {formatTime(scheduledTask.endTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={generateSchedule} disabled={uncompletedTasks.length === 0}>
            重新生成日程
          </Button>
          <Button onClick={handleStartSchedule} disabled={schedule.length === 0}>
            开始日程
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function getDifficultyColor(difficulty: number): string {
  switch (difficulty) {
    case 1:
      return "bg-green-500"
    case 2:
      return "bg-emerald-500"
    case 3:
      return "bg-yellow-500"
    case 4:
      return "bg-orange-500"
    case 5:
      return "bg-red-500"
    default:
      return "bg-blue-500"
  }
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
