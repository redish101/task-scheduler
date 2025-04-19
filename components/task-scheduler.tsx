"use client"

import { useState } from "react"
import { TaskInput } from "@/components/task-input"
import { ScheduleDisplay } from "@/components/schedule-display"
import { ActiveTaskView } from "@/components/active-task-view"
import { BreakTimer } from "@/components/break-timer"
import { SettingsPanel } from "@/components/settings-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskProvider } from "@/context/task-context"

export function TaskScheduler() {
  const [activeView, setActiveView] = useState<"setup" | "active" | "break">("setup")

  return (
    <TaskProvider>
      <div className="container mx-auto p-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-center my-6">动态任务调度器</h1>

        {activeView === "setup" && (
          <Tabs defaultValue="input" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="input">任务输入</TabsTrigger>
              <TabsTrigger value="schedule">日程安排</TabsTrigger>
              <TabsTrigger value="settings">设置</TabsTrigger>
            </TabsList>
            <TabsContent value="input">
              <TaskInput />
            </TabsContent>
            <TabsContent value="schedule">
              <ScheduleDisplay onStartSchedule={() => setActiveView("active")} />
            </TabsContent>
            <TabsContent value="settings">
              <SettingsPanel />
            </TabsContent>
          </Tabs>
        )}

        {activeView === "active" && (
          <ActiveTaskView onTaskComplete={() => setActiveView("break")} onExit={() => setActiveView("setup")} />
        )}

        {activeView === "break" && (
          <BreakTimer onBreakComplete={() => setActiveView("active")} onExit={() => setActiveView("setup")} />
        )}
      </div>
    </TaskProvider>
  )
}
