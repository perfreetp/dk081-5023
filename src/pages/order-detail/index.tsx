import { useMemo, useEffect, useState } from 'react'
import { View, Image, Text, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import styles from './index.module.scss'
import { formatPrice, formatCountdown } from '../../utils/format'
import { useAppStore } from '@/stores'

const pad = (n: number) => String(n).padStart(2, '0')

const parseSecondsToParts = (secs: number) => {
  if (secs <= 0) return { h: '00', m: '00', s: '00' }
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return { h: pad(h), m: pad(m), s: pad(s) }
}

export default function OrderDetail() {
  const router = useRouter()
  const orderId = router.params.id || 'o1'
  const getOrder = useAppStore(s => s.getOrder)
  const getReviewsByOrder = useAppStore(s => s.getReviewsByOrder)
  const hasReviewedOrder = useAppStore(s => s.hasReviewedOrder)
  const currentUser = useAppStore(s => s.currentUser)

  const [countdownSecs, setCountdownSecs] = useState(0)

  const order = useMemo(() => {
    return getOrder(orderId) || useAppStore.getState().orders[0]
  }, [orderId, getOrder])

  const account = useMemo(() => order.account, [order])
  const buyer = useMemo(() => order.buyer, [order])
  const seller = useMemo(() => order.seller, [order])

  const orderReviews = useMemo(() => getReviewsByOrder(order.id), [order.id, getReviewsByOrder])
  const orderReview = orderReviews[0]
  const isBuyer = currentUser.id === buyer.id
  const canReviewNow = isBuyer && (order.status === 'completed' || order.currentStepKey === 'binding' || order.currentStepKey === 'verify_done') && !hasReviewedOrder(order.id)

  const handleGoReview = () => {
    Taro.navigateTo({ url: `/pages/review/index?orderId=${order.id}` })
  }

  const timeline = useMemo(() => {
    const list: {
      key: string;
      icon: string;
      title: string;
      desc: string;
      time?: string;
      operator?: string;
      status: 'done' | 'current' | 'pending';
      action?: { label: string; onClick: () => void };
      highlight?: boolean;
    }[] = [];

    const currentKey = order.currentStepKey;
    const stepOrder: { key: string; title: string; desc: string; icon: string }[] = [
      { key: 'pending_payment', title: '买家下单', desc: `${buyer.nickname} 提交订单并冻结担保资金`, icon: '📝' },
      { key: 'pending_verify', title: '买家付款完成', desc: '资金已进入平台担保账户，等待验号', icon: '💳' },
      { key: 'verifying', title: '平台验号中', desc: '平台验号师核对账号信息', icon: '🔍' },
      { key: 'verify_done', title: '验号报告出具', desc: '验号完成，报告已生成，等待买家确认', icon: '✅' },
      { key: 'pending_binding', title: '开始协助换绑', desc: '卖家配合平台进行账号信息交接', icon: '🔄' },
      { key: 'binding', title: '换绑确认中', desc: '买家确认换绑完成并登录验证', icon: '🔐' },
      { key: 'completed', title: '交易完成', desc: '平台放款给卖家，售后保障期开始', icon: '🎉' },
    ];

    const keyToIdx: Record<string, number> = {};
    stepOrder.forEach((s, i) => { keyToIdx[s.key] = i; });
    const currentIdx = keyToIdx[currentKey] ?? 0;

    const timeMap: Record<string, string | undefined> = {
      pending_payment: order.createdAt,
      pending_verify: order.payTime,
      verifying: order.verifyStartTime,
      verify_done: order.verifyEndTime,
      completed: order.completeTime,
    };

    const operatorMap: Record<string, string | undefined> = {
      pending_payment: `买家 ${buyer.nickname}`,
      pending_verify: '平台系统',
      verifying: '平台验号师',
      verify_done: '平台验号师',
      pending_binding: `卖家 ${seller.nickname}`,
      binding: `买家 ${buyer.nickname}`,
      completed: '平台系统',
    };

    stepOrder.forEach((step, i) => {
      let status: 'done' | 'current' | 'pending';
      if (i < currentIdx) status = 'done';
      else if (i === currentIdx) status = 'current';
      else status = 'pending';

      let action: { label: string; onClick: () => void } | undefined;
      if (step.key === 'verifying' || step.key === 'verify_done') {
        action = { label: '查看报告', onClick: handleVerify };
      }
      if (step.key === 'completed' && order.status === 'completed') {
        const reviewForOrder = useAppStore.getState().getReviewsByOrder(order.id);
        if (reviewForOrder.length > 0) {
          action = { label: '查看评价', onClick: () => Taro.pageScrollTo({ scrollTop: 1000, duration: 300 }) };
        }
      }

      list.push({
        key: step.key,
        icon: step.icon,
        title: step.title,
        desc: step.desc,
        time: timeMap[step.key],
        operator: operatorMap[step.key],
        status,
        action,
        highlight: step.key === 'verify_done',
      });
    });

    return list;
  }, [order, buyer.nickname, seller.nickname]);

  useEffect(() => {
    if (order.countdownSeconds > 0) {
      setCountdownSecs(order.countdownSeconds)
      const timer = setInterval(() => {
        setCountdownSecs(prev => Math.max(0, prev - 1))
      }, 1000)
      return () => clearInterval(timer)
    } else {
      setCountdownSecs(0)
    }
  }, [order])

  const countdownStr = useMemo(() => formatCountdown(countdownSecs), [countdownSecs])
  const countdownParts = useMemo(() => parseSecondsToParts(countdownSecs), [countdownSecs])

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

  return (
    <View className={styles.page}>
      <View className={styles.statusHeader}>
        <View className={styles.statusRow}>
          <Text className={styles.statusTitle}>{order.currentStep?.title || '订单详情'}</Text>
          <View className={styles.statusBadge}>订单号: {order.orderNo.slice(-8)}</View>
        </View>
        <Text className={styles.statusDesc}>{order.currentStep?.description || '请查看下方详细信息'}</Text>
        {countdownSecs > 0 && (
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

      <View className={`${styles.section} ${styles.timelineSection}`}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionTitleText}>📋 交易操作时间线</Text>
          <Text className={styles.sectionSubtitle}>买卖双方共同可见 · 纠纷举证依据</Text>
        </View>
        <View className={styles.timelineList}>
          {timeline.map((step, i) => (
            <View
              key={step.key}
              className={`${styles.timelineItem} ${
                step.status === 'done'
                  ? styles.timelineDone
                  : step.status === 'current'
                  ? styles.timelineCurrent
                  : styles.timelinePending
              } ${step.highlight && step.status !== 'pending' ? styles.timelineHighlight : ''}`}
            >
              <View className={styles.timelineLeft}>
                <View className={styles.timelineDot}>
                  <Text>{step.icon}</Text>
                </View>
                {i < timeline.length - 1 && (
                  <View className={`${styles.timelineLine} ${
                    step.status === 'done' ? styles.timelineLineDone : styles.timelineLinePending
                  }`} />
                )}
              </View>
              <View className={styles.timelineRight}>
                <View className={styles.timelineTitleRow}>
                  <Text className={styles.timelineTitle}>{step.title}</Text>
                  {step.status === 'current' && (
                    <View className={styles.timelineBadgeCurrent}>处理中</View>
                  )}
                  {step.status === 'done' && (
                    <View className={styles.timelineBadgeDone}>已完成</View>
                  )}
                </View>
                <Text className={styles.timelineDesc}>{step.desc}</Text>
                {step.operator && (
                  <View className={styles.timelineMeta}>
                    <Text className={styles.timelineOperator}>操作人：{step.operator}</Text>
                    {step.time && (
                      <Text className={styles.timelineTime}>{step.time}</Text>
                    )}
                  </View>
                )}
                {step.action && (
                  <View className={styles.timelineAction} onClick={step.action.onClick}>
                    <Text>{step.action.label} →</Text>
                  </View>
                )}
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

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionTitleText}>💬 交易评价</Text>
          {!orderReview && canReviewNow && (
            <Text className={styles.sectionAction} onClick={handleGoReview}>去评价 →</Text>
          )}
          {orderReview && (
            <Text className={styles.sectionSubtitle}>双方互评后展示</Text>
          )}
        </View>

        {orderReview ? (
          <View className={styles.reviewCard}>
            <View className={styles.reviewHeader}>
              <Image
                className={styles.reviewAvatar}
                src={orderReview.reviewer.avatar}
                mode='aspectFill'
              />
              <View className={styles.reviewUser}>
                <Text className={styles.reviewNickname}>{orderReview.reviewer.nickname}</Text>
                <View className={styles.reviewRatingRow}>
                  <Text className={`${styles.reviewRating} ${
                    orderReview.rating >= 4 ? styles.ratingGood : orderReview.rating === 3 ? styles.ratingNeutral : styles.ratingBad
                  }`}>
                    {'★'.repeat(orderReview.rating)}{'☆'.repeat(5 - orderReview.rating)} {orderReview.rating}.0
                  </Text>
                  <Text className={styles.reviewTime}>{orderReview.createTime}</Text>
                </View>
              </View>
            </View>
            {orderReview.tags && orderReview.tags.length > 0 && (
              <View className={styles.reviewTags}>
                {orderReview.tags.map((tag, i) => (
                  <View
                    key={i}
                    className={`${styles.reviewTag} ${
                      orderReview.rating >= 3 ? styles.reviewTagGood : styles.reviewTagBad
                    }`}
                  >
                    <Text>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
            {orderReview.content && (
              <Text className={styles.reviewContent}>{orderReview.content}</Text>
            )}
            {orderReview.images && orderReview.images.length > 0 && (
              <View className={styles.reviewImages}>
                {orderReview.images.map((img, i) => (
                  <Image
                    key={i}
                    className={styles.reviewImage}
                    src={img}
                    mode='aspectFill'
                    onClick={() => Taro.previewImage({ urls: orderReview.images!, current: img })}
                  />
                ))}
              </View>
            )}
            {orderReview.subRatings && (
              <View className={styles.reviewSubRatings}>
                {[
                  { key: 'accurate', label: '描述相符' },
                  { key: 'speed', label: '验号速度' },
                  { key: 'attitude', label: '沟通态度' },
                  { key: 'process', label: '换绑流程' },
                ].map(item => (
                  <View key={item.key} className={styles.subRatingItem}>
                    <Text className={styles.subRatingLabel}>{item.label}</Text>
                    <View className={styles.subRatingStars}>
                      {'★'.repeat(orderReview.subRatings![item.key as keyof typeof orderReview.subRatings])}
                      <Text className={styles.subRatingValue}>
                        {orderReview.subRatings![item.key as keyof typeof orderReview.subRatings]}.0
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : canReviewNow ? (
          <View className={styles.reviewEmpty} onClick={handleGoReview}>
            <View className={styles.reviewEmptyIcon}>⭐</View>
            <Text className={styles.reviewEmptyTitle}>还未评价此订单</Text>
            <Text className={styles.reviewEmptyDesc}>点击前往评价，您的评价将帮助其他买家判断</Text>
            <View className={styles.reviewEmptyBtn}>立即评价 →</View>
          </View>
        ) : (
          <View className={styles.reviewEmpty}>
            <Text className={styles.reviewEmptyTitle}>暂未评价</Text>
            <Text className={styles.reviewEmptyDesc}>
              {isBuyer ? '完成换绑确认后即可对卖家进行评价' : '等待买家完成交易后作出评价'}
            </Text>
          </View>
        )}
      </View>

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
          {(order.currentStepKey === 'verifying' || order.currentStepKey === 'verify_done') && (
            <Button className={styles.primaryBtn} onClick={handleVerify}>
              查看验号
            </Button>
          )}
          {(order.currentStepKey === 'binding' || order.currentStepKey === 'pending_binding') && (
            <Button className={styles.warnBtn} onClick={handleConfirmReceive}>
              确认收货放款
            </Button>
          )}
          {(order.currentStepKey === 'pending_verify' || order.currentStepKey === 'verifying') && (
            <Button className={styles.dangerBtn}>
              取消交易
            </Button>
          )}
          {order.currentStepKey === 'completed' && (
            <Button className={styles.primaryBtn} onClick={() => handleChatWithUser(seller.id)}>
              联系卖家
            </Button>
          )}
          {order.currentStepKey === 'verify_done' && (
            <Button className={styles.warnBtn} onClick={handleBinding}>
              进入换绑
            </Button>
          )}
        </View>
      </View>
    </View>
  )
}
