import { Order, OrderStep, OrderStatus, BindingStepItem, VerifyRecordItem, RiskWarning } from '@/types';
import { mockAccounts, getAccountById } from './accounts';
import { mockUsers, currentUser } from './users';
import { formatCountdown } from '@/utils/format';

const createSteps = (currentStatus: OrderStatus): OrderStep[] => {
  const allSteps: { key: OrderStatus; title: string; description: string }[] = [
    { key: 'pending_payment', title: '下单', description: '买家下单，冻结担保金' },
    { key: 'pending_verify', title: '付款完成', description: '买家付款成功，等待卖家提交账号' },
    { key: 'verifying', title: '平台验号', description: '平台验号师核对账号信息' },
    { key: 'verify_done', title: '验号完成', description: '验号报告已生成，等待买家确认' },
    { key: 'pending_binding', title: '协助换绑', description: '买卖双方完成账号换绑' },
    { key: 'binding', title: '换绑确认', description: '买家确认换绑成功' },
    { key: 'completed', title: '交易完成', description: '平台放款，交易结束' },
  ];
  const stepOrder: OrderStatus[] = [
    'pending_payment', 'pending_verify', 'verifying', 'verify_done',
    'pending_binding', 'binding', 'completed'
  ];
  const currentIndex = stepOrder.indexOf(currentStatus);
  return allSteps.map((step, i) => ({
    ...step,
    status: i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'pending',
    time: i < currentIndex ? `2024-06-${10 + i} 1${i}:00:00` : undefined,
  }));
};

const getCurrentStep = (status: OrderStatus): OrderStep => {
  const steps = createSteps(status);
  return steps.find(s => s.status === 'current') || steps[steps.length - 1];
};

const createBindingSteps = (progress: number): BindingStepItem[] => {
  const raw: { id: string; title: string; description: string; tips: string; status: 'pending' | 'doing' | 'done' }[] = [
    { id: 'b1', title: '获取账号信息', description: '平台向卖家获取账号密码及绑定信息', tips: '请确保卖家已提交完整账号资料', status: progress > 0 ? 'done' : 'pending' },
    { id: 'b2', title: '验证账号可登录', description: '平台验证账号可正常登录，确认无封号风险', tips: '如登录异常将立即中止交易并退款', status: progress > 1 ? 'done' : progress === 1 ? 'doing' : 'pending' },
    { id: 'b3', title: '更换绑定手机', description: '卖家协助解绑原手机，买家绑定新手机号', tips: '换绑后有24小时审核期，请耐心等待', status: progress > 2 ? 'done' : progress === 2 ? 'doing' : 'pending' },
    { id: 'b4', title: '更换密保信息', description: '更换密保问题、邮箱等安全信息', tips: '请妥善保管新的密保信息', status: progress > 3 ? 'done' : progress === 3 ? 'doing' : 'pending' },
    { id: 'b5', title: '买家确认接手', description: '买家登录验证，确认账号完整可用', tips: '确认后将无法撤回，建议仔细核对', status: progress > 4 ? 'done' : 'pending' },
  ];
  return raw.map(r => ({
    ...r,
    tip: r.tips,
    completed: r.status === 'done',
  }));
};

const createVerifyRecords = (count: number, seed: string): VerifyRecordItem[] => {
  const raw: Omit<VerifyRecordItem, 'image'>[] = [
    { id: 'vr1', itemName: '验号启动', operator: '系统', time: '2024-06-16 10:00:00', description: '验号师接手账号验号工作', passed: true, warning: false },
    { id: 'vr2', itemName: '登录验证', operator: '验号师-小王', time: '2024-06-16 10:05:00', description: '使用账号密码登录成功，验证账号可正常访问', screenshot: `https://picsum.photos/seed/${seed}_vr1/750/500`, passed: true, warning: false },
    { id: 'vr3', itemName: '段位/等级验证', operator: '验号师-小王', time: '2024-06-16 10:08:00', description: '段位与描述一致 ✅', screenshot: `https://picsum.photos/seed/${seed}_vr2/750/500`, passed: true, warning: false },
    { id: 'vr4', itemName: '资产数量核验', operator: '验号师-小王', time: '2024-06-16 10:12:00', description: '英雄/皮肤数量与描述一致 ✅', screenshot: `https://picsum.photos/seed/${seed}_vr3/750/500`, passed: true, warning: false },
    { id: 'vr5', itemName: '贵重物品核验', operator: '验号师-小王', time: '2024-06-16 10:20:00', description: '稀有物品逐项核对完成 ✅', screenshot: `https://picsum.photos/seed/${seed}_vr4/750/500`, passed: true, warning: false },
    { id: 'vr6', itemName: '验号完成', operator: '验号师-小王', time: '2024-06-16 10:25:00', description: '账号信息与卖家描述完全一致，风险评估：低风险，建议买家放心购买', passed: true, warning: false, note: '账号密保手机需买家配合换绑' },
  ];
  return raw.slice(0, count).map(r => ({
    ...r,
    image: r.screenshot || `https://picsum.photos/seed/${seed}_${r.id}/750/500`,
  }));
};

const createRiskWarning = (days: number): RiskWarning => ({
  title: '售后保障期内',
  remainingDays: days,
  tips: [
    { icon: '🛡️', text: `还剩${days}天平台找回包赔保障` },
    { icon: '⚠️', text: '如遇账号找回、封禁、密码错误请立即申诉' },
    { icon: '📞', text: '申诉通道：个人中心 → 我的申诉' },
  ],
});

type OrderInput = {
  id: string;
  orderNo: string;
  accountId: string;
  buyerId: string;
  sellerId: string;
  finalPrice: number;
  serviceFeeRate?: number;
  status: OrderStatus;
  createTime: string;
  payTime?: string;
  verifyStartTime?: string;
  verifyEndTime?: string;
  completeTime?: string;
  deadlineTime: string;
  countdownSeconds: number;
  isNegotiated: boolean;
  negotiatedPrice?: number;
  bindingProgress: number;
  verifyRecordCount: number;
  protectionDays?: number;
  protectionEndTime?: string;
  hasRisk?: boolean;
};

const buildOrder = (input: OrderInput): Order => {
  const account = getAccountById(input.accountId) || mockAccounts[0];
  const buyer = input.buyerId === 'current' ? currentUser : (mockUsers.find(u => u.id === input.buyerId) || currentUser);
  const seller = input.sellerId === 'current' ? currentUser : (mockUsers.find(u => u.id === input.sellerId) || mockUsers[0]);
  const serviceFee = input.serviceFeeRate ? Math.round(input.finalPrice * input.serviceFeeRate) : Math.round(input.finalPrice * 0.05);
  const totalAmount = input.finalPrice + serviceFee;
  const steps = createSteps(input.status);
  const currentStep = steps.find(s => s.status === 'current') || steps[steps.length - 1];

  return {
    id: input.id,
    orderNo: input.orderNo,
    accountId: input.accountId,
    account,
    buyerId: input.buyerId,
    buyer,
    sellerId: input.sellerId,
    seller,
    finalPrice: input.finalPrice,
    price: input.finalPrice,
    serviceFee,
    totalAmount,
    status: input.status,
    currentStepKey: input.status,
    currentStep,
    steps,
    createTime: input.createTime,
    createdAt: input.createTime,
    payTime: input.payTime,
    verifyStartTime: input.verifyStartTime,
    verifyEndTime: input.verifyEndTime,
    completeTime: input.completeTime,
    deadlineTime: input.deadlineTime,
    countdownSeconds: input.countdownSeconds,
    countdown: formatCountdown(input.countdownSeconds),
    isNegotiated: input.isNegotiated,
    negotiated: input.isNegotiated,
    negotiatedPrice: input.negotiatedPrice,
    bindingGuide: createBindingSteps(input.bindingProgress),
    verifyRecords: createVerifyRecords(input.verifyRecordCount, input.id),
    protectionEndTime: input.protectionEndTime,
    hasRiskWarning: !!input.hasRisk,
    riskWarningMessage: input.hasRisk ? '检测到该账号原绑定手机号有异常登录记录，请在保障期内留意账号安全' : undefined,
    riskWarning: input.protectionDays ? createRiskWarning(input.protectionDays) : undefined,
  };
};

export const mockOrders: Order[] = [
  buildOrder({
    id: 'o1',
    orderNo: 'GX2024061600001',
    accountId: 'a1',
    buyerId: 'current',
    sellerId: 'u1',
    finalPrice: 12500,
    status: 'verify_done',
    createTime: '2024-06-16 09:30:00',
    payTime: '2024-06-16 09:35:00',
    verifyStartTime: '2024-06-16 10:00:00',
    verifyEndTime: '2024-06-16 10:25:00',
    deadlineTime: '2024-06-17 10:25:00',
    countdownSeconds: 84600,
    isNegotiated: true,
    negotiatedPrice: 12500,
    bindingProgress: 0,
    verifyRecordCount: 6,
    protectionDays: 30,
    protectionEndTime: '2024-07-16 10:25:00',
  }),
  buildOrder({
    id: 'o2',
    orderNo: 'GX2024061500008',
    accountId: 'a2',
    buyerId: 'current',
    sellerId: 'u2',
    finalPrice: 5680,
    status: 'binding',
    createTime: '2024-06-15 14:00:00',
    payTime: '2024-06-15 14:05:00',
    verifyStartTime: '2024-06-15 14:30:00',
    verifyEndTime: '2024-06-15 15:00:00',
    deadlineTime: '2024-06-17 15:00:00',
    countdownSeconds: 60000,
    isNegotiated: false,
    bindingProgress: 3,
    verifyRecordCount: 4,
    protectionDays: 15,
    protectionEndTime: '2024-07-01 15:00:00',
  }),
  buildOrder({
    id: 'o3',
    orderNo: 'GX2024061000025',
    accountId: 'a5',
    buyerId: 'current',
    sellerId: 'u4',
    finalPrice: 650,
    status: 'completed',
    createTime: '2024-06-10 11:00:00',
    payTime: '2024-06-10 11:05:00',
    verifyStartTime: '2024-06-10 11:30:00',
    verifyEndTime: '2024-06-10 11:50:00',
    completeTime: '2024-06-11 16:00:00',
    deadlineTime: '2024-06-11 16:00:00',
    countdownSeconds: 0,
    isNegotiated: true,
    negotiatedPrice: 650,
    bindingProgress: 5,
    verifyRecordCount: 6,
    protectionDays: 7,
    protectionEndTime: '2024-06-18 16:00:00',
    hasRisk: true,
  }),
  buildOrder({
    id: 'o4',
    orderNo: 'GX2024061400012',
    accountId: 'a6',
    buyerId: 'u5',
    sellerId: 'current',
    finalPrice: 1280,
    status: 'verifying',
    createTime: '2024-06-14 20:00:00',
    payTime: '2024-06-14 20:10:00',
    verifyStartTime: '2024-06-16 14:00:00',
    deadlineTime: '2024-06-16 20:00:00',
    countdownSeconds: 7200,
    isNegotiated: false,
    bindingProgress: 0,
    verifyRecordCount: 2,
    protectionDays: 15,
  }),
];

export const orderStatusLabels: Record<OrderStatus, { label: string; color: string }> = {
  pending_payment: { label: '待付款', color: '#F59E0B' },
  pending_verify: { label: '待验号', color: '#3B82F6' },
  verifying: { label: '验号中', color: '#3B82F6' },
  verify_done: { label: '待确认', color: '#8B5CF6' },
  pending_binding: { label: '待换绑', color: '#F59E0B' },
  binding: { label: '换绑中', color: '#F59E0B' },
  completed: { label: '已完成', color: '#10B981' },
  guarantee: { label: '保障期', color: '#10B981' },
  appealing: { label: '申诉中', color: '#EF4444' },
  refunded: { label: '已退款', color: '#94A3B8' },
  cancelled: { label: '已取消', color: '#94A3B8' },
};

export const getOrderById = (id: string): Order | undefined => {
  return mockOrders.find(o => o.id === id);
};

export const getOrdersByUser = (userId: string, role: 'buyer' | 'seller' | 'all' = 'all'): Order[] => {
  return mockOrders.filter(o => {
    if (role === 'buyer') return o.buyerId === userId;
    if (role === 'seller') return o.sellerId === userId;
    return o.buyerId === userId || o.sellerId === userId;
  });
};
