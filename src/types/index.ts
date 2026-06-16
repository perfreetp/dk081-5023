export interface GameCategory {
  id: string;
  name: string;
  icon: string;
  hot?: boolean;
  servers?: ServerInfo[];
}

export interface ServerInfo {
  id: string;
  name: string;
  region: string;
}

export interface User {
  id: string;
  nickname: string;
  avatar: string;
  avatarEmoji: string;
  phone: string;
  isVerified: boolean;
  realNameVerified: boolean;
  realName?: string;
  idCardLast4?: string;
  creditScore: number;
  creditLevel: 'excellent' | 'good' | 'normal' | 'poor';
  totalDeals: number;
  totalSales: number;
  successRate: number;
  goodRate: number;
  registerDate: string;
  daysActive: number;
  isInBlacklist?: boolean;
  reviewCount?: number;
}

export interface AccountTag {
  id: string;
  name: string;
  value: string;
  type: 'rank' | 'skin' | 'equipment' | 'hero' | 'other';
  highlight?: boolean;
}

export interface VerifyReportItem {
  id: string;
  name: string;
  value: string;
  category: 'basic' | 'assets' | 'security';
  passed: boolean;
  warning: boolean;
  note?: string;
}

export interface VerifyReport {
  id: string;
  reportId: string;
  accountId: string;
  verifier: string;
  verifyTime: string;
  levelMatched: boolean;
  itemsMatched: boolean;
  descriptionMatched: boolean;
  screenshots: VerifyScreenshot[];
  notes: string;
  riskLevel: 'low' | 'medium' | 'high';
  score: number;
  totalItems: number;
  items: VerifyReportItem[];
}

export interface VerifyScreenshot {
  id: string;
  url: string;
  description: string;
  uploadTime: string;
}

export interface GameAccount {
  id: string;
  gameId: string;
  gameName: string;
  serverId: string;
  serverName: string;
  server: string;
  title: string;
  description: string;
  coverImage: string;
  images: string[];
  rank: string;
  rankLevel: number;
  tags: AccountTag[];
  heroCount?: number;
  skinCount?: number;
  rareItems?: string[];
  price: number;
  originalPrice?: number;
  priceType: 'fixed' | 'negotiable';
  negotiable: boolean;
  sellerId: string;
  seller: User;
  status: 'on_sale' | 'pending' | 'sold' | 'offline';
  viewCount: number;
  favoriteCount: number;
  chatCount?: number;
  dealCount?: number;
  publishTime: string;
  publishedAt: string;
  verifyReport?: VerifyReport;
  canRefund: boolean;
  protectionDays: number;
}

export type OrderStatus =
  | 'pending_payment'
  | 'pending_verify'
  | 'verifying'
  | 'verify_done'
  | 'pending_binding'
  | 'binding'
  | 'completed'
  | 'guarantee'
  | 'appealing'
  | 'refunded'
  | 'cancelled';

export interface OrderStep {
  key: OrderStatus;
  title: string;
  description: string;
  status: 'done' | 'current' | 'pending';
  time?: string;
}

export interface VerifyRecordItem {
  id: string;
  itemName: string;
  description: string;
  operator: string;
  time: string;
  screenshot?: string;
  image: string;
  passed: boolean;
  warning: boolean;
  note?: string;
}

export interface BindingStepItem {
  id: string;
  title: string;
  description: string;
  tips?: string;
  tip?: string;
  status: 'pending' | 'doing' | 'done';
  completed: boolean;
}

export interface RiskWarningItem {
  icon: string;
  text: string;
}

export interface RiskWarning {
  title: string;
  remainingDays: number;
  tips: RiskWarningItem[];
}

export interface Order {
  id: string;
  orderNo: string;
  accountId: string;
  account: GameAccount;
  buyerId: string;
  buyer: User;
  sellerId: string;
  seller: User;
  finalPrice: number;
  price: number;
  serviceFee: number;
  totalAmount: number;
  status: OrderStatus;
  currentStepKey: OrderStatus;
  currentStep: OrderStep;
  steps: OrderStep[];
  createTime: string;
  createdAt: string;
  payTime?: string;
  verifyStartTime?: string;
  verifyEndTime?: string;
  completeTime?: string;
  deadlineTime: string;
  countdownSeconds: number;
  countdown?: string;
  isNegotiated: boolean;
  negotiated: boolean;
  negotiatedPrice?: number;
  bindingGuide?: BindingStepItem[];
  verifyRecords?: VerifyRecordItem[];
  protectionEndTime?: string;
  hasRiskWarning?: boolean;
  riskWarningMessage?: string;
  riskWarning?: RiskWarning;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'system' | 'negotiate' | 'order';
  timestamp: string;
  isRead: boolean;
  negotiateData?: {
    proposedPrice: number;
    originalPrice: number;
    status: 'pending' | 'accepted' | 'rejected';
  };
  orderData?: {
    orderId: string;
    orderNo: string;
    status: string;
  };
}

export interface Conversation {
  id: string;
  type: 'user' | 'system' | 'service';
  targetUserId: string;
  targetUser: User;
  accountId?: string;
  accountTitle?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isTop: boolean;
}

export interface Review {
  id: string;
  orderId: string;
  reviewerId: string;
  reviewer: User;
  revieweeId: string;
  rating: number;
  subRatings: {
    accurate: number;
    speed: number;
    attitude: number;
    process: number;
  };
  tags: string[];
  content: string;
  images?: string[];
  createTime: string;
  isAnonymous: boolean;
}

export interface BlacklistItem {
  id: string;
  userId: string;
  user: User;
  reason: string;
  addTime: string;
}

export interface Appeal {
  id: string;
  orderId: string;
  order: Order;
  appellantId: string;
  respondentId: string;
  type: 'recovery' | 'mismatch' | 'other';
  reason: string;
  description: string;
  evidence: string[];
  status: 'pending' | 'processing' | 'resolved' | 'rejected';
  createTime: string;
  platformComment?: string;
}

export type TabKey = 'home' | 'publish' | 'escrow' | 'chat' | 'profile';
