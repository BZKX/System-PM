# DESIGN_init

## 1. 系统架构

### 整体架构 (Single Page Application)
```mermaid
graph TD
    User[用户] --> UI[Web UI (React)]
    UI --> Store[状态管理 (Zustand)]
    Store --> Logic[调度核心逻辑]
    Logic --> ConflictEngine[冲突检测引擎]
    Store --> Storage[持久化 (LocalStorage)]
```

## 2. 核心模块设计

### 2.1 数据模型
```typescript
// 系统定义
interface System {
  id: string;
  name: string;
  department: string; // 归属部门
  type: 'frontend' | 'backend';
}

// 阶段时间定义
interface Schedule {
  testStart: string;
  testEnd: string;
  innerGrayStart: string;
  innerGrayEnd: string;
  outerGrayStart: string;
  outerGrayEnd: string; // 冲突检测核心区间
  fullReleaseStart: string;
  fullReleaseEnd: string; // 冲突检测核心区间
}

// 上线计划
interface Plan {
  id: string;
  name: string;
  owner: string;
  systems: string[]; // 关联的 System ID 列表
  schedule: Schedule;
}
```

### 2.2 核心组件
1.  **Dashboard (主控台)**
    *   布局: 顶部工具栏 (新建/搜索)，中部可视化区域，侧边/弹窗详情。
2.  **TimelineChart (甘特图/时间线)**
    *   视图模式:
        *   **按系统查看 (Resource View)**: Y轴为系统，X轴为时间。这是查看冲突最直观的方式。
        *   **按计划查看 (Plan View)**: Y轴为计划，X轴为时间。
    *   功能: 缩放、拖拽(可选)、冲突高亮 (红色区域)。
3.  **PlanEditor (计划录入/编辑)**
    *   表单: 填写基本信息，选择关联系统 (多选)，设置各阶段时间段。
    *   实时校验: 在选择时间时即时调用冲突引擎检测。

### 2.3 冲突检测引擎 (ConflictEngine)
*   **输入**: 新计划 (NewPlan), 现有计划列表 (ExistingPlans)
*   **逻辑**:
    1. 提取 NewPlan 的 "占用区间" (Critical Interval): `[outerGrayStart, fullReleaseEnd]`
    2. 遍历 NewPlan.systems 中的每一个 `sysId`。
    3. 在 ExistingPlans 中查找同样包含 `sysId` 的计划。
    4. 检查这些计划的 Critical Interval 是否与 NewPlan 的区间重叠。
    5. **输出**: 冲突列表 `{ systemId, conflictingPlanId, timeOverlap }`。

## 3. 技术栈选型
*   **Framework**: React 18 + Vite
*   **Language**: TypeScript
*   **UI Library**: Ant Design (Table, DatePicker, Form, Timeline) + Tailwind CSS (Layout)
*   **Chart/Visualization**: `antd-gantt` (如果可用) 或者基于 `div` + `flex` 手写简易时间轴，或者 `vis-timeline` / `react-calendar-timeline`。为了轻量和定制，推荐使用 **CSS Grid/Flex 手写简易甘特图** 或 **vis-timeline**。考虑到"高效明确的可视化UI"，我们将使用 **vis-timeline** 的 React 封装或直接手写 SVG/Canvas 渲染，或者使用 Ant Design 的组件组合。
    *   *决策*: 鉴于需求主要是展示，使用 **Tailwind CSS Grid** 实现一个自定义的轻量级时间轴组件可能更可控且美观。
*   **State Management**: Zustand (轻量，易于实现逻辑分离)
*   **Date Lib**: Day.js

## 4. 接口规范 (Local Service)
*   `PlanService.getAll()`
*   `PlanService.add(plan)`
*   `PlanService.update(plan)`
*   `SystemService.getAll()`
*   `ConflictService.check(plan, allPlans)`

