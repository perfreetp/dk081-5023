import { Order, OrderStep, OrderStatus, BindingStep, VerifyRecord } from '@/types';
import { mockAccounts, getAccountById } from './accounts';
import { mockUsers, currentUser } from './users';

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

const createBindingSteps = (progress: number): BindingStep[] => [
  { id: 'b1', title: '获取账号信息', description: '平台向卖家获取账号密码及绑定信息', tips: '请确保卖家已提交完整账号资料', status: progress > 0 ? 'done' : 'pending' },
  { id: 'b2', title: '验证账号可登录', description: '平台验证账号可正常登录，确认无封号风险', tips: '如登录异常将立即中止交易并退款', status: progress > 1 ? 'done' : progress === 1 ? 'doing' : 'pending' },
  { id: 'b3', title: '更换绑定手机', description: '卖家协助解绑原手机，买家绑定新手机号', tips: '换绑后有24小时审核期，请耐心等待', status: progress > 2 ? 'done' : progress === 2 ? 'doing' : 'pending' },
  { id: 'b4', title: '更换密保信息', description: '更换密保问题、邮箱等安全信息', tips: '请妥善保管新的密保信息', status: progress > 3 ? 'done' : progress === 3 ? 'doing' : 'pending' },
  { id: 'b5', title: '买家确认接手', description: '买家登录验证，确认账号完整可用', tips: '确认后将无法撤回，建议仔细核对', status: progress > 4 ? 'done' : 'pending' },
];

const createVerifyRecords = (count: number): VerifyRecord[] => {
  const records: VerifyRecord[] = [
    { id: 'vr1', operator: '系统', action: '验号开始', time: '2024-06-16 10:00:00', description: '验号师接手账号验号工作' },
    { id: 'vr2', operator: '验号师-小王', action: '登录验证', time: '2024-06-16 10:05:00', screenshot: 'https://picsum.photos/id/1/750/500', description: '使用账号密码登录成功，验证账号可正常访问' },
    { id: 'vr3', operator: '验号师-小王', action: '段位验证', time: '2024-06-16 10:08:00', screenshot: 'https://picsum.photos/id/2/750/500', description: '段位：荣耀王者 58星，与描述一致 ✅' },
    { id: 'vr4', operator: '验号师-小王', action: '英雄/皮肤数量', time: '2024-06-16 10:12:00', screenshot: 'https://picsum.photos/id/3/750/500', description: '英雄116个，皮肤428个，与描述一致 ✅' },
    { id: 'vr5', operator: '验号师-小王', action: '贵重物品核验', time: '2024-06-16 10:20:00', screenshot: 'https://picsum.photos/id/6/750/500', description: '荣耀水晶5个（武则天、天鹅之梦、大秦宣太后、星空梦想、杀手不太冷）✅ 星传说6个 ✅' },
    { id: 'vr6', operator: '验号师-小王', action: '验号完成', time: '2024-06-16 10:25:00', description: '账号信息与卖家描述完全一致，风险评估：低风险，建议买家放心购买' },
  ];
  return records.slice(0, count);
};

export const mockOrders: Order[] = [
  {
    id: 'o1',
    orderNo: 'GX2024061600001',
    accountId: 'a1',
    account: getAccountById('a1')!,
    buyerId: 'current',
    buyer: currentUser,
    sellerId: 'u1',
    seller: mockUsers[0],
    finalPrice: 12500,
    serviceFee: 625,
    totalAmount: 13125,
    status: 'verify_done',
    steps: createSteps('verify_done'),
    createTime: '2024-06-16 09:30:00',
    payTime: '2024-06-16 09:35:00',
    verifyStartTime: '2024-06-16 10:00:00',
    verifyEndTime: '2024-06-16 10:25:00',
    deadlineTime: '2024-06-17 10:25:00',
    countdownSeconds: 84600,
    isNegotiated: true,
    negotiatedPrice: 12500,
    bindingGuide: createBindingSteps(0),
    verifyRecords: createVerifyRecords(6),
    protectionEndTime: '2024-07-16 10:25:00',
  },
  {
    id: 'o2',
    orderNo: 'GX2024061500008',
    accountId: 'a2',
    account: getAccountById('a2')!,
    buyerId: 'current',
    buyer: currentUser,
    sellerId: 'u2',
    seller: mockUsers[1],
    finalPrice: 5680,
    serviceFee: 284,
    totalAmount: 5964,
    status: 'binding',
    steps: createSteps('binding'),
    createTime: '2024-06-15 14:00:00',
    payTime: '2024-06-15 14:05:00',
    verifyStartTime: '2024-06-15 14:30:00',
    verifyEndTime: '2024-06-15 15:00:00',
    deadlineTime: '2024-06-17 15:00:00',
    countdownSeconds: 60000,
    isNegotiated: false,
    bindingGuide: createBindingSteps(3),
    verifyRecords: createVerifyRecords(4),
    protectionEndTime: '2024-07-01 15:00:00',
  },
  {
    id: 'o3',
    orderNo: 'GX2024061000025',
    accountId: 'a5',
    account: getAccountById('a5')!,
    buyerId: 'current',
    buyer: currentUser,
    sellerId: 'u4',
    seller: mockUsers[3],
    finalPrice: 650,
    serviceFee: 32.5,
    totalAmount: 682.5,
    status: 'completed',
    steps: createSteps('completed'),
    createTime: '2024-06-10 11:00:00',
    payTime: '2024-06-10 11:05:00',
    verifyStartTime: '2024-06-10 11:30:00',
    verifyEndTime: '2024-06-10 11:50:00',
    completeTime: '2024-06-11 16:00:00',
    deadlineTime: '2024-06-11 16:00:00',
    countdownSeconds: 0,
    isNegotiated: true,
    negotiatedPrice: 650,
    bindingGuide: createBindingSteps(5),
    verifyRecords: createVerifyRecords(6),
    protectionEndTime: '2024-06-18 16:00:00',
    hasRiskWarning: true,
    riskWarningMessage: '检测到该账号原绑定手机号有异常登录记录，请在保障期内留意账号安全',
  },
  {
    id: 'o4',
    orderNo: 'GX2024061400012',
    accountId: 'a6',
    account: getAccountById('a6')!,
    buyerId: 'u5',
    buyer: mockUsers[4],
    sellerId: 'current',
    seller: currentUser,
    finalPrice: 1280,
    serviceFee: 64,
    totalAmount: 1216,
    status: 'verifying',
    steps: createSteps('verifying'),
    createTime: '2024-06-14 20:00:00',
    payTime: '2024-06-14 20:10:00',
    verifyStartTime: '2024-06-16 14:00:00',
    deadlineTime: '2024-06-16 20:00:00',
    countdownSeconds: 7200,
    isNegotiated: false,
    bindingGuide: createBindingSteps(0),
    verifyRecords: createVerifyRecords(2),
  },
];

export const orderStatusLabels: Record<OrderStatus, { label: string; color: string }> = {
  pending_payment: { label: '待付款', color: '#F59E0B' },
  pending_verify: { label: '待验号', color: '#3B82F6' },
  verifying: { label: '验号中', color: '#3B82F6' },
  verify_done: { label: '待确认', color: '#8B5CF6' },
  pending_binding: { label: '待换绑', color: '#F59E0B' },
  binding: { label: '换绑中', color: '#F59E0B' },
  completed: { label: '已完成', color: '#10B981' },
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
