import React, { useMemo } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { creditLevelInfo } from '@/data/users';
import { useAppStore } from '@/stores';
import styles from './index.module.scss';

const ProfilePage: React.FC = () => {
  const user = useAppStore(s => s.currentUser);
  const accounts = useAppStore(s => s.accounts);
  const blacklist = useAppStore(s => s.blacklist);
  const getOrdersByUser = useAppStore(s => s.getOrdersByUser);
  const creditInfo = creditLevelInfo[user.creditLevel];

  const myPublishedCount = useMemo(() => 
    accounts.filter(a => a.sellerId === user.id).length,
    [accounts, user.id]);

  const userOrders = useMemo(() => getOrdersByUser(user.id, 'all'), [user.id, getOrdersByUser]);
  const completedOrders = userOrders.filter(o => o.status === 'completed').length;
  const pendingOrders = userOrders.filter(
    o => ['pending_payment', 'pending_verify', 'verifying', 'verify_done', 'pending_binding', 'binding'].includes(o.status)
  ).length;
  const soldCount = userOrders.filter(o => o.sellerId === user.id && o.status === 'completed').length;
  const boughtCount = userOrders.filter(o => o.buyerId === user.id && o.status === 'completed').length;

  const menuGroups = useMemo(() => [
    {
      title: '我的交易',
      items: [
        { icon: '📦', text: '我发布的账号', badge: myPublishedCount > 0 ? `${myPublishedCount}` : '', action: () => Taro.switchTab({ url: '/pages/publish/index' }) },
        { icon: '🛒', text: '我买到的账号', badge: boughtCount > 0 ? `${boughtCount}` : '', action: () => Taro.switchTab({ url: '/pages/escrow/index' }) },
        { icon: '💰', text: '我卖出的账号', badge: soldCount > 0 ? `${soldCount}` : '', action: () => Taro.switchTab({ url: '/pages/escrow/index' }) },
        { icon: '⭐', text: '我的评价', action: () => Taro.showToast({ title: '评价管理', icon: 'none' }) },
        { icon: '🚫', text: '黑名单', badge: blacklist.size > 0 ? `${blacklist.size}` : '', action: () => Taro.showToast({ title: '黑名单管理', icon: 'none' }) },
      ],
    },
    {
      title: '账号与安全',
      items: [
        { icon: '🪪', text: '实名认证', badge: user.isVerified ? '已认证' : '未认证', action: () => Taro.showToast({ title: '实名认证', icon: 'none' }) },
        { icon: '🔐', text: '支付密码', action: () => Taro.showToast({ title: '支付密码设置', icon: 'none' }) },
        { icon: '📱', text: '绑定手机', action: () => Taro.showToast({ title: '绑定手机', icon: 'none' }) },
      ],
    },
    {
      title: '服务与帮助',
      items: [
        { icon: '📚', text: '新手交易指南', action: () => Taro.showToast({ title: '交易指南', icon: 'none' }) },
        { icon: '⚖️', text: '找回申诉规则', action: () => Taro.showToast({ title: '申诉规则', icon: 'none' }) },
        { icon: '🎧', text: '联系客服', action: () => Taro.switchTab({ url: '/pages/chat/index' }) },
        { icon: '⚙️', text: '设置', action: () => Taro.showToast({ title: '设置', icon: 'none' }) },
      ],
    },
  ], [myPublishedCount, boughtCount, soldCount, blacklist.size, user.isVerified]);

  return (
    <ScrollView scrollY className={styles.page} enableBackToTop>
      <View className={styles.headerSection}>
        <View className={styles.userCard}>
          <View className={styles.avatarWrap}>
            <View className={styles.avatar}>
              <Image
                className={styles.avatarImg}
                src={user.avatar}
                mode='aspectFill'
                onError={(e) => console.error('[ProfilePage] Avatar error:', e)}
              />
            </View>
            {user.isVerified && (
              <View className={styles.verifiedMark}>✓</View>
            )}
          </View>
          <View className={styles.userInfo}>
            <View className={styles.nicknameRow}>
              <Text className={styles.nickname}>{user.nickname}</Text>
            </View>
            <Text className={styles.phoneText}>{user.phone}</Text>
            <View className={styles.creditRow}>
              <View className={styles.creditBadge}>
                <Text className={styles.creditIcon}>⭐</Text>
                <Text className={styles.creditText}>{creditInfo.label}信用</Text>
              </View>
              <View className={styles.creditBadge}>
                <Text className={styles.creditIcon}>📅</Text>
                <Text className={styles.creditText}>注册于 {user.registerDate.slice(0, 7)}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.statsBar}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{pendingOrders}</Text>
          <Text className={styles.statLabel}>进行中</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{completedOrders}</Text>
          <Text className={styles.statLabel}>已完成</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{user.totalDeals}</Text>
          <Text className={styles.statLabel}>累计交易</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{user.successRate}%</Text>
          <Text className={styles.statLabel}>成功率</Text>
        </View>
      </View>

      <View className={styles.creditDetailCard}>
        <View className={styles.cardHeader}>
          <View className={styles.cardTitle}>
            <Text>💯</Text>
            <Text>信用评估</Text>
          </View>
          <Text className={styles.moreLink}>查看详情 ›</Text>
        </View>
        <View className={styles.scoreSection}>
          <View className={styles.scoreCircle}>
            <View className={styles.scoreInner}>
              <Text className={styles.scoreValue}>{user.creditScore}</Text>
              <Text className={styles.scoreLabel}>信用分</Text>
            </View>
          </View>
          <View className={styles.scoreRight}>
            <View className={styles.levelRow}>
              <View
                className={styles.levelBadge}
                style={{ background: creditInfo.color }}
              >
                <Text>{creditInfo.label}</Text>
              </View>
              <Text className={styles.levelDesc}>击败全国 92% 的用户</Text>
            </View>
            <View className={styles.progressRow}>
              <View className={styles.progressLabel}>
                <Text>距离下一等级</Text>
                <Text>还差 5 分</Text>
              </View>
              <View className={styles.progressBar}>
                <View
                  className={styles.progressFill}
                  style={{ width: `${(user.creditScore / 100) * 100}%` }}
                />
              </View>
            </View>
          </View>
        </View>
        <View className={styles.metricGrid}>
          <View className={styles.metricItem}>
            <View className={styles.metricIcon}>✅</View>
            <View className={styles.metricInfo}>
              <Text className={styles.metricValue}>已实名</Text>
              <Text className={styles.metricLabel}>身份认证完成</Text>
            </View>
          </View>
          <View className={styles.metricItem}>
            <View className={styles.metricIcon}>📊</View>
            <View className={styles.metricInfo}>
              <Text className={styles.metricValue}>{user.successRate}%</Text>
              <Text className={styles.metricLabel}>交易成功率</Text>
            </View>
          </View>
          <View className={styles.metricItem}>
            <View className={styles.metricIcon}>📝</View>
            <View className={styles.metricInfo}>
              <Text className={styles.metricValue}>{user.totalDeals}</Text>
              <Text className={styles.metricLabel}>历史成交次数</Text>
            </View>
          </View>
          <View className={styles.metricItem}>
            <View className={styles.metricIcon}>🛡️</View>
            <View className={styles.metricInfo}>
              <Text className={styles.metricValue}>0次</Text>
              <Text className={styles.metricLabel}>纠纷申诉记录</Text>
            </View>
          </View>
        </View>
      </View>

      {menuGroups.map(group => (
        <View key={group.title} className={styles.menuSection}>
          <Text className={styles.menuTitle}>{group.title}</Text>
          {group.items.map((item, idx) => (
            <View
              key={idx}
              className={styles.menuItem}
              onClick={item.action}
            >
              <Text className={styles.menuIcon}>{item.icon}</Text>
              <Text className={styles.menuText}>{item.text}</Text>
              {item.badge && <Text className={styles.menuBadge}>{item.badge}</Text>}
              <Text className={styles.menuArrow}>›</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

export default ProfilePage;
