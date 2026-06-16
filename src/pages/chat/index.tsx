import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { mockConversations } from '@/data/chats';
import { formatRelativeTime } from '@/utils/format';
import { useAppStore } from '@/stores';
import styles from './index.module.scss';

const ChatPage: React.FC = () => {
  const [conversations] = useState(mockConversations);
  const isBlacklisted = useAppStore(s => s.isBlacklisted);

  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      if (c.type !== 'user') return true;
      return !isBlacklisted(c.targetUserId);
    });
  }, [conversations, isBlacklisted]);

  const handleConvClick = (convId: string) => {
    console.log('[ChatPage] Open conversation:', convId);
    Taro.showToast({ title: '聊天详情开发中', icon: 'none' });
  };

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (a.isTop !== b.isTop) return a.isTop ? -1 : 1;
    return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
  });

  const totalUnread = filteredConversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <ScrollView scrollY className={styles.page} enableBackToTop>
      <View className={styles.headerBar}>
        <Text className={styles.headerTitle}>
          消息中心
          {totalUnread > 0 && (
            <Text style={{ marginLeft: '12rpx', color: '#EF4444', fontSize: '24rpx', fontWeight: 'normal' }}>
              ({totalUnread})
            </Text>
          )}
        </Text>
        <View className={styles.headerActions}>
          <View
            className={styles.headerAction}
            onClick={() => Taro.showToast({ title: '添加好友', icon: 'none' })}
          >
            <Text>➕</Text>
          </View>
        </View>
      </View>

      <View className={styles.listWrap}>
        {sortedConversations.length > 0 ? (
          sortedConversations.map(conv => (
            <View
              key={conv.id}
              className={styles.convItem}
              onClick={() => handleConvClick(conv.id)}
            >
              {conv.isTop && <View className={styles.topMark} />}
              <View className={styles.avatarWrap}>
                <View className={styles.avatar}>
                  <Image
                    className={styles.avatarImg}
                    src={conv.targetUser.avatar}
                    mode='aspectFill'
                    onError={(e) => console.error('[ChatPage] Avatar error:', e)}
                  />
                </View>
                {conv.unreadCount > 0 && (
                  <View className={styles.unreadBadge}>
                    <Text>{conv.unreadCount > 99 ? '99+' : conv.unreadCount}</Text>
                  </View>
                )}
                {conv.type !== 'user' && (
                  <View
                    className={classnames(
                      styles.typeBadge,
                      conv.type === 'system' && styles.system,
                      conv.type === 'service' && styles.service
                    )}
                  >
                    <Text>{conv.type === 'system' ? '📢' : conv.type === 'service' ? '🎧' : '👤'}</Text>
                  </View>
                )}
              </View>
              <View className={styles.convContent}>
                <View className={styles.convTopRow}>
                  <View className={styles.nameRow}>
                    <Text className={styles.nickname}>{conv.targetUser.nickname}</Text>
                    {conv.targetUser.isVerified && conv.type === 'user' && (
                      <Text className={styles.verifiedTag}>✓实名</Text>
                    )}
                  </View>
                  <Text className={styles.timeText}>
                    {formatRelativeTime(conv.lastMessageTime)}
                  </Text>
                </View>
                <View className={styles.convBottomRow}>
                  <Text
                    className={classnames(
                      styles.lastMsg,
                      conv.type !== 'user' && styles.systemMsg
                    )}
                  >
                    {conv.lastMessage}
                  </Text>
                </View>
                {conv.accountTitle && (
                  <Text className={styles.relatedAccount}>
                    📦 {conv.accountTitle}
                  </Text>
                )}
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>💬</Text>
            <Text className={styles.emptyText}>暂无消息</Text>
            <Text className={styles.emptyHint}>去浏览账号，联系卖家咨询吧～</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default ChatPage;
