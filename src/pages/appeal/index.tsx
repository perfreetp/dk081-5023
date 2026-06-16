import { useState } from 'react'
import { View, Text, Button, Textarea, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import styles from './index.module.scss'
import { mockOrders } from '../../data/orders'
import { mockAccounts } from '../../data/accounts'

type AppealType = 'recovery' | 'inconsistent' | 'binding' | 'fraud' | 'other'

const appealTypes: { key: AppealType; icon: string; title: string; desc: string }[] = [
  { key: 'recovery', icon: '🔙', title: '账号被找回', desc: '卖家通过身份验证等方式恶意找回账号' },
  { key: 'inconsistent', icon: '⚠️', title: '描述不实', desc: '账号段位、皮肤、装备等与卖家描述不符' },
  { key: 'binding', icon: '🔐', title: '换绑失败', desc: '手机号、邮箱、实名等信息无法正常换绑' },
  { key: 'fraud', icon: '🚨', title: '疑似诈骗', desc: '卖家失联、拒绝配合、诱导私下交易等' },
  { key: 'other', icon: '❓', title: '其他问题', desc: '除以上类型外的其他交易纠纷' },
]

const evidenceTips = [
  { icon: '📱', text: '登录失败截图：账号无法登录的错误提示页面' },
  { icon: '💬', text: '聊天记录：与卖家的沟通记录，尤其是承诺内容' },
  { icon: '💰', text: '交易凭证：平台订单、转账记录等支付凭证' },
  { icon: '📸', text: '对比截图：描述内容与实际不符的对比证据' },
  { icon: '⏰', text: '时间证据：发现问题的时间点、操作时间线' },
]

const mockProgress = [
  { status: 'done', title: '申诉提交', desc: '等待平台审核（预计2小时内）', time: '2025-01-15 14:30' },
  { status: 'current', title: '客服处理中', desc: '正在核实双方证据并联系当事人', time: '2025-01-15 16:12' },
  { status: 'pending', title: '仲裁判定', desc: '根据双方证据和平台规则判定结果', time: '' },
  { status: 'pending', title: '执行退款/放款', desc: '按判定结果执行资金处理', time: '' },
]

export default function AppealPage() {
  const router = useRouter()
  const mockProgressMode = router.params.mock === 'progress' || router.params.mock === 'result'
  const mockResultMode = router.params.mock === 'result'

  const [activeTab, setActiveTab] = useState<'new' | 'progress'>(mockProgressMode ? 'progress' : 'new')
  const [appealType, setAppealType] = useState<AppealType>('recovery')
  const [description, setDescription] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [evidences, setEvidences] = useState<string[]>([
    'https://picsum.photos/seed/appeal1/400/400',
    'https://picsum.photos/seed/appeal2/400/400',
  ])

  const relatedOrder = mockOrders[0]
  const relatedAccount = mockAccounts.find(a => a.id === relatedOrder.accountId) || mockAccounts[0]

  const handleSelectType = (type: AppealType) => {
    setAppealType(type)
  }

  const handleAddEvidence = () => {
    if (evidences.length >= 9) {
      Taro.showToast({ title: '最多上传9张图片', icon: 'none' })
      return
    }
    const newEvidence = `https://picsum.photos/seed/evidence${Date.now()}/400/400`
    setEvidences([...evidences, newEvidence])
  }

  const handleDeleteEvidence = (index: number) => {
    setEvidences(evidences.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (!description.trim()) {
      Taro.showToast({ title: '请填写问题描述', icon: 'none' })
      return
    }
    if (evidences.length === 0) {
      Taro.showToast({ title: '请上传至少1张证据', icon: 'none' })
      return
    }
    Taro.showModal({
      title: '确认提交申诉',
      content: '提交后平台将在2小时内介入处理，请保持手机畅通',
      confirmText: '确认提交',
      confirmColor: '#10B981',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '申诉已提交', icon: 'success' })
          setTimeout(() => {
            setActiveTab('progress')
          }, 800)
        }
      }
    })
  }

  const handleGoOrder = () => {
    Taro.navigateTo({ url: `/pages/order-detail/index?id=${relatedOrder.id}` })
  }

  const handleContactService = () => {
    Taro.showToast({ title: '正在接入专属客服...', icon: 'loading' })
  }

  const canSubmit = description.trim().length > 0 && evidences.length > 0

  return (
    <View className={styles.page}>
      <View className={styles.headerBanner}>
        <View className={styles.bannerTitle}>
          <Text className={styles.bannerIcon}>⚖️</Text>
          <Text className={styles.bannerTitleText}>公平公正 · 快速处理</Text>
        </View>
        <Text className={styles.bannerDesc}>
          平台承诺 <strong>2小时内响应</strong>，<strong>24小时内出具处理结果</strong>。
          全程资金担保，根据双方证据判定，保障合法权益。
        </Text>
      </View>

      <View className={styles.tabs}>
        <View
          className={`${styles.tabItem} ${activeTab === 'new' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('new')}
        >
          发起申诉
        </View>
        <View
          className={`${styles.tabItem} ${activeTab === 'progress' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          申诉进度
        </View>
      </View>

      {activeTab === 'new' ? (
        <>
          <View className={styles.section}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionTitleIcon}>📦</Text>
              <Text className={styles.sectionTitleText}>关联订单</Text>
            </View>
            <View className={styles.orderSelect} onClick={handleGoOrder}>
              <View className={styles.orderInfo}>
                <Text className={styles.orderLabel}>订单号</Text>
                <Text className={styles.orderValue}>{relatedAccount.title} · {relatedOrder.id}</Text>
              </View>
              <Text className={styles.orderAction}>查看 ›</Text>
            </View>
          </View>

          <View className={styles.section}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionTitleIcon}>🏷️</Text>
              <Text className={styles.sectionTitleText}>选择申诉类型</Text>
            </View>
            <View className={styles.typeList}>
              {appealTypes.map((type) => (
                <View
                  key={type.key}
                  className={`${styles.typeCard} ${appealType === type.key ? styles.typeCardActive : ''}`}
                  onClick={() => handleSelectType(type.key)}
                >
                  <View className={styles.typeIcon}>{type.icon}</View>
                  <View className={styles.typeInfo}>
                    <Text className={styles.typeTitle}>{type.title}</Text>
                    <Text className={styles.typeDesc}>{type.desc}</Text>
                  </View>
                  <View className={styles.typeCheck}>✓</View>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.section}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionTitleIcon}>📝</Text>
              <Text className={styles.sectionTitleText}>描述问题</Text>
            </View>
            <View className={styles.formGroup}>
              <View className={styles.formLabel}>
                <Text>问题描述</Text>
                <Text className={styles.formRequired}>*</Text>
              </View>
              <Textarea
                className={styles.textarea}
                placeholder='请详细描述问题情况，包括发现时间、具体表现、与卖家沟通情况等，越详细越有助于处理'
                value={description}
                onInput={(e) => setDescription(e.detail.value)}
                maxlength={500}
              />
              <View className={styles.textareaCount}>{description.length}/500</View>
            </View>
            <View className={styles.formGroup}>
              <View className={styles.formLabel}>
                <Text>联系电话</Text>
              </View>
              <Textarea
                className={styles.textarea}
                style={{ minHeight: '80rpx' }}
                placeholder='请填写手机号，方便客服联系您（选填）'
                value={contactPhone}
                onInput={(e) => setContactPhone(e.detail.value)}
                maxlength={11}
              />
            </View>
          </View>

          <View className={styles.section}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionTitleIcon}>📎</Text>
              <Text className={styles.sectionTitleText}>上传证据</Text>
            </View>
            <View className={styles.uploadArea} onClick={handleAddEvidence}>
              <Text className={styles.uploadIcon}>📷</Text>
              <Text className={styles.uploadText}>点击上传证据图片</Text>
              <Text className={styles.uploadHint}>已传 {evidences.length}/9 · 建议截图包含时间戳</Text>
            </View>
            {evidences.length > 0 && (
              <View className={styles.uploadedList}>
                {evidences.map((img, i) => (
                  <View key={i} className={styles.uploadedItem}>
                    <Image className={styles.uploadedImg} src={img} mode='aspectFill' />
                    <View className={styles.uploadedDelete} onClick={() => handleDeleteEvidence(i)}>✕</View>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View className={styles.section}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionTitleIcon}>💡</Text>
              <Text className={styles.sectionTitleText}>证据准备建议</Text>
            </View>
            <View className={styles.tipList}>
              {evidenceTips.map((tip, i) => (
                <View key={i} className={styles.tipItem}>
                  <Text className={styles.tipIcon}>{tip.icon}</Text>
                  <Text>{tip.text}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.footerBar}>
            <Button
              className={`${styles.submitBtn} ${!canSubmit ? styles.submitBtnDisabled : ''}`}
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              提交申诉 · 2小时内响应
            </Button>
          </View>
        </>
      ) : (
        <>
          {mockResultMode ? (
            <View className={styles.section}>
              <View className={styles.resultCard}>
                <Text className={styles.resultIcon}>🎉</Text>
                <Text className={styles.resultTitle}>申诉成功 · 全额退款</Text>
                <Text className={styles.resultDesc}>
                  平台核实您的证据有效，判定账号被卖家找回。
                  {"\n"}款项将原路退回至您的支付账户，1-3个工作日到账
                </Text>
                <View className={styles.resultAmount}>
                  <Text className={styles.resultAmountLabel}>退款金额</Text>
                  <Text className={styles.resultAmountValue}>¥{(relatedOrder.price + relatedOrder.serviceFee).toLocaleString()}</Text>
                </View>
              </View>
            </View>
          ) : null}

          <View className={`${styles.section} ${styles.progressCard}`}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionTitleIcon}>📋</Text>
              <Text className={styles.sectionTitleText}>申诉单 #AP20250115001</Text>
            </View>
            <View className={styles.progressHeader}>
              <View className={styles.progressStatus}>
                <Text className={styles.progressIcon}>{mockResultMode ? '✅' : '⏳'}</Text>
                <Text className={styles.progressStatusText}>
                  {mockResultMode ? '处理完成' : '客服处理中'}
                </Text>
              </View>
              <Text className={styles.progressTime}>
                {mockResultMode ? '已用时 18小时' : '已用时 1小时42分'}
              </Text>
            </View>
            <View className={styles.progressSteps}>
              {mockProgress.map((step, i) => (
                <View
                  key={i}
                  className={`${styles.progressStepItem} ${
                    step.status === 'done'
                      ? styles.progressStepDone
                      : step.status === 'current'
                      ? styles.progressStepCurrent
                      : ''
                  }`}
                >
                  <View className={styles.progressStepCircle}>
                    {step.status === 'done' ? '✓' : i + 1}
                  </View>
                  <View className={styles.progressStepContent}>
                    <Text className={styles.progressStepTitle}>{step.title}</Text>
                    <Text className={styles.progressStepDesc}>{step.desc}</Text>
                    {step.time && <Text className={styles.progressStepTime}>{step.time}</Text>}
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.footerBar}>
            <View className={styles.footerBtns}>
              <Button className={styles.secondaryBtn} onClick={handleGoOrder}>
                查看订单
              </Button>
              <Button className={styles.primaryBtn} onClick={handleContactService}>
                联系处理客服
              </Button>
            </View>
          </View>
        </>
      )}
    </View>
  )
}
