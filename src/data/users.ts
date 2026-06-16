import { User } from '@/types';

const createDaysActive = (registerDateStr: string): number => {
  try {
    const reg = new Date(registerDateStr).getTime();
    const now = Date.now();
    return Math.max(1, Math.floor((now - reg) / (1000 * 60 * 60 * 24)));
  } catch {
    return 100;
  }
};

const avatarEmojis = ['🎮', '🏆', '⚔️', '🐱', '🦊', '🐶', '🐼', '🦁', '🐯', '🐸'];

const buildUser = (base: Partial<User> & Pick<User, 'id' | 'nickname' | 'creditLevel'>): User => {
  const creditScoreMap = { excellent: 96, good: 88, normal: 76, poor: 60 };
  const registerDate = base.registerDate || `2024-${String(Math.floor(Math.random() * 6) + 1).padStart(2, '0')}-15`;
  const totalDeals = base.totalDeals ?? Math.floor(Math.random() * 200);
  const successRate = base.successRate ?? 97 + Math.random() * 2.5;
  return {
    id: base.id,
    nickname: base.nickname,
    avatar: base.avatar || `https://picsum.photos/seed/u${base.id}/200/200`,
    avatarEmoji: base.avatarEmoji || avatarEmojis[parseInt(base.id.replace(/\D/g, '').slice(-1) || '0') % avatarEmojis.length],
    phone: base.phone || `138****${Math.floor(1000 + Math.random() * 9000)}`,
    isVerified: base.isVerified ?? true,
    realNameVerified: base.realNameVerified ?? base.isVerified ?? true,
    realName: base.realName,
    idCardLast4: base.idCardLast4,
    creditScore: base.creditScore ?? creditScoreMap[base.creditLevel],
    creditLevel: base.creditLevel,
    totalDeals,
    totalSales: base.totalSales ?? totalDeals,
    successRate: Math.round(successRate * 10) / 10,
    goodRate: Math.round(successRate),
    registerDate,
    daysActive: base.daysActive ?? createDaysActive(registerDate),
    isInBlacklist: base.isInBlacklist ?? false,
    reviewCount: base.reviewCount ?? Math.floor(totalDeals * 0.8),
  };
};

export const mockUsers: User[] = [
  buildUser({
    id: 'u1',
    nickname: '王者大神888',
    avatarEmoji: '🏆',
    isVerified: true,
    realName: '张*明',
    idCardLast4: '1234',
    creditLevel: 'excellent',
    creditScore: 98,
    totalDeals: 156,
    successRate: 99.4,
    registerDate: '2023-01-15',
  }),
  buildUser({
    id: 'u2',
    nickname: '游戏收藏家',
    avatarEmoji: '⚔️',
    isVerified: true,
    realName: '李*华',
    idCardLast4: '5678',
    creditLevel: 'excellent',
    creditScore: 95,
    totalDeals: 89,
    successRate: 98.9,
    registerDate: '2023-03-22',
  }),
  buildUser({
    id: 'u3',
    nickname: '佛系出号',
    avatarEmoji: '🍃',
    isVerified: true,
    realName: '王*强',
    idCardLast4: '9012',
    creditLevel: 'good',
    creditScore: 92,
    totalDeals: 34,
    successRate: 97.1,
    registerDate: '2023-05-10',
  }),
  buildUser({
    id: 'u4',
    nickname: '新手玩家001',
    avatarEmoji: '🐱',
    isVerified: false,
    creditLevel: 'normal',
    creditScore: 80,
    totalDeals: 5,
    successRate: 100,
    registerDate: '2024-01-05',
  }),
  buildUser({
    id: 'u5',
    nickname: '皮肤收藏家',
    avatarEmoji: '💎',
    isVerified: true,
    realName: '陈*伟',
    idCardLast4: '3456',
    creditLevel: 'excellent',
    creditScore: 96,
    totalDeals: 67,
    successRate: 98.5,
    registerDate: '2023-08-18',
  }),
  buildUser({
    id: 'current',
    nickname: '我是买家',
    avatarEmoji: '🐶',
    isVerified: true,
    realName: '赵*阳',
    idCardLast4: '7890',
    creditLevel: 'good',
    creditScore: 90,
    totalDeals: 12,
    successRate: 100,
    registerDate: '2023-11-20',
  }),
];

export const currentUser: User = mockUsers[5];

export const creditLevelInfo = {
  excellent: { label: '极优', color: '#10B981', minScore: 95 },
  good: { label: '优秀', color: '#3B82F6', minScore: 85 },
  normal: { label: '良好', color: '#F59E0B', minScore: 70 },
  poor: { label: '较差', color: '#EF4444', minScore: 0 },
};

export const getUserById = (id: string): User | undefined =>
  mockUsers.find(u => u.id === id);
