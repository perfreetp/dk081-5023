import { GameCategory } from '@/types';

export const gameCategories: GameCategory[] = [
  {
    id: 'g1',
    name: '王者荣耀',
    icon: '👑',
    hot: true,
    servers: [
      { id: 's1', name: '王者一区', region: '电信' },
      { id: 's2', name: '王者二区', region: '电信' },
      { id: 's3', name: '王者三区', region: '网通' },
      { id: 's4', name: '全服通用', region: '全服' },
    ],
  },
  {
    id: 'g2',
    name: '和平精英',
    icon: '🎯',
    hot: true,
    servers: [
      { id: 's5', name: 'QQ区', region: 'QQ' },
      { id: 's6', name: '微信区', region: '微信' },
    ],
  },
  {
    id: 'g3',
    name: '原神',
    icon: '⚔️',
    hot: true,
    servers: [
      { id: 's7', name: '天空岛', region: '官服' },
      { id: 's8', name: '世界树', region: 'B服' },
    ],
  },
  {
    id: 'g4',
    name: '英雄联盟',
    icon: '🛡️',
    hot: true,
    servers: [
      { id: 's9', name: '艾欧尼亚', region: '电信一' },
      { id: 's10', name: '祖安', region: '电信二' },
      { id: 's11', name: '诺克萨斯', region: '电信三' },
      { id: 's12', name: '德玛西亚', region: '网通一' },
    ],
  },
  {
    id: 'g5',
    name: '穿越火线',
    icon: '🔫',
    servers: [
      { id: 's13', name: '北方大区', region: '网通' },
      { id: 's14', name: '南方大区', region: '电信' },
    ],
  },
  {
    id: 'g6',
    name: '梦幻西游',
    icon: '🐉',
    servers: [
      { id: 's15', name: '生日快乐', region: '热门' },
      { id: 's16', name: '2008', region: '热门' },
    ],
  },
  {
    id: 'g7',
    name: 'CSGO',
    icon: '💣',
    servers: [
      { id: 's17', name: '国服', region: '完美' },
      { id: 's18', name: '国际服', region: 'Steam' },
    ],
  },
  {
    id: 'g8',
    name: 'DNF',
    icon: '⚡',
    servers: [
      { id: 's19', name: '跨一', region: '广东区' },
      { id: 's20', name: '跨二', region: '湖北区' },
    ],
  },
  {
    id: 'g9',
    name: '金铲铲之战',
    icon: '⚜️',
    servers: [
      { id: 's_g9_common', name: '全服通用', region: '通用' },
    ],
  },
  {
    id: 'g10',
    name: '更多游戏',
    icon: '🎮',
    servers: [
      { id: 's_g10_common', name: '通用区服', region: '通用' },
    ],
  },
];

export const rankFilters = [
  { id: 'r1', name: '青铜白银', range: '1-3' },
  { id: 'r2', name: '黄金铂金', range: '4-6' },
  { id: 'r3', name: '钻石星耀', range: '7-8' },
  { id: 'r4', name: '王者以上', range: '9-10' },
];

export const priceRanges = [
  { id: 'p1', name: '500以下', min: 0, max: 500 },
  { id: 'p2', name: '500-1000', min: 500, max: 1000 },
  { id: 'p3', name: '1000-3000', min: 1000, max: 3000 },
  { id: 'p4', name: '3000-5000', min: 3000, max: 5000 },
  { id: 'p5', name: '5000以上', min: 5000, max: 999999 },
];

export const sortOptions = [
  { id: 'sort1', name: '综合排序', key: 'default' },
  { id: 'sort2', name: '价格最低', key: 'price_asc' },
  { id: 'sort3', name: '价格最高', key: 'price_desc' },
  { id: 'sort4', name: '最新发布', key: 'newest' },
  { id: 'sort5', name: '信用最高', key: 'credit' },
];
