import { System, Plan } from '../types';
import dayjs from 'dayjs';

const today = dayjs();

export const mockSystems: System[] = [
  { id: 'sys-1', name: '交易中心前端', department: '交易技术部', type: 'frontend' },
  { id: 'sys-2', name: '交易中心后端', department: '交易技术部', type: 'backend' },
  { id: 'sys-3', name: '用户中心前端', department: '用户增长部', type: 'frontend' },
  { id: 'sys-4', name: '用户中心后端', department: '用户增长部', type: 'backend' },
  { id: 'sys-5', name: '支付网关', department: '支付平台部', type: 'backend' },
];

export const mockPlans: Plan[] = [
  {
    id: 'plan-1',
    name: '双十一活动上线',
    owner: 'PM-Alice',
    systems: ['sys-1', 'sys-2', 'sys-5'],
    schedule: {
      testStart: today.subtract(5, 'day').format('YYYY-MM-DD'),
      testEnd: today.add(2, 'day').format('YYYY-MM-DD'),
      innerGrayStart: today.add(3, 'day').format('YYYY-MM-DD'),
      innerGrayEnd: today.add(5, 'day').format('YYYY-MM-DD'),
      outerGrayStart: today.add(6, 'day').format('YYYY-MM-DD'),
      outerGrayEnd: today.add(8, 'day').format('YYYY-MM-DD'),
      fullReleaseStart: today.add(9, 'day').format('YYYY-MM-DD'),
      fullReleaseEnd: today.add(10, 'day').format('YYYY-MM-DD'),
    }
  },
  {
    id: 'plan-2',
    name: '用户权益升级',
    owner: 'PM-Bob',
    systems: ['sys-3', 'sys-4'],
    schedule: {
      testStart: today.format('YYYY-MM-DD'),
      testEnd: today.add(7, 'day').format('YYYY-MM-DD'),
      innerGrayStart: today.add(8, 'day').format('YYYY-MM-DD'),
      innerGrayEnd: today.add(10, 'day').format('YYYY-MM-DD'),
      outerGrayStart: today.add(11, 'day').format('YYYY-MM-DD'),
      outerGrayEnd: today.add(13, 'day').format('YYYY-MM-DD'),
      fullReleaseStart: today.add(14, 'day').format('YYYY-MM-DD'),
      fullReleaseEnd: today.add(15, 'day').format('YYYY-MM-DD'),
    }
  }
];
