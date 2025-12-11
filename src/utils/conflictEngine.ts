import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { Plan, System, Conflict } from '../types';

dayjs.extend(isBetween);

/**
 * 检查两个时间段是否重叠
 * @param start1
 * @param end1
 * @param start2
 * @param end2
 */
const isOverlapping = (start1: string, end1: string, start2: string, end2: string) => {
  const s1 = dayjs(start1);
  const e1 = dayjs(end1);
  const s2 = dayjs(start2);
  const e2 = dayjs(end2);

  // 简单的区间重叠判断: start1 < end2 && start2 < end1
  return s1.isBefore(e2) && s2.isBefore(e1);
};

/**
 * 冲突检测引擎
 * 规则：在 外灰 及 全网 期间，同一系统不可被多个计划同时占用。
 */
export class ConflictEngine {
  /**
   * 检查新计划是否与现有计划冲突
   * @param newPlan 待检查的计划
   * @param existingPlans 已存在的计划列表
   * @param systems 系统列表（用于获取系统名称）
   * @returns 冲突列表
   */
  static checkConflicts(newPlan: Plan, existingPlans: Plan[], systems: System[]): Conflict[] {
    // 复用通用的检查逻辑
    return this.checkAvailability(
        newPlan.systems,
        newPlan.schedule.outerGrayStart,
        newPlan.schedule.fullReleaseEnd,
        existingPlans,
        systems,
        newPlan.id
    );
  }

  /**
   * 通用可用性检查 (用于快速查询)
   * @param systemIds 待检查的系统ID列表
   * @param checkStart 检查开始时间
   * @param checkEnd 检查结束时间
   * @param existingPlans 现有计划列表
   * @param systems 系统元数据
   * @param excludePlanId 排除的计划ID (编辑模式下排除自身)
   */
  static checkAvailability(
    systemIds: string[], 
    checkStart: string, 
    checkEnd: string, 
    existingPlans: Plan[], 
    systems: System[],
    excludePlanId?: string
  ): Conflict[] {
    const conflicts: Conflict[] = [];
    const systemMap = new Map(systems.map(s => [s.id, s]));

    if (!checkStart || !checkEnd) return [];

    existingPlans.forEach(existingPlan => {
      // 跳过排除的计划
      if (excludePlanId && existingPlan.id === excludePlanId) return;

      const existingStart = existingPlan.schedule.outerGrayStart;
      const existingEnd = existingPlan.schedule.fullReleaseEnd;

      if (!existingStart || !existingEnd) return;

      // 检查时间是否重叠
      if (isOverlapping(checkStart, checkEnd, existingStart, existingEnd)) {
        // 如果时间重叠，检查是否有共同的系统
        const commonSystems = systemIds.filter(sysId => existingPlan.systems.includes(sysId));

        commonSystems.forEach(sysId => {
          const system = systemMap.get(sysId);
          conflicts.push({
            systemId: sysId,
            systemName: system ? system.name : 'Unknown System',
            conflictingPlanId: existingPlan.id,
            conflictingPlanName: existingPlan.name,
            conflictType: 'outerGray', // 统称为关键期冲突
            startDate: existingStart,
            endDate: existingEnd,
          });
        });
      }
    });

    return conflicts;
  }
}
