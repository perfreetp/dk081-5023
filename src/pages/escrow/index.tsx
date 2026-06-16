import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import ProgressStep from '@/components/ProgressStep';
import { orderStatusLabels } from '@/data/orders';
import { formatCountdown, formatPriceFull } from '@/utils/format';
import { useAppStore } from '@/stores';
import styles from './index.module.scss';

type TabKey = 'all' | 'buyer' | 'seller';
type SubTabKey = 'all' | 'pending' | 'processing' | 'completed' | 'appealing';

const EscrowPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [activeSubTab, setActiveSubTab] = useState<SubTabKey>('all');
  const currentUserId = useAppStore(s => s.currentUser.id);
  const getOrdersByUser = useAppStore(s => s.getOrdersByUser);
  const allOrders = useAppStore(s => s.orders);

  const userOrders = useMemo(() => {
    let list = getOrdersByUser(currentUserId, activeTab);
    if (activeTab === 'all') list = getOrdersByUser(currentUserId, 'all');
    switch (activeSubTab) {
      case 'pending':
        list = list.filter(o => ['pending_payment', 'pending_verify', 'verify_done'].includes(o.status));
        break;
      case 'processing':
        list = list.filter(o => ['verifying', 'pending_binding', 'binding'].includes(o.status));
        break;
      case 'completed':
        list = list.filter(o => ['completed', 'refunded'].includes(o.status));
        break;
      case 'appealing':
        list = list.filter(o => o.status === 'appealing');
        break;
    }
    return list;
  }, [activeTab, activeSubTab]);

  const stats = useMemo(() => {
    const all = getOrdersByUser(currentUserId, 'all');
    const processing = all.filter(o => 
      ['pending_payment', 'pending_verify', 'verifying', 'verify_done', 'pending_binding', 'binding'].includes(o.status)
    ).length;
    const totalSpent = all.filter(o => o.buyerId === currentUserId && o.status === 'completed')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const totalEarned = all.filter(o => o.sellerId === currentUserId && o.status === 'completed')
      .reduce((sum, o) => sum + o.finalPrice - o.serviceFee, 0);
    return { processing, totalSpent, totalEarned };
  }, [currentUserId, getOrdersByUser]);

  const handleCardClick = (orderId: string) => {
    console.log('[EscrowPage] Open order detail:', orderId);
    Taro.navigateTo({ url: `/pages/order-detail/index?id=${orderId}` });
  };

  const handleAction = (action: string, orderId: string) => {
    console.log('[EscrowPage] Action:', action, 'order:', orderId);
    switch (action) {
      case 'confirm':
        Taro.showModal({ title: '确认验号通过', content: '确认验号无误后将进入换绑流程，请仔细核对验号报告', success: () => Taro.showToast({ title: '已确认', icon: 'success' }) });
        break;
      case 'appeal':
        Taro.navigateTo({ url: `/pages/appeal/index?orderId=${orderId}` });
        break;
      case 'review':
        Taro.navigateTo({ url: `/pages/review/index?orderId=${orderId}` });
        break;
      case 'chat':
        Taro.switchTab({ url: '/pages/chat/index' });
        break;
      default:
        Taro.showToast({ title: '功能开发中', icon: 'none' });
    }
  };

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'all', label: '全部' },
    { key: 'buyer', label: '我是买家', count: getOrdersByUser(currentUserId, 'buyer').length },
    { key: 'seller', label: '我是卖家', count: getOrdersByUser(currentUserId, 'seller').length },
  ];

  const subTabs: { key: SubTabKey; label: string }[] = [
    { key: 'all', label: '全部状态' },
    { key: 'pending', label: '待处理' },
    { key: 'processing', label: '进行中' },
    { key: 'completed', label: '已完成' },
    { key: 'appealing', label: '申诉中' },
  ];

  return (
    <ScrollView scrollY className={styles.page} enableBackToTop>
      <View className={styles.headerCard}>
        <View className={styles.headerTop}>
          <View className={styles.headerTitle}>
            <View className={styles.headerIcon}>🛡️</View>
            <Text className={styles.headerText}>担保交易中心</Text>
          </View>
          <Text className={styles.headerBadge}>资金安全保障</Text>
        </View>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.processing}</Text>
            <Text className={styles.statLabel}>进行中订单</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{formatPriceFull(Math.floor(stats.totalSpent))}</Text>
            <Text className={styles.statLabel}>累计购买</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{formatPriceFull(Math.floor(stats.totalEarned))}</Text>
            <Text className={styles.statLabel}>累计出售</Text>
          </View>
        </View>
      </View>

      <View className={styles.tabs}>
        {tabs.map(tab => (
          <Text
            key={tab.key}
            className={classnames(styles.tabItem, activeTab === tab.key && styles.active)}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <Text className={styles.tabCount}>{tab.count}</Text>
            )}
          </Text>
        ))}
      </View>

      <View className={styles.subTabs}>
        {subTabs.map(tab => (
          <Text
            key={tab.key}
            className={classnames(styles.subTabItem, activeSubTab === tab.key && styles.active)}
            onClick={() => setActiveSubTab(tab.key)}
          >
            {tab.label}
          </Text>
        ))}
      </View>

      <View className={styles.listSection}>
        {userOrders.length > 0 ? (
          userOrders.map(order => {
            const statusInfo = orderStatusLabels[order.status];
            const isBuyer = order.buyerId === currentUserId;
            return (
              <View
                key={order.id}
                className={styles.orderCard}
                onClick={() => handleCardClick(order.id)}
              >
                <View className={styles.orderHeader}>
                  <View className={styles.orderLeft}>
                    <View className={styles.orderIcon}>📋</View>
                    <Text className={styles.orderNo}>订单号 {order.orderNo}</Text>
                    <Text
                      className={classnames(styles.roleTag, !isBuyer && styles.seller)}
                      onClick={(e) => { e.stopPropagation(); }}
                    >
                      {isBuyer ? '买家' : '卖家'}
                    </Text>
                  </View>
                  <Text
                    className={styles.statusBadge}
                    style={{ background: `${statusInfo.color}15`, color: statusInfo.color }}
                  >
                    {statusInfo.label}
                  </Text>
                </View>

                <View className={styles.accountRow}>
                  <View className={styles.accountCover}>
                    <Image
                      className={styles.coverImg}
                      src={order.account.coverImage}
                      mode='aspectFill'
                      onError={(e) => console.error('[EscrowPage] Image error:', e)}
                    />
                  </View>
                  <View className={styles.accountInfo}>
                    <View>
                      <Text className={styles.accountTitle}>{order.account.title}</Text>
                      <View className={styles.accountMeta}>
                        <Text className={styles.gameTag}>{order.account.gameName}</Text>
                        <Text className={styles.rankTag}>{order.account.rank}</Text>
                        <Text style={{ fontSize: '20rpx', color: '#94A3B8' }}>
                          {order.account.serverName}
                        </Text>
                      </View>
                    </View>
                    <View className={styles.accountPrice}>
                      <Text className={styles.priceValue}>
                        <Text className={styles.pricePrefix}>¥</Text>
                        {order.finalPrice.toLocaleString()}
                      </Text>
                      <Text className={styles.priceHint}>
                        {isBuyer ? '(含服务费)' : `(服务费 ¥${order.serviceFee})`}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className={styles.progressSection}>
                  {order.countdownSeconds > 0 && (
                    <View className={styles.countdownRow}>
                      <Text className={styles.countdownLabel}>
                        <Text>⏰</Text>
                        <Text>当前步骤剩余</Text>
                      </Text>
                      <Text className={styles.countdownValue}>
                        {formatCountdown(order.countdownSeconds)}
                      </Text>
                    </View>
                  )}
                  <ProgressStep steps={order.steps} compact />
                </View>

                {order.hasRiskWarning && (
                  <View className={styles.riskWarning}>
                    <Text className={styles.warningIcon}>⚠️</Text>
                    <Text className={styles.warningText}>
                      <Text className={styles.warningStrong}>风险预警：</Text>
                      {order.riskWarningMessage}
                    </Text>
                  </View>
                )}

                <View className={styles.actionsRow} onClick={(e) => e.stopPropagation()}>
                  {order.status === 'verify_done' && isBuyer && (
                    <>
                      <View className={classnames(styles.actionBtn, styles.danger)} onClick={() => handleAction('appeal', order.id)}>
                        <Text>信息不符申诉</Text>
                      </View>
                      <View className={classnames(styles.actionBtn, styles.primary)} onClick={() => handleAction('confirm', order.id)}>
                        <Text>确认验号通过</Text>
                      </View>
                    </>
                  )}
                  {order.status === 'binding' && isBuyer && (
                    <View className={classnames(styles.actionBtn, styles.primary)} onClick={() => handleCardClick(order.id)}>
                      <Text>查看换绑指引</Text>
                    </View>
                  )}
                  {order.status === 'completed' && (
                    <>
                      <View className={styles.actionBtn} onClick={() => handleAction('chat', order.id)}>
                        <Text>联系对方</Text>
                      </View>
                      <View className={classnames(styles.actionBtn, styles.primary)} onClick={() => handleAction('review', order.id)}>
                        <Text>去评价</Text>
                      </View>
                    </>
                  )}
                  {order.status === 'verifying' && !isBuyer && (
                    <View className={classnames(styles.actionBtn, styles.warning)} onClick={() => handleAction('chat', order.id)}>
                      <Text>催促验号</Text>
                    </View>
                  )}
                  {(order.status === 'pending_binding' || order.status === 'binding') && !isBuyer && (
                    <View className={classnames(styles.actionBtn, styles.primary)} onClick={() => handleCardClick(order.id)}>
                      <Text>协助换绑</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📦</Text>
            <Text className={styles.emptyText}>暂无相关订单</Text>
            <Text className={styles.emptyHint}>去首页挑选心仪的账号吧～</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default EscrowPage;
