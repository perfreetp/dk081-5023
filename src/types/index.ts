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
  phone: string;
  isVerified: boolean;
  realName?: string;
  idCardLast4?: string;
  creditScore: number;
  creditLevel: 'excellent' | 'good' | 'normal' | 'poor';
  totalDeals: number;
  successRate: number;
  registerDate: string;
  isInBlacklist?: boolean;
}

export interface AccountTag {
  id: string;
  name: string;
  type: 'rank' | 'skin' | 'equipment' | 'hero' | 'other';
  highlight?: boolean;
}

export interface GameAccount {
  id: string;
  gameId: string;
  gameName: string;
  serverId: string;
  serverName: string;
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
  sellerId: string;
  seller: User;
  status: 'on_sale' | 'pending' | 'sold' | 'offline';
  viewCount: number;
  favoriteCount: number;
  publishTime: string;
  verifyReport?: VerifyReport;
  canRefund: boolean;
  protectionDays: number;
}

export interface VerifyReport {
  id: string;
  accountId: string;
  verifier: string;
  verifyTime: string;
  levelMatched: boolean;
  itemsMatched: boolean;
  descriptionMatched: boolean;
  screenshots: VerifyScreenshot[];
  notes: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface VerifyScreenshot {
  id: string;
  url: string;
  description: string;
  uploadTime: string;
}

export type OrderStatus = 
  | 'pending_payment'
  | 'pending_verify'
  | 'verifying'
  | 'verify_done'
  | 'pending_binding'
  | 'binding'
  | 'completed'
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
  serviceFee: number;
  totalAmount: number;
  status: OrderStatus;
  steps: OrderStep[];
  createTime: string;
  payTime?: string;
  verifyStartTime?: string;
  verifyEndTime?: string;
  completeTime?: string;
  deadlineTime: string;
  countdownSeconds: number;
  isNegotiated: boolean;
  negotiatedPrice?: number;
  bindingGuide?: BindingStep[];
  verifyRecords?: VerifyRecord[];
  protectionEndTime?: string;
  hasRiskWarning?: boolean;
  riskWarningMessage?: string;
}

export interface BindingStep {
  id: string;
  title: string;
  description: string;
  tips: string;
  status: 'pending' | 'doing' | 'done';
}

export interface VerifyRecord {
  id: string;
  operator: string;
  action: string;
  time: string;
  screenshot?: string;
  description: string;
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
