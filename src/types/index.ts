export type SystemType = 'frontend' | 'backend';

/**
 * 系统定义
 */
export interface System {
  id: string;
  name: string;
  department: string;
  type: SystemType;
  owner?: string; // 系统负责人
}

/**
 * 上线计划的时间安排
 */
export interface Schedule {
  testStart: string; // ISO 8601 date string
  testEnd: string;
  innerGrayStart: string;
  innerGrayEnd: string;
  outerGrayStart: string;
  outerGrayEnd: string;
  fullReleaseStart: string;
  fullReleaseEnd: string;
}

/**
 * 上线计划
 */
export interface Plan {
  id: string;
  name: string;
  owner: string;
  systems: string[]; // List of System IDs
  schedule: Schedule;
}

/**
 * 冲突检测结果
 */
export interface Conflict {
  systemId: string;
  systemName: string;
  conflictingPlanId: string;
  conflictingPlanName: string;
  conflictType: 'outerGray' | 'fullRelease';
  startDate: string;
  endDate: string;
}
