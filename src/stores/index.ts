import { create } from 'zustand';
import { GameAccount, Order, User, Review, GameAccount as AccountType } from '@/types';
import { mockAccounts, getAccountById } from '@/data/accounts';
import { mockOrders, getOrderById } from '@/data/orders';
import { mockUsers, currentUser, getUserById } from '@/data/users';

interface AppState {
  accounts: GameAccount[];
  orders: Order[];
  users: User[];
  currentUser: User;
  blacklist: Set<string>;
  reviews: Review[];

  addAccount: (account: Omit<GameAccount, 'id' | 'seller' | 'status' | 'viewCount' | 'favoriteCount' | 'publishTime' | 'publishedAt' | 'server' | 'negotiable' | 'canRefund' | 'protectionDays'> & Partial<GameAccount>) => GameAccount;
  getAccounts: () => GameAccount[];
  getAccountsFiltered: () => GameAccount[];
  getAccount: (id: string) => GameAccount | undefined;

  addOrder: (order: Order) => void;
  getOrders: () => Order[];
  getOrder: (id: string) => Order | undefined;
  getOrdersByUser: (userId: string, role?: 'buyer' | 'seller' | 'all') => Order[];

  addReview: (review: Omit<Review, 'id' | 'createTime' | 'reviewer'> & Partial<Review>) => Review;
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
  reviews: [],

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
    return accounts.filter(a => !blacklist.has(a.sellerId));
  },

  getAccount: (id) => {
    const fromStore = get().accounts.find(a => a.id === id);
    return fromStore || getAccountById(id);
  },

  addOrder: (order) => set(s => ({ orders: [order, ...s.orders] })),

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

  getReviewsByUser: (userId) => {
    return get().reviews.filter(r => r.revieweeId === userId);
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

      const updatedUsers = s.users.map(u => {
        if (u.id === userId && u.id !== s.currentUser.id) {
          const newScore = Math.max(0, Math.min(100, u.creditScore + ratingDelta));
          const newLevel = newScore >= 90 ? 'excellent' : newScore >= 75 ? 'good' : newScore >= 60 ? 'normal' : 'poor';
          const newTotal = u.totalDeals + 1;
          const newGood = ratingDelta >= 0 
            ? (u.goodRate * u.totalDeals + 1) / newTotal 
            : (u.goodRate * u.totalDeals) / newTotal;
          const cappedGood = Math.max(0, Math.min(1, newGood));
          updatedSeller = {
            ...u,
            creditScore: newScore,
            creditLevel: newLevel,
            totalDeals: newTotal,
            totalSales: newTotal,
            successRate: cappedGood,
            goodRate: cappedGood,
            reviewCount: (u.reviewCount || 0) + 1,
          };
          return updatedSeller;
        }
        return u;
      });

      let newCurrentUser = s.currentUser;
      if (userId === s.currentUser.id) {
        const newScore = Math.max(0, Math.min(100, s.currentUser.creditScore + ratingDelta));
        const newLevel = newScore >= 90 ? 'excellent' : newScore >= 75 ? 'good' : newScore >= 60 ? 'normal' : 'poor';
        const newTotal = s.currentUser.totalDeals + 1;
        const newGood = ratingDelta >= 0 
          ? (s.currentUser.goodRate * s.currentUser.totalDeals + 1) / newTotal 
          : (s.currentUser.goodRate * s.currentUser.totalDeals) / newTotal;
        const cappedGood = Math.max(0, Math.min(1, newGood));
        newCurrentUser = {
          ...s.currentUser,
          creditScore: newScore,
          creditLevel: newLevel,
          totalDeals: newTotal,
          totalSales: newTotal,
          successRate: cappedGood,
          goodRate: cappedGood,
          reviewCount: (s.currentUser.reviewCount || 0) + 1,
        };
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
