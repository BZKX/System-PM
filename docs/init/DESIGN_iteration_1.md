# DESIGN_iteration_1

## 1. 架构变更
架构主体不变，主要在 UI 层和 Utility 层增强。

## 2. 模块设计更新

### 2.1 TimelineView 组件增强
*   **Props**: 增加 `viewMode` (internal state).
*   **Plan View 逻辑**:
    *   Y轴: Plan Name.
    *   X轴: Time.
    *   Bar: 渲染该 Plan 的四个阶段 (Test -> Inner -> Outer -> Full)。
    *   *注意*: Plan View 下通常不展示冲突（因为一行就是一个 Plan），但可以用背景色或图标标记该 Plan 是否含有冲突资源。
*   **Quick Check Widget (快速查询)**:
    *   UI: DateRangePicker (只选外灰/全网时间), Select (Systems, multiple).
    *   Action: `checkConflict(systems, dateRange)`.
    *   Result: 如果冲突，列出冲突的 {PlanName, SystemName, Time}。

### 2.2 System Management 改造
*   **Component**: `SystemGrid` 替代 `SystemTable`.
*   **Card Layout**:
    *   Header: System Name + Type Icon/Tag.
    *   Body: Department.
    *   Footer: Edit/Delete Actions.

## 3. 接口/数据流
*   `useAppStore` 保持不变。
*   `ConflictEngine` 需要暴露一个纯函数用于 Quick Check，不依赖 Plan 实体，而是依赖 Systems 和 TimeRange。
    *   `checkConflictFree(systemIds: string[], start: string, end: string, excludePlanId?: string): ConflictResult[]`

## 4. UI 细节
*   **Plan Row**: 渲染一条连续的时间轴，不同颜色分段。
*   **Resource Row**: 保持现状（不同 Plan 的块散落在时间轴上）。
