export const formatPrice = (price: number): string => {
  if (price >= 10000) {
    return `¥${(price / 10000).toFixed(1)}万`;
  }
  return `¥${price.toLocaleString()}`;
};

export const formatPriceFull = (price: number): string => {
  return `¥${price.toLocaleString()}`;
};

export const formatCountdown = (seconds: number): string => {
  if (seconds <= 0) return '已结束';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (days > 0) {
    return `${days}天${hours}时${minutes}分`;
  }
  if (hours > 0) {
    return `${hours}时${minutes}分${secs}秒`;
  }
  if (minutes > 0) {
    return `${minutes}分${secs}秒`;
  }
  return `${secs}秒`;
};

export const formatRelativeTime = (timeStr: string): string => {
  const now = new Date().getTime();
  const time = new Date(timeStr).getTime();
  const diff = Math.floor((now - time) / 1000);
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}天前`;
  return timeStr.slice(0, 10);
};

export const formatNumber = (num: number): string => {
  if (num >= 10000) return `${(num / 10000).toFixed(1)}w`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
};

export const maskPhone = (phone: string): string => {
  if (!phone || phone.length < 7) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(-4);
};

export const maskIdCard = (idCard: string): string => {
  if (!idCard || idCard.length < 8) return idCard;
  return idCard.slice(0, 4) + '**********' + idCard.slice(-4);
};
