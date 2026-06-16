import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { GameAccount } from '@/types';
import { formatPrice, creditLevelInfo } from '@/data/users';
import styles from './index.module.scss';

interface AccountCardProps {
  account: GameAccount;
  onClick?: () => void;
}

const AccountCard: React.FC<AccountCardProps> = ({ account, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/account-detail/index?id=${account.id}`,
      });
    }
  };

  const displayTags = account.tags.slice(0, 4);
  const creditInfo = creditLevelInfo[account.seller.creditLevel];

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.cardInner}>
        <View className={styles.coverWrap}>
          <Image
            className={styles.cover}
            src={account.coverImage}
            mode='aspectFill'
            onError={(e) => console.error('[AccountCard] Image load error:', e)}
          />
          {account.verifyReport && (
            <View className={styles.verifiedBadge}>
              <Text>✓ 已验号</Text>
            </View>
          )}
        </View>
        <View className={styles.content}>
          <View>
            <View className={styles.header}>
              <Text className={styles.title}>{account.title}</Text>
              <Text className={styles.gameTag}>{account.gameName}</Text>
            </View>
            <View className={styles.metaRow}>
              <Text className={styles.rankTag}>{account.rank}</Text>
              <Text className={styles.serverName}>{account.serverName}</Text>
            </View>
            <View className={styles.tagList}>
              {displayTags.map((tag) => (
                <Text
                  key={tag.id}
                  className={classnames(styles.tag, tag.highlight && styles.tagHighlight)}
                >
                  {tag.name}
                </Text>
              ))}
            </View>
          </View>
          <View className={styles.sellerRow}>
            <View className={styles.sellerInfo}>
              <Image
                className={styles.avatar}
                src={account.seller.avatar}
                mode='aspectFill'
                onError={(e) => console.error('[AccountCard] Avatar load error:', e)}
              />
              <Text className={styles.sellerName}>{account.seller.nickname}</Text>
              {account.seller.isVerified && (
                <Text
                  style={{
                    fontSize: '20rpx',
                    color: creditInfo?.color || '#10B981',
                    flexShrink: 0,
                  }}
                >
                  ✓{creditInfo?.label || '实名'}
                </Text>
              )}
            </View>
            <View className={styles.priceRow}>
              <Text className={styles.price}>
                <Text className={styles.pricePrefix}>¥</Text>
                {account.price.toLocaleString()}
              </Text>
              {account.originalPrice && (
                <Text className={styles.originalPrice}>
                  ¥{account.originalPrice.toLocaleString()}
                </Text>
              )}
              <Text
                className={classnames(
                  styles.priceTypeTag,
                  account.priceType === 'negotiable' ? styles.negotiable : styles.fixed
                )}
              >
                {account.priceType === 'negotiable' ? '可议价' : '一口价'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default AccountCard;
