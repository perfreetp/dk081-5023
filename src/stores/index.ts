import { create } from 'zustand';
import { GameAccount, Order, User, Review, GameAccount as AccountType, OrderStatus } from '@/types';
import { mockAccounts, getAccountById } from '@/data/accounts';
import { mockOrders, getOrderById, buildOrder } from '@/data/orders';
import { mockUsers, currentUser, getUserById } from '@/data/users';
import { mockReviews, getReviewsBySeller } from '@/data/reviews';

interface AppState {
  accounts: GameAccount[];
  orders: Order[];
  users: User[];
  currentUser: User;
  blacklist: Set<string>;
  reviews: Review[];

  addAccount: (account: Omit<GameAccount, 'id' | 'seller' | 'status' | 'viewCount' | 'favoriteCount' | 'chatCount' | 'dealCount' | 'publishTime' | 'publishedAt' | 'server' | 'negotiable' | 'canRefund' | 'protectionDays'> & Partial<GameAccount>) => GameAccount;
  getAccounts: () => GameAccount[];
  getAccountsFiltered: () => GameAccount[];
  getAccount: (id: string) => GameAccount | undefined;
  updateAccountPrice: (accountId: string, newPrice: number) => void;
  toggleAccountStatus: (accountId: string) => void;

  addOrder: (order: Order) => void;
  createOrder: (accountId: string, negotiatedPrice?: number) => Order;
  getOrders: () => Order[];
  getOrder: (id: string) => Order | undefined;
  getOrdersByUser: (userId: string, role?: 'buyer' | 'seller' | 'all') => Order[];
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;

  addReview: (review: Omit<Review, 'id' | 'createTime' | 'reviewer'> & Partial<Review>) => Review | null;
  hasReviewedOrder: (orderId: string) => boolean;
  getReviewsByOrder: (orderId: string) => Review[];
  getReviewsByUser: (userId: string) => Review[];

  addToBlacklist: (userId: string, reason?: string) => void;
  removeFromBlacklist: (userId: string) => void;
  isBlacklisted: (userId: string) => boolean;

  updateUserCredit: (userId: string, ratingDelta: number) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  accounts: [...mockAccounts],
  orders: [...mockOrders],
  users: [...mockUsers],
  currentUser: { ...currentUser },
  blacklist: new Set<string>(),
  reviews: [...mockReviews],

  addAccount: (input) => {
    const seller = get().currentUser;
    const newId = `a_new_${Date.now()}`;
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const baseImages = input.images && input.images.length > 0 ? input.images : [`https://picsum.photos/seed/${newId}_cover/900/600`];
    
    const newAccount: GameAccount = {
      id: newId,
      gameId: input.gameId,
      gameName: input.gameName,
      serverId: input.serverId,
      serverName: input.serverName,
      server: input.serverName,
      title: input.title,
      description: input.description || '',
      coverImage: baseImages[0],
      images: baseImages,
      rank: input.rank || '待补充',
      rankLevel: input.rankLevel || 5,
      tags: input.tags || [],
      heroCount: input.heroCount,
      skinCount: input.skinCount,
      rareItems: input.rareItems,
      price: input.price,
      originalPrice: input.originalPrice,
      priceType: input.priceType,
      negotiable: input.priceType === 'negotiable',
      sellerId: seller.id,
      seller,
      status: 'on_sale',
      viewCount: 0,
      favoriteCount: 0,
      chatCount: 0,
      dealCount: 0,
      publishTime: timeStr,
      publishedAt: timeStr,
      canRefund: input.canRefund ?? true,
      protectionDays: input.protectionDays || 15,
      ...input,
    };

    set(s => ({ accounts: [newAccount, ...s.accounts] }));
    return newAccount;
  },

  getAccounts: () => get().accounts,

  getAccountsFiltered: () => {
    const { accounts, blacklist } = get();
    return accounts.filter(a => !blacklist.has(a.sellerId) && a.status === 'on_sale');
  },

  getAccount: (id) => {
    const fromStore = get().accounts.find(a => a.id === id);
    return fromStore || getAccountById(id);
  },

  updateAccountPrice: (accountId, newPrice) => {
    set(s => ({
      accounts: s.accounts.map(a => a.id === accountId ? { ...a, price: newPrice } : a)
    }));
  },

  toggleAccountStatus: (accountId) => {
    set(s => ({
      accounts: s.accounts.map(a => {
        if (a.id !== accountId || a.sellerId !== s.currentUser.id) return a;
        const newStatus: GameAccount['status'] = a.status === 'on_sale' ? 'offline' : 'on_sale';
        return { ...a, status: newStatus };
      })
    }));
  },

  addOrder: (order) => set(s => ({ orders: [order, ...s.orders] })),

  createOrder: (accountId, negotiatedPrice) => {
    const account = get().getAccount(accountId);
    if (!account) throw new Error('账号不存在');

    const seller = account.seller;
    const buyer = get().currentUser;
    const price = negotiatedPrice ?? account.price;
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const orderId = `o_${Date.now()}`;
    const orderNo = `GX${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${String(Math.floor(Math.random() * 90000) + 10000)}`;
    const deadline = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const deadlineStr = `${deadline.getFullYear()}-${pad(deadline.getMonth() + 1)}-${pad(deadline.getDate())} ${pad(deadline.getHours())}:${pad(deadline.getMinutes())}:${pad(deadline.getSeconds())}`;

    const newOrder = buildOrder({
      id: orderId,
      orderNo,
      accountId,
      buyerId: buyer.id,
      sellerId: seller.id,
      finalPrice: price,
      status: 'verifying',
      createTime: timeStr,
      payTime: timeStr,
      verifyStartTime: timeStr,
      deadlineTime: deadlineStr,
      countdownSeconds: 24 * 60 * 60,
      isNegotiated: !!negotiatedPrice,
      negotiatedPrice,
      bindingProgress: 0,
      verifyRecordCount: 6,
      protectionDays: account.protectionDays || 15,
    });

    // 重新覆盖 account 字段，确保用的是当前账号实时数据
    const finalOrder: Order = {
      ...newOrder,
      account,
      buyer,
      seller,
      finalPrice: price,
      price,
    };

    set(s => ({ orders: [finalOrder, ...s.orders] }));
    return finalOrder;
  },

  updateOrderStatus: (orderId, newStatus) => {
    set(s => ({
      orders: s.orders.map(o => {
        if (o.id !== orderId) return o;
        const stepOrder: OrderStatus[] = [
          'pending_payment', 'pending_verify', 'verifying', 'verify_done',
          'pending_binding', 'binding', 'completed'
        ];
        const currentIdx = stepOrder.indexOf(newStatus);
        const newSteps = o.steps.map((step, i) => ({
          ...step,
          status: i < currentIdx ? 'done' as const : i === currentIdx ? 'current' as const : 'pending' as const,
        }));
        const currentStep = newSteps.find(s => s.status === 'current') || newSteps[newSteps.length - 1];
        return {
          ...o,
          status: newStatus,
          currentStepKey: newStatus,
          currentStep,
          steps: newSteps,
        };
      })
    }));
  },

  getOrders: () => get().orders,

  getOrder: (id) => {
    const fromStore = get().orders.find(o => o.id === id);
    return fromStore || getOrderById(id);
  },

  getOrdersByUser: (userId, role = 'all') => {
    return get().orders.filter(o => {
      if (role === 'buyer') return o.buyerId === userId;
      if (role === 'seller') return o.sellerId === userId;
      return o.buyerId === userId || o.sellerId === userId;
    });
  },

  addReview: (input) => {
    // 评价去重：同一订单同一买家不能重复评价
    if (input.orderId && get().hasReviewedOrder(input.orderId)) {
      return null;
    }

    const reviewer = get().currentUser;
    const newId = `r_${Date.now()}`;
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newReview: Review = {
      id: newId,
      orderId: input.orderId,
      reviewerId: reviewer.id,
      reviewer,
      revieweeId: input.revieweeId,
      rating: input.rating,
      subRatings: input.subRatings || { accurate: 5, speed: 5, attitude: 5, process: 5 },
      tags: input.tags || [],
      content: input.content || '',
      images: input.images,
      createTime: timeStr,
      isAnonymous: input.isAnonymous ?? false,
    };

    set(s => ({ reviews: [newReview, ...s.reviews] }));

    const avgRating = input.rating;
    const delta = avgRating >= 4 ? 2 : avgRating >= 3 ? 0 : avgRating >= 2 ? -3 : -5;
    get().updateUserCredit(input.revieweeId, delta);

    return newReview;
  },

  hasReviewedOrder: (orderId) => {
    const reviewerId = get().currentUser.id;
    return get().reviews.some(r => r.orderId === orderId && r.reviewerId === reviewerId);
  },

  getReviewsByOrder: (orderId) => {
    return get().reviews.filter(r => r.orderId === orderId);
  },

  getReviewsByUser: (userId) => {
    const fromStore = get().reviews.filter(r => r.revieweeId === userId);
    const fromMock = getReviewsBySeller(userId);
    return [...fromStore, ...fromMock];
  },

  addToBlacklist: (userId) => {
    set(s => {
      const newBlacklist = new Set(s.blacklist);
      newBlacklist.add(userId);
      return { blacklist: newBlacklist };
    });
  },

  removeFromBlacklist: (userId) => {
    set(s => {
      const newBlacklist = new Set(s.blacklist);
      newBlacklist.delete(userId);
      return { blacklist: newBlacklist };
    });
  },

  isBlacklisted: (userId) => get().blacklist.has(userId),

  updateUserCredit: (userId, ratingDelta) => {
    set(s => {
      let updatedSeller: User | null = null;

      const calcUpdatedUser = (u: User): User => {
        const newScore = Math.max(0, Math.min(100, u.creditScore + ratingDelta));
        const newLevel = newScore >= 90 ? 'excellent' : newScore >= 75 ? 'good' : newScore >= 60 ? 'normal' : 'poor';
        const newTotal = u.totalDeals + 1;
        const isGoodRating = ratingDelta >= 0;

        const prevGoodCount = Math.round((u.goodRate / 100) * u.totalDeals);
        const newGoodCount = isGoodRating ? prevGoodCount + 1 : prevGoodCount;
        const newGoodRate = Math.min(100, Math.max(0, Math.round((newGoodCount / newTotal) * 100)));
        const newSuccessRate = Math.min(100, Math.max(0, Math.round((newGoodCount / newTotal) * 1000) / 10));

        return {
          ...u,
          creditScore: newScore,
          creditLevel: newLevel,
          totalDeals: newTotal,
          totalSales: newTotal,
          successRate: newSuccessRate,
          goodRate: newGoodRate,
          reviewCount: (u.reviewCount || 0) + 1,
        };
      };

      const updatedUsers = s.users.map(u => {
        if (u.id === userId && u.id !== s.currentUser.id) {
          updatedSeller = calcUpdatedUser(u);
          return updatedSeller;
        }
        return u;
      });

      let newCurrentUser = s.currentUser;
      if (userId === s.currentUser.id) {
        newCurrentUser = calcUpdatedUser(s.currentUser);
        updatedSeller = newCurrentUser;
      }

      const updatedAccounts = s.accounts.map(a => {
        if (a.sellerId === userId && updatedSeller) {
          return { ...a, seller: updatedSeller };
        }
        return a;
      });

      return { 
        users: updatedUsers, 
        currentUser: newCurrentUser,
        accounts: updatedAccounts,
      };
    });
  },
}));
