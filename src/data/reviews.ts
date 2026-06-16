import { Review } from '@/types';
import { mockUsers, getUserById } from './users';

const buildReview = (
  id: string,
  orderId: string,
  reviewerId: string,
  revieweeId: string,
  rating: number,
  content: string,
  tags: string[],
  daysAgo: number
): Review => {
  const reviewer = getUserById(reviewerId) || mockUsers[0];
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const pad = (n: number) => String(n).padStart(2, '0');
  const timeStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;

  return {
    id,
    orderId,
    reviewerId,
    reviewer,
    revieweeId,
    rating,
    subRatings: { accurate: rating, speed: rating, attitude: rating, process: rating },
    tags,
    content,
    createTime: timeStr,
    isAnonymous: false,
  };
};

export const mockReviews: Review[] = [
  buildReview('r1', 'o1', 'u3', 'u1', 5, '卖家非常靠谱，号和描述完全一致，换绑也很顺利，下次还会来！', ['描述一致', '换绑快', '态度好'], 2),
  buildReview('r2', 'o2', 'u4', 'u1', 5, '交易很愉快，平台验号流程很专业，买的放心。', ['描述一致', '平台验号放心'], 5),
  buildReview('r3', 'o3', 'u5', 'u1', 4, '整体还不错，就是换绑等了一小会，号本身没问题。', ['描述一致', '态度好'], 9),
  buildReview('r4', 'o4', 'u3', 'u2', 5, '皮肤英雄都对得上，卖家配合度很高，推荐！', ['描述一致', '换绑快', '物超所值'], 3),
  buildReview('r5', 'o5', 'u1', 'u2', 5, '第二次在这家买了，一如既往的稳。', ['回头客', '描述一致'], 7),
  buildReview('r6', 'o6', 'u4', 'u3', 4, '号可以，就是回复稍慢，不过最终交易顺利。', ['描述一致'], 4),
  buildReview('r7', 'o7', 'u2', 'u4', 3, '号本身没问题，就是沟通上有些慢，整体还行。', ['描述一致'], 6),
  buildReview('r8', 'o8', 'u1', 'u5', 5, '新手卖家但是很配合，全程按平台流程走，好评。', ['新手但靠谱', '描述一致'], 1),
];

export const getReviewsBySeller = (sellerId: string): Review[] => {
  return mockReviews.filter(r => r.revieweeId === sellerId);
};
