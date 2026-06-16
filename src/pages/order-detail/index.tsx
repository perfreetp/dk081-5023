import { useMemo, useEffect, useState } from 'react'
import { View, Image, Text, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import styles from './index.module.scss'
import { mockOrders } from '../../data/orders'
import { mockAccounts } from '../../data/accounts'
import { mockUsers } from '../../data/users'
import { formatPrice, formatCountdown } from '../../utils/format'

export default function OrderDetail() {
  const router = useRouter()
  const orderId = router.params.id || mockOrders[0].id

  const [countdown, setCountdown] = useState('')

  const order = useMemo(() => {
    return mockOrders.find(o => o.id === orderId) || mockOrders[0]
  }, [orderId])

  const account = useMemo(() => {
    return mockAccounts.find(a => a.id === order.accountId) || mockAccounts[0]
  }, [order])

  const buyer = useMemo(() => {
    return mockUsers.find(u => u.id === order.buyerId) || mockUsers[0]
  }, [order])

  const seller = useMemo(() => {
    return mockUsers.find(u => u.id === order.sellerId) || mockUsers[0]
  }, [order])

  useEffect(() => {
    if (order.countdown) {
      const timer = setInterval(() => {
        setCountdown(formatCountdown(order.countdown!))
      }, 1000)
      setCountdown(formatCountdown(order.countdown!))
      return () => clearInterval(timer)
    }
  }, [order])

  const handleVerify = () => {
    Taro.navigateTo({ url: `/pages/verify/index?orderId=${order.id}` })
  }

  const handleBinding = () => {
    Taro.showToast({ title: '请按上方步骤操作', icon: 'none' })
  }

  const handleConfirmReceive = () => {
    Taro.showModal({
      title: '确认收货',
      content: '换绑已完成且账号正常使用？确认后平台将放款给卖家，进入90天售后保障期',
      confirmText: '确认收货',
      confirmColor: '#10B981',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已确认收货', icon: 'success' })
          setTimeout(() => {
            Taro.navigateTo({ url: `/pages/review/index?orderId=${order.id}` })
          }, 800)
        }
      }
    })
  }

  const handleAppeal = () => {
    Taro.navigateTo({ url: `/pages/appeal/index?orderId=${order.id}` })
  }

  const handleChatWithUser = (userId: string) => {
    Taro.navigateTo({ url: `/pages/chat/index?userId=${userId}&orderId=${order.id}` })
  }

  const handleContactService = () => {
    Taro.showToast({ title: '正在接入客服...', icon: 'loading' })
  }

  const parseCountdownParts = (str: string) => {
    const parts = str.split(':')
    return { h: parts[0] || '00', m: parts[1] || '00', s: parts[2] || '00' }
  }

  const countdownParts = parseCountdownParts(countdown)

  return (
    <View className={styles.page}>
      <View className={styles.statusHeader}>
        <View className={styles.statusRow}>
          <Text className={styles.statusTitle}>{order.currentStep.title}</Text>
          <View className={styles.statusBadge}>订单号: {order.id.slice(-8)}</View>
        </View>
        <Text className={styles.statusDesc}>{order.currentStep.description}</Text>
        {order.countdown && (
          <View className={styles.countdownCard}>
            <Text className={styles.countdownLabel}>⏰ 剩余处理时间</Text>
            <View className={styles.countdownTime}>
              <View className={styles.timeBlock}>{countdownParts.h}</View>
              <Text className={styles.timeSep}>:</Text>
              <View className={styles.timeBlock}>{countdownParts.m}</View>
              <Text className={styles.timeSep}>:</Text>
              <View className={styles.timeBlock}>{countdownParts.s}</View>
            </View>
          </View>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionTitleText}>📍 交易进度</Text>
        </View>
        <View className={styles.progressSteps}>
          {order.steps.map((step, i) => (
            <View
              key={i}
              className={`${styles.stepItem} ${
                step.status === 'done'
                  ? styles.stepDone
                  : step.status === 'current'
                  ? styles.stepCurrent
                  : styles.stepPending
              }`}
            >
              <View className={styles.stepCircle}>
                {step.status === 'done' ? '✓' : i + 1}
              </View>
              <View className={styles.stepContent}>
                <Text className={styles.stepTitle}>{step.title}</Text>
                <Text className={styles.stepDesc}>{step.description}</Text>
                {step.time && <Text className={styles.stepTime}>{step.time}</Text>}
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionTitleText}>🎮 账号信息</Text>
        </View>
        <View className={styles.accountCard}>
          <Image
            className={styles.accountCover}
            src={account.coverImage}
            mode='aspectFill'
          />
          <View className={styles.accountInfo}>
            <Text className={styles.accountTitle}>{account.title}</Text>
            <View className={styles.accountMeta}>
              <View className={styles.accountMetaItem}>游戏: <strong>{account.gameName}</strong></View>
              <View className={styles.accountMetaItem}>区服: <strong>{account.server}</strong></View>
            </View>
            <Text className={styles.accountPrice}>{formatPrice(order.price)}</Text>
          </View>
        </View>
      </View>

      {order.verifyRecords && order.verifyRecords.length > 0 && (
        <View className={`${styles.section} ${styles.verifySection}`}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleText}>✅ 验号图文留痕</Text>
            <Text className={styles.sectionAction} onClick={handleVerify}>查看完整报告</Text>
          </View>
          <View className={styles.verifySummary}>
            <View className={styles.verifyStat}>
              <Text className={styles.verifyStatValue}>{order.verifyRecords.length}</Text>
              <Text className={styles.verifyStatLabel}>检测项</Text>
            </View>
            <View className={styles.verifyStat}>
              <Text className={styles.verifyStatValue}>{order.verifyRecords.filter(r => r.passed).length}</Text>
              <Text className={styles.verifyStatLabel}>通过</Text>
            </View>
            <View className={styles.verifyStat}>
              <Text className={styles.verifyStatValue}>{order.verifyRecords.filter(r => r.warning).length}</Text>
              <Text className={styles.verifyStatLabel}>提示</Text>
            </View>
            <View className={styles.verifyStat}>
              <Text className={styles.verifyStatValue}>{account.verifyReport?.verifyTime || '—'}</Text>
              <Text className={styles.verifyStatLabel}>用时</Text>
            </View>
          </View>
          <View className={styles.verifyRecordList}>
            {order.verifyRecords.slice(0, 3).map((record, i) => (
              <View key={i} className={styles.verifyRecord}>
                <Image
                  className={styles.recordThumb}
                  src={record.image}
                  mode='aspectFill'
                />
                <View className={styles.recordInfo}>
                  <Text className={styles.recordTitle}>{record.itemName}</Text>
                  <View className={`${styles.recordResult} ${record.warning ? styles.recordWarn : styles.recordPass}`}>
                    {record.warning ? '⚠️' : '✓'} {record.warning ? record.note : '验证通过'}
                  </View>
                  <Text className={styles.recordTime}>{record.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {order.bindingGuide && order.bindingGuide.length > 0 && (
        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleText}>🔑 换绑步骤指引</Text>
            <Text className={styles.sectionAction} onClick={handleBinding}>
              {order.bindingGuide.filter(b => b.completed).length}/{order.bindingGuide.length} 已完成
            </Text>
          </View>
          <View className={styles.bindingSteps}>
            {order.bindingGuide.map((step, i) => (
              <View key={i} className={styles.bindingItem}>
                <View className={styles.bindingStep}>{step.completed ? '✓' : i + 1}</View>
                <View className={styles.bindingContent}>
                  <Text className={styles.bindingTitle}>{step.title}</Text>
                  <Text className={styles.bindingDesc}>{step.description}</Text>
                  {step.tip && <View className={styles.bindingTips}>💡 {step.tip}</View>}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {order.riskWarning && (
        <View className={`${styles.section} ${styles.riskCard}`}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleText}>🚨 售后风险预警</Text>
          </View>
          <View className={styles.riskHeader}>
            <Text className={styles.riskIcon}>⚠️</Text>
            <Text className={styles.riskTitle}>{order.riskWarning.title}</Text>
            <Text className={styles.riskCountdown}>{order.riskWarning.remainingDays}天后结束保障</Text>
          </View>
          <View className={styles.riskTipList}>
            {order.riskWarning.tips.map((tip, i) => (
              <View key={i} className={styles.riskTip}>
                <Text className={styles.riskTipIcon}>{tip.icon}</Text>
                <Text>{tip.text}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionTitleText}>📄 交易详情</Text>
        </View>
        <View className={styles.infoGrid}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>交易类型</Text>
            <Text className={styles.infoValue}>担保交易（先验后放款）</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>成交方式</Text>
            <Text className={styles.infoValue}>{order.negotiated ? '议价成交' : '一口价'}</Text>
          </View>
          <View className={styles.divider} />
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>买家</Text>
            <Text className={`${styles.infoValue} ${styles.infoValueHighlight}`}>
              {buyer.nickname} {buyer.realNameVerified ? '(已实名)' : ''}
            </Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>卖家</Text>
            <Text className={`${styles.infoValue} ${styles.infoValueHighlight}`}>
              {seller.nickname} {seller.realNameVerified ? '(已实名)' : ''}
            </Text>
          </View>
          <View className={styles.divider} />
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>账号金额</Text>
            <Text className={styles.infoValue}>{formatPrice(order.price)}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>平台服务费</Text>
            <Text className={styles.infoValue}>{formatPrice(order.serviceFee)}</Text>
          </View>
          <View className={styles.divider} />
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>合计</Text>
            <Text className={`${styles.infoValue} ${styles.infoValuePrice}`}>
              {formatPrice(order.price + order.serviceFee)}
            </Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>下单时间</Text>
            <Text className={styles.infoValue}>{order.createdAt}</Text>
          </View>
        </View>
      </View>

      <View className={styles.footerBar}>
        <View className={styles.footerBtnLeft}>
          <Button className={styles.secondaryBtn} onClick={handleAppeal}>
            申诉
          </Button>
          <Button className={styles.secondaryBtn} onClick={handleContactService}>
            客服
          </Button>
        </View>
        <View className={styles.footerBtnRight}>
          {order.currentStepKey === 'verify' && (
            <Button className={styles.primaryBtn} onClick={handleVerify}>
              查看验号
            </Button>
          )}
          {order.currentStepKey === 'binding' && (
            <Button className={styles.warnBtn} onClick={handleConfirmReceive}>
              确认收货放款
            </Button>
          )}
          {(order.currentStepKey === 'paid' || order.currentStepKey === 'verify') && (
            <Button className={styles.dangerBtn}>
              取消交易
            </Button>
          )}
          {order.currentStepKey === 'guarantee' && (
            <Button className={styles.primaryBtn} onClick={handleConfirmReceive}>
              已正常使用
            </Button>
          )}
          {order.currentStepKey === 'completed' && (
            <Button className={styles.primaryBtn} onClick={() => handleChatWithUser(seller.id)}>
              联系卖家
            </Button>
          )}
        </View>
      </View>
    </View>
  )
}
