"use client"

import { useState } from "react"
import { useTaskContext } from "@/context/task-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2, CheckCircle, Circle } from "lucide-react"
import type { Task } from "@/types/task"

export function TaskInput() {
  const { tasks, addTask, removeTask, toggleTaskCompletion, clearAllTasks } = useTaskContext()
  const [newTask, setNewTask] = useState<Omit<Task, "id" | "completed">>({
    title: "",
    estimatedMinutes: 30,
    discipline: "general",
    difficulty: 3,
    priority: 2,
  })

  const handleAddTask = () => {
    if (newTask.title.trim() === "") return

    addTask({
      ...newTask,
      id: Date.now().toString(),
      completed: false, // 新任务默认为未完成
    })

    setNewTask({
      title: "",
      estimatedMinutes: 30,
      discipline: "general",
      difficulty: 3,
      priority: 2,
    })
  }

  return (
    <div className="space-y-6 py-4">
      <Card>
        <CardHeader>
          <CardTitle>添加新任务</CardTitle>
          <CardDescription>输入任务详情，包括预计完成时间和难度</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">任务标题</Label>
            <Input
              id="title"
              placeholder="输入任务标题"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="discipline">学科领域</Label>
            <Select value={newTask.discipline} onValueChange={(value) => setNewTask({ ...newTask, discipline: value })}>
              <SelectTrigger id="discipline">
                <SelectValue placeholder="选择学科" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">通用</SelectItem>
                <SelectItem value="mathematics">数学</SelectItem>
                <SelectItem value="science">科学</SelectItem>
                <SelectItem value="humanities">人文</SelectItem>
                <SelectItem value="languages">语言</SelectItem>
                <SelectItem value="arts">艺术</SelectItem>
                <SelectItem value="programming">编程</SelectItem>
                <SelectItem value="research">研究</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <div className="flex justify-between">
              <Label htmlFor="estimatedTime">预计时间（分钟）</Label>
              <span className="text-sm text-muted-foreground">{newTask.estimatedMinutes} 分钟</span>
            </div>
            <Input
              id="estimatedTime"
              type="number"
              min={5}
              max={180}
              value={newTask.estimatedMinutes}
              onChange={(e) => setNewTask({ ...newTask, estimatedMinutes: Number.parseInt(e.target.value) || 30 })}
            />
          </div>

          <div className="grid gap-2">
            <div className="flex justify-between">
              <Label htmlFor="difficulty">难度 (1-5)</Label>
              <span className="text-sm text-muted-foreground">{newTask.difficulty}</span>
            </div>
            <Slider
              id="difficulty"
              min={1}
              max={5}
              step={1}
              value={[newTask.difficulty]}
              onValueChange={(value) => setNewTask({ ...newTask, difficulty: value[0] })}
            />
          </div>

          <div className="grid gap-2">
            <div className="flex justify-between">
              <Label htmlFor="priority">优先级 (1-5)</Label>
              <span className="text-sm text-muted-foreground">{newTask.priority}</span>
            </div>
            <Slider
              id="priority"
              min={1}
              max={5}
              step={1}
              value={[newTask.priority]}
              onValueChange={(value) => setNewTask({ ...newTask, priority: value[0] })}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddTask} className="w-full">
            添加任务
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">任务列表</h3>
          {tasks.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  清除所有任务
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认清除所有任务</AlertDialogTitle>
                  <AlertDialogDescription>此操作将删除所有任务和日程安排。此操作无法撤销。</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={clearAllTasks}>确认清除</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {tasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">暂无添加任务</p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <Card key={task.id} className={task.completed ? "opacity-70" : ""}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTaskCompletion(task.id)}
                      className="mt-1 text-primary hover:text-primary/80 transition-colors"
                    >
                      {task.completed ? <CheckCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                    </button>
                    <div>
                      <h4 className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </h4>
                      <div className="text-sm text-muted-foreground">
                        {task.estimatedMinutes} 分钟 • {getDisciplineName(task.discipline)} • 难度: {task.difficulty} •
                        优先级: {task.priority}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeTask(task.id)}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
