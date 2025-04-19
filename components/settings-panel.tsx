"use client"

import { useTaskContext } from "@/context/task-context"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AttentionModelChart } from "@/components/attention-model-chart"

export function SettingsPanel() {
  const { settings, updateSettings, resetSettings } = useTaskContext()

  return (
    <div className="space-y-6 py-4">
      <Tabs defaultValue="attention">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="attention">注意力模型</TabsTrigger>
          <TabsTrigger value="scheduling">调度</TabsTrigger>
          <TabsTrigger value="breaks">休息</TabsTrigger>
        </TabsList>

        <TabsContent value="attention" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>注意力模型</CardTitle>
              <CardDescription>配置您一天中注意力水平的变化</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-64">
                <AttentionModelChart
                  morningPeak={settings.attentionModel.morningPeak}
                  afternoonDip={settings.attentionModel.afternoonDip}
                  eveningRecovery={settings.attentionModel.eveningRecovery}
                />
              </div>

              <div className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <Label htmlFor="morningPeak">上午高峰</Label>
                    <span className="text-sm text-muted-foreground">{settings.attentionModel.morningPeak}%</span>
                  </div>
                  <Slider
                    id="morningPeak"
                    min={50}
                    max={100}
                    step={5}
                    value={[settings.attentionModel.morningPeak]}
                    onValueChange={(value) =>
                      updateSettings({
                        ...settings,
                        attentionModel: {
                          ...settings.attentionModel,
                          morningPeak: value[0],
                        },
                      })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <Label htmlFor="afternoonDip">下午低谷</Label>
                    <span className="text-sm text-muted-foreground">{settings.attentionModel.afternoonDip}%</span>
                  </div>
                  <Slider
                    id="afternoonDip"
                    min={30}
                    max={90}
                    step={5}
                    value={[settings.attentionModel.afternoonDip]}
                    onValueChange={(value) =>
                      updateSettings({
                        ...settings,
                        attentionModel: {
                          ...settings.attentionModel,
                          afternoonDip: value[0],
                        },
                      })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <Label htmlFor="eveningRecovery">晚间恢复</Label>
                    <span className="text-sm text-muted-foreground">{settings.attentionModel.eveningRecovery}%</span>
                  </div>
                  <Slider
                    id="eveningRecovery"
                    min={40}
                    max={95}
                    step={5}
                    value={[settings.attentionModel.eveningRecovery]}
                    onValueChange={(value) =>
                      updateSettings({
                        ...settings,
                        attentionModel: {
                          ...settings.attentionModel,
                          eveningRecovery: value[0],
                        },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduling" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>调度参数</CardTitle>
              <CardDescription>配置如何根据任务参数进行调度</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="difficultyWeight">难度权重</Label>
                  <span className="text-sm text-muted-foreground">{settings.scheduling.difficultyWeight}x</span>
                </div>
                <Slider
                  id="difficultyWeight"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[settings.scheduling.difficultyWeight]}
                  onValueChange={(value) =>
                    updateSettings({
                      ...settings,
                      scheduling: {
                        ...settings.scheduling,
                        difficultyWeight: value[0],
                      },
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">较高的值在调度中更重视任务难度</p>
              </div>

              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="priorityWeight">优先级权重</Label>
                  <span className="text-sm text-muted-foreground">{settings.scheduling.priorityWeight}x</span>
                </div>
                <Slider
                  id="priorityWeight"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[settings.scheduling.priorityWeight]}
                  onValueChange={(value) =>
                    updateSettings({
                      ...settings,
                      scheduling: {
                        ...settings.scheduling,
                        priorityWeight: value[0],
                      },
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">较高的值在调度中更重视任务优先级</p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="adaptiveScheduling"
                  checked={settings.scheduling.adaptiveScheduling}
                  onCheckedChange={(checked) =>
                    updateSettings({
                      ...settings,
                      scheduling: {
                        ...settings.scheduling,
                        adaptiveScheduling: checked,
                      },
                    })
                  }
                />
                <Label htmlFor="adaptiveScheduling">自适应调度</Label>
              </div>
              <p className="text-sm text-muted-foreground">根据您的表现自动调整未来的任务安排</p>

              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="alternateTaskDifficulty"
                  checked={settings.scheduling.alternateTaskDifficulty}
                  onCheckedChange={(checked) =>
                    updateSettings({
                      ...settings,
                      scheduling: {
                        ...settings.scheduling,
                        alternateTaskDifficulty: checked,
                      },
                    })
                  }
                />
                <Label htmlFor="alternateTaskDifficulty">交替任务难度</Label>
              </div>
              <p className="text-sm text-muted-foreground">在高难度任务后安排低难度任务，帮助放松和恢复精力</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breaks" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>休息参数</CardTitle>
              <CardDescription>配置任务之间的休息时间计算方式</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="baseBreakDuration">基础休息时长（分钟）</Label>
                  <span className="text-sm text-muted-foreground">{settings.breaks.baseBreakDuration} 分钟</span>
                </div>
                <Slider
                  id="baseBreakDuration"
                  min={1}
                  max={15}
                  step={1}
                  value={[settings.breaks.baseBreakDuration]}
                  onValueChange={(value) =>
                    updateSettings({
                      ...settings,
                      breaks: {
                        ...settings.breaks,
                        baseBreakDuration: value[0],
                      },
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="difficultyMultiplier">难度乘数</Label>
                  <span className="text-sm text-muted-foreground">{settings.breaks.difficultyMultiplier}x</span>
                </div>
                <Slider
                  id="difficultyMultiplier"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[settings.breaks.difficultyMultiplier]}
                  onValueChange={(value) =>
                    updateSettings({
                      ...settings,
                      breaks: {
                        ...settings.breaks,
                        difficultyMultiplier: value[0],
                      },
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">较高的值为困难任务提供更长的休息时间</p>
              </div>

              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="overrunMultiplier">超时乘数</Label>
                  <span className="text-sm text-muted-foreground">{settings.breaks.overrunMultiplier}x</span>
                </div>
                <Slider
                  id="overrunMultiplier"
                  min={0.1}
                  max={1}
                  step={0.1}
                  value={[settings.breaks.overrunMultiplier]}
                  onValueChange={(value) =>
                    updateSettings({
                      ...settings,
                      breaks: {
                        ...settings.breaks,
                        overrunMultiplier: value[0],
                      },
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">当任务超过预计时间时，额外休息时间的比例</p>
              </div>

              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="maxBreakDuration">最长休息时间（分钟）</Label>
                  <span className="text-sm text-muted-foreground">{settings.breaks.maxBreakDuration} 分钟</span>
                </div>
                <Slider
                  id="maxBreakDuration"
                  min={5}
                  max={30}
                  step={1}
                  value={[settings.breaks.maxBreakDuration]}
                  onValueChange={(value) =>
                    updateSettings({
                      ...settings,
                      breaks: {
                        ...settings.breaks,
                        maxBreakDuration: value[0],
                      },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button variant="outline" onClick={resetSettings}>
          恢复默认设置
        </Button>
      </div>
    </div>
  )
}
