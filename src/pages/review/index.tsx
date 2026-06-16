import { useState, useMemo, useEffect } from 'react'
import { View, Text, Button, Textarea, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import styles from './index.module.scss'
import { formatPrice } from '../../utils/format'
import { useAppStore } from '@/stores'

const positiveTags = [
  '验号速度快', '账号描述一致', '换绑流程顺畅', '沟通态度好',
  '配合度高', '资料齐全', '问题响应及时', '发货速度快',
  '价格合理', '实名信息完善', '后续可联系', '安全可靠'
]

const negativeTags = [
  '描述略有出入', '换绑等待较长', '沟通回复慢', '资料需要补充',
  '价格偏高', '部分信息遗漏', '流程不熟悉', '态度一般'
]

const quickPhrases = [
  '整个交易流程很顺利，平台验号很放心！',
  '账号和描述完全一致，卖家配合度很高',
  '担保交易很有安全感，下次还会来',
  '换绑指引很详细，新手也能轻松操作'
]

const ratingTexts = [
  { text: '非常差', class: styles.ratingBad },
  { text: '较差', class: styles.ratingBad },
  { text: '一般', class: styles.ratingMid },
  { text: '满意', class: styles.ratingGood },
  { text: '非常满意', class: styles.ratingExcellent },
]

export default function ReviewPage() {
  const router = useRouter()
  const orderId = router.params.orderId || 'o3'
  const getOrder = useAppStore(s => s.getOrder)
  const addReview = useAppStore(s => s.addReview)
  const hasReviewedOrder = useAppStore(s => s.hasReviewedOrder)
  const updateOrderStatus = useAppStore(s => s.updateOrderStatus)
  const addToBlacklist = useAppStore(s => s.addToBlacklist)
  const removeFromBlacklist = useAppStore(s => s.removeFromBlacklist)
  const isBlacklisted = useAppStore(s => s.isBlacklisted)

  const order = useMemo(() => getOrder(orderId) || useAppStore.getState().orders[0], [orderId, getOrder])
  const account = useMemo(() => order.account, [order])
  const seller = useMemo(() => order.seller, [order])
  const sellerBlacklisted = isBlacklisted(seller.id)
  const alreadyReviewed = hasReviewedOrder(order.id)

  useEffect(() => {
    if (alreadyReviewed) {
      Taro.showToast({ title: '您已对此订单评价', icon: 'none' })
      setTimeout(() => {
        Taro.redirectTo({ url: `/pages/order-detail/index?id=${order.id}` })
      }, 1000)
    }
  }, [alreadyReviewed, order.id])

  const [overallRating, setOverallRating] = useState(5)
  const [subRatings, setSubRatings] = useState({
    accurate: 5,
    speed: 5,
    attitude: 5,
    process: 5,
  })
  const [selectedPosTags, setSelectedPosTags] = useState<string[]>([])
  const [selectedNegTags, setSelectedNegTags] = useState<string[]>([])
  const [comment, setComment] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [isBlacklist, setIsBlacklist] = useState(false)
  const [anonymous, setAnonymous] = useState(false)

  const handleStarClick = (value: number) => setOverallRating(value)

  const handleSubStarClick = (key: keyof typeof subRatings, value: number) => {
    setSubRatings(prev => ({ ...prev, [key]: value }))
  }

  const togglePosTag = (tag: string) => {
    setSelectedPosTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const toggleNegTag = (tag: string) => {
    setSelectedNegTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleAddImage = () => {
    if (images.length >= 6) {
      Taro.showToast({ title: '最多上传6张', icon: 'none' })
      return
    }
    setImages([...images, `https://picsum.photos/seed/review${Date.now()}/400/400`])
  }

  const handleDeleteImage = (i: number) => {
    setImages(images.filter((_, idx) => idx !== i))
  }

  const handleQuickPhrase = (phrase: string) => {
    setComment(prev => prev ? `${prev} ${phrase}` : phrase)
  }

  const toggleBlacklist = () => {
    if (!sellerBlacklisted && !isBlacklist) {
      Taro.showModal({
        title: '加入黑名单',
        content: '加入黑名单后，将不会再看到该卖家发布的商品，且对方无法与您发起聊天',
        confirmText: '确认加入',
        confirmColor: '#EF4444',
        success: (res) => {
          if (res.confirm) {
            addToBlacklist(seller.id)
            setIsBlacklist(true)
            Taro.showToast({ title: '已加入黑名单', icon: 'none' })
          }
        }
      })
    } else {
      if (sellerBlacklisted) {
        removeFromBlacklist(seller.id)
      }
      setIsBlacklist(false)
      Taro.showToast({ title: '已移除黑名单', icon: 'none' })
    }
  }

  const handleSubmit = () => {
    if (overallRating === 0) {
      Taro.showToast({ title: '请选择评分', icon: 'none' })
      return
    }
    if (alreadyReviewed) {
      Taro.showToast({ title: '您已评价，不能重复提交', icon: 'none' })
      return
    }
    Taro.showModal({
      title: '确认提交评价',
      content: `综合 ${overallRating} 星评价，${selectedPosTags.length + selectedNegTags.length}个标签，${comment.length > 0 ? comment.length + '字评价' : '无文字评价'}${(isBlacklist || sellerBlacklisted) ? '；卖家将被加入黑名单' : ''}`,
      confirmText: '确认提交',
      confirmColor: '#10B981',
      success: (res) => {
        if (res.confirm) {
          const review = addReview({
            orderId: order.id,
            revieweeId: seller.id,
            rating: overallRating,
            subRatings,
            tags: [...selectedPosTags, ...selectedNegTags],
            content: comment,
            images: images.length > 0 ? images : undefined,
            isAnonymous: anonymous,
          })
          if (!review) {
            Taro.showToast({ title: '您已评价，不能重复提交', icon: 'none' })
            return
          }
          if (isBlacklist && !sellerBlacklisted) {
            addToBlacklist(seller.id)
          }
          updateOrderStatus(order.id, 'completed')
          Taro.showToast({ title: '评价成功！信用已更新', icon: 'success' })
          setTimeout(() => Taro.redirectTo({ url: `/pages/order-detail/index?id=${order.id}` }), 1000)
        }
      }
    })
  }

  const renderStars = (rating: number, onStarClick?: (v: number) => void, large?: boolean) => {
    return (
      <View className={large ? styles.starsRow : styles.subStars}>
        {[1, 2, 3, 4, 5].map((v) => (
          <Text
            key={v}
            className={v <= rating ? (large ? styles.starActive : styles.subStarActive) : (large ? styles.star : styles.subStar)}
            onClick={() => onStarClick && onStarClick(v)}
          >
            ★
          </Text>
        ))}
      </View>
    )
  }

  const avgSubRating = Math.round(
    (subRatings.accurate + subRatings.speed + subRatings.attitude + subRatings.process) / 4
  )

  return (
    <View className={styles.page}>
      <View className={styles.heroCard}>
        <View className={styles.heroTitle}>
          <Text className={styles.heroIcon}>🎉</Text>
          <Text className={styles.heroTitleText}>交易成功！为本次服务打个分吧</Text>
        </View>
        <Text className={styles.heroDesc}>
          您的评价将帮助其他买家判断卖家信用，也会影响卖家的信用等级
        </Text>
        <View className={styles.heroAccount}>
          <Image className={styles.heroCover} src={account.coverImage} mode='aspectFill' />
          <View className={styles.heroAccountInfo}>
            <Text className={styles.heroAccountTitle} numberOfLines={1}>{account.title}</Text>
            <Text className={styles.heroAccountMeta}>{account.gameName} · {account.server}</Text>
            <Text className={styles.heroAccountPrice}>{formatPrice(order.price)}</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionTitleIcon}>⭐</Text>
          <Text className={styles.sectionTitleText}>综合评分</Text>
        </View>
        <View className={styles.overallRating}>
          <Text className={styles.ratingLabel}>请选择您的满意程度</Text>
          {renderStars(overallRating, handleStarClick, true)}
          <Text className={`${styles.ratingText} ${ratingTexts[overallRating - 1]?.class}`}>
            {ratingTexts[overallRating - 1]?.text || '请选择'}
          </Text>
          <Text className={styles.ratingHint}>点击星星即可评分，1星最差，5星最好</Text>
        </View>

        <View className={styles.subRatings}>
          {[
            { key: 'accurate' as const, label: '描述相符', value: subRatings.accurate },
            { key: 'speed' as const, label: '交易速度', value: subRatings.speed },
            { key: 'attitude' as const, label: '沟通态度', value: subRatings.attitude },
            { key: 'process' as const, label: '换绑配合', value: subRatings.process },
          ].map((item) => (
            <View key={item.key} className={styles.subRatingItem}>
              <Text className={styles.subRatingLabel}>{item.label}</Text>
              {renderStars(item.value, (v) => handleSubStarClick(item.key, v))}
              <Text className={styles.subRatingValue}>{item.value}.0</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.tagSection}>
        <View className={styles.tagGroup}>
          <View className={styles.tagGroupTitle}>👍 好评标签（可多选）</View>
          <View className={styles.tagList}>
            {positiveTags.map((tag) => (
              <View
                key={tag}
                className={`${styles.tagItem} ${selectedPosTags.includes(tag) ? styles.tagItemActive : ''}`}
                onClick={() => togglePosTag(tag)}
              >
                {selectedPosTags.includes(tag) && '✓ '}{tag}
              </View>
            ))}
          </View>
        </View>

        {overallRating <= 3 && (
          <View className={styles.tagGroup}>
            <View className={styles.tagGroupTitle}>⚠️ 待改进点（可多选）</View>
            <View className={styles.tagList}>
              {negativeTags.map((tag) => (
                <View
                  key={tag}
                  className={`${styles.tagItemNeg} ${selectedNegTags.includes(tag) ? styles.tagItemNegActive : ''} ${styles.tagItem}`}
                  onClick={() => toggleNegTag(tag)}
                >
                  {selectedNegTags.includes(tag) && '✓ '}{tag}
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionTitleIcon}>📝</Text>
          <Text className={styles.sectionTitleText}>文字评价</Text>
        </View>
        <View className={styles.textareaGroup}>
          <Textarea
            className={styles.textarea}
            placeholder={
              overallRating >= 4
                ? '分享一下这次交易的愉快体验，帮助其他买家放心选购...'
                : '客观描述本次交易的问题，帮助我们改进服务...'
            }
            value={comment}
            onInput={(e) => setComment(e.detail.value)}
            maxlength={300}
          />
          <View className={styles.textareaCount}>
            <View>
              <Text className={styles.countText}>快捷短语：</Text>
            </View>
            <Text className={styles.countText}>{comment.length}/300</Text>
          </View>
          <View className={styles.quickPhrases}>
            {quickPhrases.map((phrase, i) => (
              <View key={i} className={styles.phraseBtn} onClick={() => handleQuickPhrase(phrase)}>
                {phrase.slice(0, 10)}...
              </View>
            ))}
          </View>
        </View>

        <View className={styles.uploadSection}>
          <View className={styles.uploadLabel}>
            <Text>📷 上传图片凭证</Text>
            <Text className={styles.uploadLabelNote}>（选填，最多6张）</Text>
          </View>
          <View className={styles.uploadArea}>
            {images.map((img, i) => (
              <View key={i} className={styles.uploadItem}>
                <Image className={styles.uploadImg} src={img} mode='aspectFill' />
                <View
                  style={{
                    position: 'absolute', top: 6, right: 6, width: 36, height: 36,
                    borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff',
                    fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  onClick={() => handleDeleteImage(i)}
                >✕</View>
              </View>
            ))}
            {images.length < 6 && (
              <View className={styles.uploadBtn} onClick={handleAddImage}>
                <Text className={styles.uploadBtnIcon}>+</Text>
                <Text className={styles.uploadBtnText}>{images.length}/6</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionTitleIcon}>👤</Text>
          <Text className={styles.sectionTitleText}>卖家信息</Text>
        </View>
        <View className={styles.sellerSection}>
          <View className={styles.sellerInfo}>
            <View className={styles.sellerAvatar}>{seller.avatarEmoji}</View>
            <View className={styles.sellerDetail}>
              <View className={styles.sellerName}>
                {seller.nickname}
                {seller.realNameVerified && <View className={styles.verifiedBadge}>已实名</View>}
              </View>
              <Text className={styles.sellerStats}>
                成交{seller.totalSales} · 好评率{seller.goodRate}% · 信用{avgSubRating >= 4 ? '优秀' : avgSubRating >= 3 ? '良好' : '一般'}
              </Text>
            </View>
          </View>
          <View
            className={`${styles.blacklistBtn} ${(isBlacklist || sellerBlacklisted) ? styles.blacklistBtnActive : ''}`}
            onClick={toggleBlacklist}
          >
            <Text>{(isBlacklist || sellerBlacklisted) ? '✓ 已拉黑' : '🚫 拉黑'}</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionTitleIcon}>💡</Text>
          <Text className={styles.sectionTitleText}>评价须知</Text>
        </View>
        <View className={styles.noticeList}>
          <View className={styles.noticeItem}>
            <Text className={styles.noticeIcon}>✅</Text>
            <Text>评价将在双方互评或7天后自动公开，所有用户可见</Text>
          </View>
          <View className={styles.noticeItem}>
            <Text className={styles.noticeIcon}>🔒</Text>
            <Text>黑名单功能可屏蔽该卖家的所有商品展示和聊天请求</Text>
          </View>
          <View className={styles.noticeItem}>
            <Text className={styles.noticeIcon}>⚖️</Text>
            <Text>恶意差评、广告灌水等违规评价将被平台删除并处理</Text>
          </View>
          <View className={styles.noticeItem}>
            <Text className={styles.noticeIcon}>🏆</Text>
            <Text>真实评价帮助建立可信交易环境，感谢您的贡献！</Text>
          </View>
        </View>
      </View>

      <View className={styles.footerBar}>
        <View className={styles.footerTip}>
          综合 {overallRating} 星 · {selectedPosTags.length + selectedNegTags.length}个标签
          {anonymous && ' · 匿名评价'}
        </View>
        <Button
          className={`${styles.submitBtn} ${overallRating === 0 ? styles.submitBtnDisabled : ''}`}
          disabled={overallRating === 0}
          onClick={handleSubmit}
        >
          提交评价
        </Button>
      </View>
    </View>
  )
}
