import { GameAccount, AccountTag, VerifyReport, VerifyReportItem } from '@/types';
import { mockUsers, getUserById } from './users';

const createTags = (
  items: { name: string; type?: AccountTag['type']; highlight?: boolean }[]
): AccountTag[] =>
  items.map((item, i) => ({
    id: `tag_${item.type || 'other'}_${i}_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    name: item.name,
    value: item.name,
    type: item.type || 'other',
    highlight: item.highlight ?? false,
  }));

const createVerifyItems = (account: {
  rank: string; heroCount?: number; skinCount?: number; rareItems?: string[];
}): VerifyReportItem[] => {
  const items: VerifyReportItem[] = [
    { id: 'vi1', name: '账号可正常登录', value: '正常', category: 'basic', passed: true, warning: false },
    { id: 'vi2', name: '账号状态', value: '无封禁/冻结', category: 'basic', passed: true, warning: false },
    { id: 'vi3', name: '防沉迷限制', value: '已成年', category: 'basic', passed: true, warning: false },
    { id: 'vi4', name: '当前段位', value: account.rank, category: 'basic', passed: true, warning: false },
    { id: 'vi5', name: '段位匹配度', value: '与描述一致', category: 'basic', passed: true, warning: false },
    { id: 'vi6', name: '异地登录风险', value: '已验证通过', category: 'basic', passed: true, warning: false },
  ];
  if (account.heroCount) {
    items.push({ id: 'vi7', name: '英雄数量', value: `${account.heroCount}个`, category: 'assets', passed: true, warning: false });
  }
  if (account.skinCount) {
    items.push({ id: 'vi8', name: '皮肤数量', value: `${account.skinCount}个`, category: 'assets', passed: true, warning: false });
  }
  if (account.rareItems && account.rareItems.length > 0) {
    items.push({
      id: 'vi9', name: '贵重物品', value: `${account.rareItems.length}件`, category: 'assets', passed: true, warning: false });
    items.push({
      id: 'vi10',
      name: '稀有物品核对',
      value: account.rareItems.slice(0, 2).join('、') + '等',
      category: 'assets',
      passed: true,
      warning: false,
    });
  }
  items.push(
    { id: 'vi11', name: '密保手机绑定状态', value: '已绑定', category: 'security', passed: true, warning: false },
    { id: 'vi12', name: '实名认证', value: '已实名(可换绑)', category: 'security', passed: true, warning: true, note: '需买家配合换绑' },
    { id: 'vi13', name: '邮箱绑定', value: '可更换', category: 'security', passed: true, warning: false },
    { id: 'vi14', name: '历史找回记录', value: '无', category: 'security', passed: true, warning: false },
    { id: 'vi15', name: '账号申诉记录', value: '无', category: 'security', passed: true, warning: false },
    { id: 'vi16', name: '交易风险评估', value: '低风险', category: 'security', passed: true, warning: false },
  );
  return items;
};

const buildVerifyReport = (account: Partial<GameAccount>, withScreenshots: boolean): VerifyReport => {
  const items = createVerifyItems(account);
  const warnCount = items.filter(i => i.warning).length;
  const score = Math.max(80 + Math.floor(Math.random() * 18));
  return {
    id: `v_${account.id}`,
    reportId: `VRP${Math.floor(Math.random() * 100000000)}`,
    accountId: account.id!,
    verifier: '平台验号师-' + ['小王', '小李', '小张'][Math.floor(Math.random() * 3)],
    verifyTime: `${Math.floor(Math.random() * 4) + 3}分${Math.floor(Math.random() * 50) + 10}秒`,
    levelMatched: true,
    itemsMatched: true,
    descriptionMatched: true,
    screenshots: withScreenshots
      ? [
          { id: 'ss1', url: `https://picsum.photos/seed/${account.id}_1/750/500`, description: '英雄/角色展示截图', uploadTime: '2024-06-10 15:30' },
          { id: 'ss2', url: `https://picsum.photos/seed/${account.id}_2/750/500`, description: '皮肤/背包展示截图', uploadTime: '2024-06-10 15:35' },
          { id: 'ss3', url: `https://picsum.photos/seed/${account.id}_3/750/500`, description: '段位/主页展示截图', uploadTime: '2024-06-10 15:40' },
        ]
      : [],
    notes:
      warnCount > 0
        ? '账号信息与描述基本一致，有少量需要注意的绑定项（如换绑提示），总体推荐购买。'
        : '账号信息与描述完全一致，各项指标正常，推荐放心购买。',
    riskLevel: warnCount > 1 ? 'medium' : 'low',
    score,
    totalItems: items.length,
    items,
  };
};

type AccountInput = {
  id: string;
  gameId: string;
  gameName: string;
  serverId: string;
  serverName: string;
  title: string;
  description: string;
  coverSeed: string;
  imageSeeds: string[];
  rank: string;
  rankLevel: number;
  tags: { name: string; type?: AccountTag['type']; highlight?: boolean }[];
  heroCount?: number;
  skinCount?: number;
  rareItems?: string[];
  price: number;
  originalPrice?: number;
  priceType: 'fixed' | 'negotiable';
  sellerId: string;
  status?: GameAccount['status'];
  viewCount?: number;
  favoriteCount?: number;
  chatCount?: number;
  dealCount?: number;
  publishTime?: string;
  withVerify?: boolean;
  canRefund?: boolean;
  protectionDays?: number;
};

const buildAccount = (input: AccountInput): GameAccount => {
  const seller = getUserById(input.sellerId) || mockUsers[0];
  const publishTime = input.publishTime || '2024-06-15 12:00';
  const base: GameAccount = {
    id: input.id,
    gameId: input.gameId,
    gameName: input.gameName,
    serverId: input.serverId,
    serverName: input.serverName,
    server: input.serverName,
    title: input.title,
    description: input.description,
    coverImage: `https://picsum.photos/seed/${input.coverSeed}/600/600`,
    images: input.imageSeeds.map(seed => `https://picsum.photos/seed/${seed}/900/600`),
    rank: input.rank,
    rankLevel: input.rankLevel,
    tags: createTags(input.tags),
    heroCount: input.heroCount,
    skinCount: input.skinCount,
    rareItems: input.rareItems,
    price: input.price,
    originalPrice: input.originalPrice,
    priceType: input.priceType,
    negotiable: input.priceType === 'negotiable',
    sellerId: input.sellerId,
    seller,
    status: input.status || 'on_sale',
    viewCount: input.viewCount || Math.floor(Math.random() * 5000) + 100,
    favoriteCount: input.favoriteCount || Math.floor(Math.random() * 500) + 10,
    chatCount: input.chatCount ?? Math.floor(Math.random() * 50) + 3,
    dealCount: input.dealCount ?? (input.status === 'sold' ? 1 : 0),
    publishTime,
    publishedAt: publishTime,
    canRefund: input.canRefund ?? true,
    protectionDays: input.protectionDays || 15,
  };
  if (input.withVerify) {
    base.verifyReport = buildVerifyReport(base, true);
  }
  return base;
};

export const mockAccounts: GameAccount[] = [
  buildAccount({
    id: 'a1',
    gameId: 'g1',
    gameName: '王者荣耀',
    serverId: 's1',
    serverName: '王者一区',
    title: 'V10满英雄满皮肤 五荣耀水晶 省级战队',
    description:
      '王者6年资深玩家号，全英雄116个，皮肤428个，包含5个荣耀水晶（武则天、天鹅之梦、大秦宣太后、星空梦想、杀手不太冷），星传说6个，赛季皮肤全收集。铭文300级全套，巅峰赛最高2350分，现段位王者58星。支持平台验号，绑定可协助更换，诚心出，拒绝屠龙刀。',
    coverSeed: 'wzry_v10',
    imageSeeds: ['wz1', 'wz2', 'wz3', 'wz4'],
    rank: '荣耀王者',
    rankLevel: 10,
    tags: [
      { name: 'V10贵族', type: 'other', highlight: true },
      { name: '5荣耀水晶', type: 'other', highlight: true },
      { name: '满英雄', highlight: true },
      { name: '428皮肤', type: 'skin' },
      { name: '6星传说', type: 'skin' },
      { name: '省级战队', type: 'rank', highlight: true },
      { name: '巅峰2350', type: 'rank', highlight: true },
    ],
    heroCount: 116,
    skinCount: 428,
    rareItems: ['武则天', '天鹅之梦', '大秦宣太后', '星空梦想', '杀手不太冷'],
    price: 12800,
    originalPrice: 15800,
    priceType: 'negotiable',
    sellerId: 'u1',
    viewCount: 3456,
    favoriteCount: 289,
    publishTime: '2024-06-10 14:30',
    withVerify: true,
    protectionDays: 30,
  }),
  buildAccount({
    id: 'a2',
    gameId: 'g2',
    gameName: '和平精英',
    serverId: 's5',
    serverName: 'QQ区',
    title: '战神号 3赛季印记 101套装 玛莎拉蒂载具',
    description:
      '和平精英QQ区账号，超级王牌以上印记3个，历史最高战神。套装101套，粉色套装包括火箭少女101、五曜套装、合金龙骨等。载具皮肤：玛莎拉蒂粉、特斯拉3、摩托皮肤3个。枪皮肤80+，升级枪5把满级。',
    coverSeed: 'hpjz_masarati',
    imageSeeds: ['hp1', 'hp2', 'hp3'],
    rank: '超级王牌',
    rankLevel: 9,
    tags: [
      { name: '战神印记', type: 'rank', highlight: true },
      { name: '3赛季王牌', type: 'rank', highlight: true },
      { name: '玛莎拉蒂', type: 'skin', highlight: true },
      { name: '火箭少女', type: 'skin', highlight: true },
      { name: '101套装', type: 'skin', highlight: true },
      { name: '5满级枪', type: 'equipment' },
    ],
    heroCount: 0,
    skinCount: 181,
    rareItems: ['玛莎拉蒂粉', '火箭少女101', '特斯拉Model3'],
    price: 5680,
    priceType: 'fixed',
    sellerId: 'u2',
    viewCount: 1892,
    favoriteCount: 156,
    publishTime: '2024-06-12 09:15',
  }),
  buildAccount({
    id: 'a3',
    gameId: 'g3',
    gameName: '原神',
    serverId: 's7',
    serverName: '天空岛',
    title: '60级满探索 全限定角色 专武毕业 深渊36星',
    description:
      '原神58级账号，冒险等级60，全部地图探索度100%。角色满命：胡桃、雷电将军、甘雨、温迪、钟离、神里绫华。专武：护摩之杖、薙草之稻光、阿莫斯之弓、终末嗟叹之诗、贯虹之槊、雾切之回光。全部限定角色都有，深渊稳定36星。',
    coverSeed: 'yuanshen_60',
    imageSeeds: ['ys1', 'ys2', 'ys3'],
    rank: '冒险等级60',
    rankLevel: 10,
    tags: [
      { name: '60级满级', type: 'rank', highlight: true },
      { name: '全限定角色', type: 'rank', highlight: true },
      { name: '6个满命', highlight: true },
      { name: '6把专武', highlight: true },
      { name: '全图100%探索', type: 'equipment' },
      { name: '深渊36星', type: 'equipment' },
    ],
    rareItems: ['胡桃满命+专武', '雷神满命+专武', '甘雨满命+专武'],
    price: 28500,
    originalPrice: 32000,
    priceType: 'negotiable',
    sellerId: 'u5',
    viewCount: 5678,
    favoriteCount: 623,
    publishTime: '2024-06-08 18:45',
    withVerify: true,
    protectionDays: 30,
  }),
  buildAccount({
    id: 'a4',
    gameId: 'g4',
    gameName: '英雄联盟',
    serverId: 's9',
    serverName: '艾欧尼亚',
    title: '大师500分 全英雄200+皮肤 限定多',
    description:
      'LOL艾欧尼亚账号，当前段位大师500+分，历史最高王者。全英雄164个，皮肤256个，限定包括龙瞎、龙刀、龙猴、勇敢的心诺手、花木兰锐雯、蛇年安妮、马年皎月等。至臻点还有200，海克斯宝石30个。',
    coverSeed: 'lol_dashi',
    imageSeeds: ['lol1', 'lol2'],
    rank: '大师',
    rankLevel: 9,
    tags: [
      { name: '大师500分', type: 'rank', highlight: true },
      { name: '历史王者', type: 'rank', highlight: true },
      { name: '龙瞎', type: 'skin', highlight: true },
      { name: '龙刀', type: 'skin', highlight: true },
      { name: '勇敢的心', type: 'skin', highlight: true },
      { name: '全英雄' },
      { name: '256皮肤' },
    ],
    heroCount: 164,
    skinCount: 256,
    rareItems: ['龙的传人李青', '龙年刀锋', '勇敢的心德莱厄斯'],
    price: 3200,
    priceType: 'fixed',
    sellerId: 'u3',
    viewCount: 956,
    favoriteCount: 78,
    publishTime: '2024-06-14 11:20',
  }),
  buildAccount({
    id: 'a5',
    gameId: 'g1',
    gameName: '王者荣耀',
    serverId: 's4',
    serverName: '全服通用',
    title: '便宜出 王者号 80英雄100皮肤 可议价',
    description:
      '王者荣耀账号，80个英雄，102个皮肤，包括仲夏夜之梦、末日机甲、地狱火、海洋之心等传说皮肤。铭文200级，现段位星耀3，适合新手入手。',
    coverSeed: 'wzry_cheap',
    imageSeeds: ['wzc1', 'wzch'],
    rank: '星耀',
    rankLevel: 7,
    tags: [
      { name: '传说皮肤x4', type: 'skin' },
      { name: '80英雄' },
      { name: '可议价', highlight: true },
      { name: '适合新手', highlight: true },
    ],
    heroCount: 80,
    skinCount: 102,
    rareItems: ['仲夏夜之梦', '末日机甲', '地狱火'],
    price: 688,
    priceType: 'negotiable',
    sellerId: 'u4',
    viewCount: 432,
    favoriteCount: 28,
    publishTime: '2024-06-15 16:00',
    canRefund: false,
    protectionDays: 7,
  }),
  buildAccount({
    id: 'a6',
    gameId: 'g2',
    gameName: '和平精英',
    serverId: 's6',
    serverName: '微信区',
    title: '小号出售 有101套装和几把升级枪',
    description:
      '和平精英微信区小号，有101火箭少女套装，升级枪有M416五爪金龙5级，AKM甜心宝贝3级，AWM花间之火。载具有一个轿车皮肤，带改名卡，秒换绑。',
    coverSeed: 'hpjz_small',
    imageSeeds: ['hps1', 'hps2'],
    rank: '不朽星钻',
    rankLevel: 5,
    tags: [
      { name: '火箭少女101', type: 'skin', highlight: true },
      { name: '五爪金龙5级' },
      { name: '小号' },
    ],
    skinCount: 56,
    rareItems: ['火箭少女套装', 'M416五爪金龙'],
    price: 1280,
    priceType: 'fixed',
    sellerId: 'u1',
    viewCount: 678,
    favoriteCount: 45,
    publishTime: '2024-06-13 20:30',
  }),
];

export const getAccountById = (id: string): GameAccount | undefined => {
  return mockAccounts.find((a) => a.id === id);
};

export const getAccountsByGame = (gameId: string): GameAccount[] => {
  return mockAccounts.filter((a) => a.gameId === gameId);
};
