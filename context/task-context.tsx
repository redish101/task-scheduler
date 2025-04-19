"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { Task, ScheduledTask, Settings } from "@/types/task"

interface TaskContextType {
  tasks: Task[]
  schedule: ScheduledTask[]
  currentTask: ScheduledTask | null
  breakDuration: number
  lastCompletedTask: Task | null
  settings: Settings
  isScheduleGenerated: boolean
  addTask: (task: Task) => void
  removeTask: (id: string) => void
  toggleTaskCompletion: (id: string) => void // 新增切换任务完成状态的方法
  clearAllTasks: () => void // 新增清除所有任务的方法
  generateSchedule: () => void
  completeCurrentTask: (actualMinutes: number) => void
  updateSettings: (newSettings: Settings) => void
  resetSettings: () => void
}

const defaultSettings: Settings = {
  attentionModel: {
    morningPeak: 85,
    afternoonDip: 60,
    eveningRecovery: 75,
  },
  scheduling: {
    difficultyWeight: 1.2,
    priorityWeight: 1.5,
    adaptiveScheduling: true,
    alternateTaskDifficulty: true,
  },
  breaks: {
    baseBreakDuration: 5,
    difficultyMultiplier: 1.2,
    overrunMultiplier: 0.5,
    maxBreakDuration: 15,
  },
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [schedule, setSchedule] = useState<ScheduledTask[]>([])
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0)
  const [breakDuration, setBreakDuration] = useState<number>(5 * 60) // 以秒为单位
  const [lastCompletedTask, setLastCompletedTask] = useState<Task | null>(null)
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isScheduleGenerated, setIsScheduleGenerated] = useState<boolean>(false)

  // 从localStorage加载数据
  useEffect(() => {
    const loadFromLocalStorage = () => {
      try {
        // 加载任务
        const savedTasks = localStorage.getItem("tasks")
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks))
        }

        // 加载设置
        const savedSettings = localStorage.getItem("settings")
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings))
        }

        // 加载日程安排
        const savedSchedule = localStorage.getItem("schedule")
        if (savedSchedule) {
          // 需要将日期字符串转换回Date对象
          const parsedSchedule = JSON.parse(savedSchedule)
          const restoredSchedule = parsedSchedule.map((item: any) => ({
            ...item,
            startTime: new Date(item.startTime),
            endTime: new Date(item.endTime),
          }))
          setSchedule(restoredSchedule)
          setIsScheduleGenerated(true)
        }
      } catch (error) {
        console.error("从localStorage加载数据时出错:", error)
      }
    }

    loadFromLocalStorage()
  }, [])

  // 保存数据到localStorage
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("tasks", JSON.stringify(tasks))
    }
  }, [tasks])

  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    if (schedule.length > 0) {
      localStorage.setItem("schedule", JSON.stringify(schedule))
    }
  }, [schedule])

  const addTask = useCallback((task: Task) => {
    setTasks((prev) => [...prev, task])
    setIsScheduleGenerated(false)
  }, [])

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
    setIsScheduleGenerated(false)
  }, [])

  // 切换任务完成状态
  const toggleTaskCompletion = useCallback((id: string) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }, [])

  // 清除所有任务
  const clearAllTasks = useCallback(() => {
    setTasks([])
    setSchedule([])
    setIsScheduleGenerated(false)
    localStorage.removeItem("tasks")
    localStorage.removeItem("schedule")
  }, [])

  const generateSchedule = useCallback(() => {
    if (tasks.length === 0) return

    // 首先按优先级和难度对任务进行初步排序
    // 只考虑未完成的任务进行调度
    const activeTasks = tasks.filter((task) => !task.completed)

    if (activeTasks.length === 0) return

    const initialSortedTasks = [...activeTasks].sort((a, b) => {
      const priorityScore = (b.priority - a.priority) * settings.scheduling.priorityWeight
      const difficultyScore = (b.difficulty - a.difficulty) * settings.scheduling.difficultyWeight
      return priorityScore + difficultyScore
    })

    let sortedTasks = [...initialSortedTasks]

    // 如果启用了任务难度交替功能
    if (settings.scheduling.alternateTaskDifficulty) {
      // 将任务分为高难度和低难度两组
      const highDifficultyTasks = initialSortedTasks.filter((task) => task.difficulty >= 4)
      const mediumDifficultyTasks = initialSortedTasks.filter((task) => task.difficulty === 3)
      const lowDifficultyTasks = initialSortedTasks.filter((task) => task.difficulty <= 2)

      // 重新组织任务顺序，尝试交替安排高难度和低难度任务
      sortedTasks = []

      // 如果有高难度任务，先从高难度开始
      if (highDifficultyTasks.length > 0) {
        // 确定每组任务的最大数量
        const maxTasks = Math.max(highDifficultyTasks.length, mediumDifficultyTasks.length, lowDifficultyTasks.length)

        // 交替添加不同难度的任务
        for (let i = 0; i < maxTasks; i++) {
          // 添加高难度任务
          if (i < highDifficultyTasks.length) {
            sortedTasks.push(highDifficultyTasks[i])
          }

          // 添加低难度任务作为"休息"
          if (i < lowDifficultyTasks.length) {
            sortedTasks.push(lowDifficultyTasks[i])
          }

          // 添加中等难度任务
          if (i < mediumDifficultyTasks.length) {
            sortedTasks.push(mediumDifficultyTasks[i])
          }
        }
      } else {
        // 如果没有高难度任务，则交替安排中等和低难度任务
        const maxTasks = Math.max(mediumDifficultyTasks.length, lowDifficultyTasks.length)

        for (let i = 0; i < maxTasks; i++) {
          if (i < mediumDifficultyTasks.length) {
            sortedTasks.push(mediumDifficultyTasks[i])
          }

          if (i < lowDifficultyTasks.length) {
            sortedTasks.push(lowDifficultyTasks[i])
          }
        }
      }
    }

    // 获取当前时间并四舍五入到最近的15分钟
    const now = new Date()
    now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15)
    now.setSeconds(0)
    now.setMilliseconds(0)

    let currentTime = now
    const scheduledTasks: ScheduledTask[] = []

    // 安排每个任务
    sortedTasks.forEach((task) => {
      // 应用注意力模型调整任务持续时间
      const hourOfDay = currentTime.getHours() + currentTime.getMinutes() / 60

      // 基于一天中的时间的简单注意力模型
      let attentionFactor = 1.0

      if (hourOfDay >= 8 && hourOfDay < 11) {
        // 上午高峰期 (8点-11点)
        attentionFactor = settings.attentionModel.morningPeak / 100
      } else if (hourOfDay >= 13 && hourOfDay < 15) {
        // 下午低谷 (13点-15点)
        attentionFactor = settings.attentionModel.afternoonDip / 100
      } else if (hourOfDay >= 17 && hourOfDay < 20) {
        // 晚间恢复 (17点-20点)
        attentionFactor = settings.attentionModel.eveningRecovery / 100
      } else if (hourOfDay < 6 || hourOfDay >= 22) {
        // 深夜/凌晨 (22点-6点)
        attentionFactor = 0.7
      }

      // 根据注意力因子和难度调整任务持续时间
      const adjustedDuration = Math.ceil((task.estimatedMinutes / attentionFactor) * (1 + (task.difficulty - 3) * 0.1))

      // 创建结束时间
      const endTime = new Date(currentTime)
      endTime.setMinutes(endTime.getMinutes() + adjustedDuration)

      // 添加到已安排任务
      scheduledTasks.push({
        task,
        startTime: new Date(currentTime),
        endTime,
        completed: false,
      })

      // 在任务之间添加5分钟休息
      currentTime = new Date(endTime)
      currentTime.setMinutes(currentTime.getMinutes() + 5)
    })

    setSchedule(scheduledTasks)
    setCurrentTaskIndex(0)
    setIsScheduleGenerated(true)
  }, [tasks, settings])

  const completeCurrentTask = useCallback(
    (actualMinutes: number) => {
      if (currentTaskIndex >= schedule.length) return

      const task = schedule[currentTaskIndex].task
      setLastCompletedTask(task)

      // 将当前任务标记为已完成
      const updatedSchedule = [...schedule]
      updatedSchedule[currentTaskIndex].completed = true
      setSchedule(updatedSchedule)

      // 同时更新任务列表中的完成状态
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: true } : t)))

      // 根据任务难度和实际时间计算休息时间
      const estimatedMinutes = task.estimatedMinutes
      const difficultyFactor = 1 + ((task.difficulty - 1) / 4) * settings.breaks.difficultyMultiplier

      // 计算超时因子（比预计时间长多少）
      const overrunFactor =
        actualMinutes > estimatedMinutes
          ? 1 + ((actualMinutes - estimatedMinutes) / estimatedMinutes) * settings.breaks.overrunMultiplier
          : 1

      // 计算休息时间（以秒为单位）
      let calculatedBreakDuration = Math.round(
        settings.breaks.baseBreakDuration * difficultyFactor * overrunFactor * 60,
      )

      // 限制最大休息时间
      calculatedBreakDuration = Math.min(calculatedBreakDuration, settings.breaks.maxBreakDuration * 60)

      setBreakDuration(calculatedBreakDuration)

      // 移至下一个任务
      setCurrentTaskIndex((prev) => prev + 1)

      // 如果启用了自适应调度，调整剩余任务的时间安排
      if (settings.scheduling.adaptiveScheduling && currentTaskIndex < schedule.length - 1) {
        const timeOverrun = actualMinutes - estimatedMinutes

        if (timeOverrun > 0) {
          const adjustedSchedule = [...updatedSchedule]

          // 调整所有未来任务
          for (let i = currentTaskIndex + 1; i < adjustedSchedule.length; i++) {
            const task = adjustedSchedule[i]

            // 移动开始和结束时间
            task.startTime = new Date(task.startTime.getTime() + timeOverrun * 60000)
            task.endTime = new Date(task.endTime.getTime() + timeOverrun * 60000)
          }

          setSchedule(adjustedSchedule)
        }
      }
    },
    [currentTaskIndex, schedule, settings],
  )

  const updateSettings = useCallback((newSettings: Settings) => {
    setSettings(newSettings)
    setIsScheduleGenerated(false)
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings)
    setIsScheduleGenerated(false)
  }, [])

  return (
    <TaskContext.Provider
      value={{
        tasks,
        schedule,
        currentTask: schedule[currentTaskIndex] || null,
        breakDuration,
        lastCompletedTask,
        settings,
        isScheduleGenerated,
        addTask,
        removeTask,
        toggleTaskCompletion,
        clearAllTasks,
        generateSchedule,
        completeCurrentTask,
        updateSettings,
        resetSettings,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTaskContext() {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error("useTaskContext必须在TaskProvider内部使用")
  }
  return context
}
