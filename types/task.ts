export interface Task {
  id: string
  title: string
  estimatedMinutes: number
  discipline: string
  difficulty: number
  priority: number
  completed: boolean // 添加completed字段
}

export interface ScheduledTask {
  task: Task
  startTime: Date
  endTime: Date
  completed: boolean
}

export interface Settings {
  attentionModel: {
    morningPeak: number
    afternoonDip: number
    eveningRecovery: number
  }
  scheduling: {
    difficultyWeight: number
    priorityWeight: number
    adaptiveScheduling: boolean
    alternateTaskDifficulty: boolean
  }
  breaks: {
    baseBreakDuration: number
    difficultyMultiplier: number
    overrunMultiplier: number
    maxBreakDuration: number
  }
}
