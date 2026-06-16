import { useState, useEffect, useMemo } from 'react'
import { View, Text, Button, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import styles from './index.module.scss'
import { useAppStore } from '@/stores'
import type { VerifyReport } from '@/types'

type VerifyStep = 'login' | 'basic' | 'assets' | 'security' | 'report'

const stepNavs: { key: VerifyStep; index: string; title: string }[] = [
  { key: 'login', index: '1', title: '账号登录' },
  { key: 'basic', index: '2', title: '基础信息' },
  { key: 'assets', index: '3', title: '资产核对' },
  { key: 'security', index: '4', title: '安全检测' },
  { key: 'report', index: '5', title: '验号报告' },
]

const createFallbackReport = (accountId: string): VerifyReport => ({
  id: `v_${accountId}`,
  reportId: `VRP${Date.now()}`,
  accountId,
  verifier: '平台验号师-小王',
  verifyTime: '5分30秒',
  levelMatched: true,
  itemsMatched: true,
  descriptionMatched: true,
  screenshots: [],
  notes: '账号信息与描述基本一致，各项指标正常，推荐放心购买。',
  riskLevel: 'low',
  score: 92,
  totalItems: 12,
  items: [
    { id: 'f1', name: '账号可正常登录', value: '正常', category: 'basic', passed: true, warning: false },
    { id: 'f2', name: '账号状态', value: '无封禁/冻结', category: 'basic', passed: true, warning: false },
    { id: 'f3', name: '防沉迷限制', value: '已成年', category: 'basic', passed: true, warning: false },
    { id: 'f4', name: '段位信息', value: '与描述一致', category: 'basic', passed: true, warning: false },
    { id: 'f5', name: '资产核对', value: '与描述一致', category: 'assets', passed: true, warning: false },
    { id: 'f6', name: '密保手机绑定', value: '已绑定可换绑', category: 'security', passed: true, warning: true, note: '需买家配合换绑' },
    { id: 'f7', name: '实名认证状态', value: '已实名可换绑', category: 'security', passed: true, warning: false },
    { id: 'f8', name: '历史找回记录', value: '无', category: 'security', passed: true, warning: false },
    { id: 'f9', name: '账号申诉记录', value: '无', category: 'security', passed: true, warning: false },
    { id: 'f10', name: '交易风险评估', value: '低风险', category: 'security', passed: true, warning: false },
  ],
})

export default function VerifyPage() {
  const router = useRouter()
  const mockReportMode = router.params.mock === '1'
  const orderIdFromRoute = router.params.orderId
  const accountIdFromRoute = router.params.accountId

  const getOrder = useAppStore(s => s.getOrder)
  const getAccount = useAppStore(s => s.getAccount)

  const [currentStep, setCurrentStep] = useState<VerifyStep>(mockReportMode ? 'report' : 'login')
  const [loginImages, setLoginImages] = useState<string[]>(mockReportMode ? [
    'https://picsum.photos/seed/login1/400/400',
    'https://picsum.photos/seed/login2/400/400',
  ] : [])
  const [basicImages, setBasicImages] = useState<string[]>(mockReportMode ? [
    'https://picsum.photos/seed/basic1/400/400',
  ] : [])
  const [assetsImages, setAssetsImages] = useState<string[]>(mockReportMode ? [
    'https://picsum.photos/seed/assets1/400/400',
    'https://picsum.photos/seed/assets2/400/400',
    'https://picsum.photos/seed/assets3/400/400',
  ] : [])

  const order = useMemo(() => {
    if (orderIdFromRoute) return getOrder(orderIdFromRoute) || undefined
    return undefined
  }, [orderIdFromRoute, getOrder])

  const account = useMemo(() => {
    if (order) return order.account
    if (accountIdFromRoute) return getAccount(accountIdFromRoute)
    return getAccount('a1')
  }, [order, accountIdFromRoute, getAccount])

  const orderForNav = order || useAppStore.getState().getOrders()[0]

  const verifyReport = useMemo(() => {
    if (account?.verifyReport) return account.verifyReport
    return createFallbackReport(account?.id || 'unknown')
  }, [account])

  const [timer, setTimer] = useState({ h: '00', m: mockReportMode ? '05' : '10', s: mockReportMode ? '23' : '00' })

  useEffect(() => {
    if (mockReportMode) return
    const interval = setInterval(() => {
      setTimer(prev => {
        let h = parseInt(prev.h)
        let m = parseInt(prev.m)
        let s = parseInt(prev.s)
        if (s > 0) s--
        else if (m > 0) { m--; s = 59 }
        else if (h > 0) { h--; m = 59; s = 59 }
        return {
          h: String(h).padStart(2, '0'),
          m: String(m).padStart(2, '0'),
          s: String(s).padStart(2, '0'),
        }
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [mockReportMode])

  const addImage = (setter: React.Dispatch<React.SetStateAction<string[]>>, current: string[]) => {
    if (current.length >= 9) {
      Taro.showToast({ title: '最多上传9张', icon: 'none' })
      return
    }
    const newImg = `https://picsum.photos/seed/${Date.now()}/400/400`
    setter([...current, newImg])
  }

  const deleteImage = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    current: string[],
    index: number
  ) => {
    setter(current.filter((_, i) => i !== index))
  }

  const handleNextStep = () => {
    const stepOrder: VerifyStep[] = ['login', 'basic', 'assets', 'security', 'report']
    const idx = stepOrder.indexOf(currentStep)
    if (idx < stepOrder.length - 1) {
      setCurrentStep(stepOrder[idx + 1])
      Taro.pageScrollTo({ scrollTop: 0, duration: 200 })
    }
  }

  const handlePrevStep = () => {
    const stepOrder: VerifyStep[] = ['login', 'basic', 'assets', 'security', 'report']
    const idx = stepOrder.indexOf(currentStep)
    if (idx > 0) {
      setCurrentStep(stepOrder[idx - 1])
      Taro.pageScrollTo({ scrollTop: 0, duration: 200 })
    }
  }

  const handleConfirmReport = () => {
    if (order) {
      Taro.showModal({
        title: '确认验号结果',
        content: '确认验号结果与描述一致？确认后将进入换绑环节，资金将继续冻结至换绑完成',
        confirmText: '确认无误',
        confirmColor: '#10B981',
        success: (res) => {
          if (res.confirm) {
            Taro.showToast({ title: '确认通过', icon: 'success' })
            setTimeout(() => {
              Taro.redirectTo({ url: `/pages/order-detail/index?id=${order.id}` })
            }, 800)
          }
        }
      })
    } else {
      Taro.showModal({
        title: '验号报告预览',
        content: '此为验号报告预览。下单并进入担保交易后，将由平台验号师进行正式验号并出具完整报告。是否返回账号详情？',
        confirmText: '返回详情',
        cancelText: '继续查看',
        confirmColor: '#10B981',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateBack()
          }
        }
      })
    }
  }

  const handleDispute = () => {
    if (order) {
      Taro.showModal({
        title: '描述不符申诉',
        content: '如验号结果与卖家描述存在重大差异，可发起申诉。平台将介入核实，确认后可全额退款',
        confirmText: '发起申诉',
        cancelText: '再想想',
        confirmColor: '#EF4444',
        success: (res) => {
          if (res.confirm) {
            Taro.redirectTo({ url: `/pages/appeal/index?orderId=${order.id}` })
          }
        }
      })
    } else {
      Taro.showModal({
        title: '发起申诉',
        content: '此为验号报告预览，暂无法发起申诉。请先下单进入担保交易，如验号结果不符可随时发起退款申诉。',
        confirmText: '我知道了',
        showCancel: false,
        confirmColor: '#3B82F6',
      })
    }
  }

  const canNext = (() => {
    switch (currentStep) {
      case 'login': return loginImages.length >= 2
      case 'basic': return basicImages.length >= 1
      case 'assets': return assetsImages.length >= 2
      case 'security': return true
      default: return false
    }
  })()

  const passCount = verifyReport.items.filter(i => i.passed).length
  const warnCount = verifyReport.items.filter(i => i.warning).length

  const UploadImageBlock = ({
    label, hint, images, setImages, min
  }: {
    label: string; hint: string; images: string[]; setImages: React.Dispatch<React.SetStateAction<string[]>>; min?: number
  }) => (
    <View className={styles.uploadSection}>
      <View className={styles.uploadLabel}>
        {label} {min && <Text style={{ color: '#94A3B8' }}>（至少{min}张）</Text>}
      </View>
      <View className={styles.uploadArea} onClick={() => addImage(setImages, images)}>
        <Text className={styles.uploadIcon}>📷</Text>
        <Text className={styles.uploadText}>{hint}</Text>
        <Text className={styles.uploadHint}>已传 {images.length}/9 张</Text>
      </View>
      {images.length > 0 && (
        <View className={styles.uploadedImages}>
          {images.map((img, i) => (
            <View key={i} className={styles.uploadedItem}>
              <Image className={styles.uploadedImg} src={img} mode='aspectFill' />
              <View className={styles.uploadedDelete} onClick={() => deleteImage(setImages, images, i)}>✕</View>
            </View>
          ))}
        </View>
      )}
    </View>
  )

  return (
    <View className={styles.page}>
      <View className={styles.heroBanner}>
        <View className={styles.heroTitle}>
          <Text className={styles.heroIcon}>🔍</Text>
          <Text className={styles.heroTitleText}>平台专业验号</Text>
        </View>
        <Text className={styles.heroDesc}>
          平台验号员正在按标准流程核验账号信息，全程图文留痕，
          如有不符可立即申诉退款
        </Text>
        <View className={styles.heroStats}>
          <View className={styles.heroStat}>
            <Text className={styles.heroStatValue}>{timer.h}:{timer.m}:{timer.s}</Text>
            <Text className={styles.heroStatLabel}>剩余验号时间</Text>
          </View>
          <View className={styles.heroStat}>
            <Text className={styles.heroStatValue}>{verifyReport.totalItems}项</Text>
            <Text className={styles.heroStatLabel}>检测维度</Text>
          </View>
          <View className={styles.heroStat}>
            <Text className={styles.heroStatValue}>{verifyReport.verifyTime}</Text>
            <Text className={styles.heroStatLabel}>预计用时</Text>
          </View>
        </View>
      </View>

      <View className={styles.stepsNav}>
        {stepNavs.map((nav) => (
          <View
            key={nav.key}
            className={`${styles.stepNavItem} ${currentStep === nav.key ? styles.stepNavActive : ''}`}
            onClick={() => (mockReportMode || stepNavs.indexOf(nav) <= stepNavs.findIndex(s => s.key === currentStep)) && setCurrentStep(nav.key)}
          >
            <Text className={styles.stepNavIndex}>{nav.index}</Text>
            {nav.title}
          </View>
        ))}
      </View>

      {currentStep === 'login' && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionTitleIcon}>🔐</Text>
              <Text className={styles.sectionTitleText}>账号登录验证</Text>
            </View>
            <View className={`${styles.sectionBadge} ${styles.badgeCurrent}`}>进行中</View>
          </View>

          <View className={styles.accountLoginBox}>
            <View className={styles.loginTitle}>📌 验号员已使用以下信息登录</View>
            <View className={styles.loginRow}>
              <Text className={styles.loginLabel}>登录方式</Text>
              <Text className={styles.loginValue}>手机验证码</Text>
            </View>
            <View className={styles.loginRow}>
              <Text className={styles.loginLabel}>登录账号</Text>
              <Text className={styles.loginValue}>138****6688</Text>
            </View>
            <View className={styles.loginRow}>
              <Text className={styles.loginLabel}>登录时间</Text>
              <Text className={styles.loginValue}>2025-01-15 10:23:45</Text>
            </View>
            <View className={styles.loginRow}>
              <Text className={styles.loginLabel}>登录状态</Text>
              <Text className={styles.loginValue} style={{ color: '#10B981' }}>✓ 登录成功</Text>
            </View>
          </View>

          <View className={styles.checkItemList}>
            {[
              { name: '账号可正常登录', status: 'done', value: '登录成功' },
              { name: '无封禁/冻结状态', status: 'done', value: '状态正常' },
              { name: '非防沉迷限制', status: 'done', value: '已成年' },
              { name: '异地登录保护', status: mockReportMode ? 'done' : 'pending', value: mockReportMode ? '已通过验证' : '待验证' },
            ].map((item, i) => (
              <View key={i} className={`${styles.checkItem} ${item.status === 'done' ? styles.checkItemDone : ''}`}>
                <View className={`${styles.checkIcon} ${item.status === 'done' ? styles.iconPass : styles.iconPending}`}>
                  {item.status === 'done' ? '✓' : i + 1}
                </View>
                <View className={styles.checkInfo}>
                  <Text className={styles.checkName}>{item.name}</Text>
                  <Text className={styles.checkValue}>{item.value}</Text>
                </View>
                <Text className={`${styles.checkStatus} ${item.status === 'done' ? styles.statusPass : styles.statusPending}`}>
                  {item.status === 'done' ? '通过' : '待验证'}
                </Text>
              </View>
            ))}
          </View>

          <UploadImageBlock
            label='登录凭证截图'
            hint='上传登录成功页面、个人中心页面截图'
            images={loginImages}
            setImages={setLoginImages}
            min={2}
          />
        </View>
      )}

      {currentStep === 'basic' && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionTitleIcon}>📋</Text>
              <Text className={styles.sectionTitleText}>基础信息核验</Text>
            </View>
            <View className={`${styles.sectionBadge} ${styles.badgeCurrent}`}>进行中</View>
          </View>

          <View className={styles.checkItemList}>
            {verifyReport.items.filter(i => i.category === 'basic').map((item, i) => (
              <View
                key={i}
                className={`${styles.checkItem} ${item.passed ? styles.checkItemDone : item.warning ? styles.checkItemWarning : ''}`}
              >
                <View className={`${styles.checkIcon} ${item.passed ? styles.iconPass : item.warning ? styles.iconWarn : styles.iconPending}`}>
                  {item.passed ? '✓' : item.warning ? '!' : '○'}
                </View>
                <View className={styles.checkInfo}>
                  <Text className={styles.checkName}>{item.name}</Text>
                  <Text className={styles.checkValue}>{item.value}</Text>
                </View>
                <Text className={`${styles.checkStatus} ${item.passed ? styles.statusPass : item.warning ? styles.statusWarn : styles.statusPending}`}>
                  {item.passed ? '一致' : item.warning ? '有差异' : '待核验'}
                </Text>
              </View>
            ))}
          </View>

          <UploadImageBlock
            label='基础信息截图'
            hint='上传个人资料、游戏主页、段位展示等截图'
            images={basicImages}
            setImages={setBasicImages}
            min={1}
          />
        </View>
      )}

      {currentStep === 'assets' && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionTitleIcon}>💎</Text>
              <Text className={styles.sectionTitleText}>皮肤/资产核对</Text>
            </View>
            <View className={`${styles.sectionBadge} ${styles.badgeCurrent}`}>进行中</View>
          </View>

          <View className={styles.checkItemList}>
            {verifyReport.items.filter(i => i.category === 'assets').map((item, i) => (
              <View
                key={i}
                className={`${styles.checkItem} ${item.passed ? styles.checkItemDone : ''}`}
              >
                <View className={`${styles.checkIcon} ${item.passed ? styles.iconPass : styles.iconPending}`}>
                  {item.passed ? '✓' : '○'}
                </View>
                <View className={styles.checkInfo}>
                  <Text className={styles.checkName}>{item.name}</Text>
                  <Text className={styles.checkValue}>{item.value}</Text>
                </View>
                <Text className={`${styles.checkStatus} ${item.passed ? styles.statusPass : styles.statusPending}`}>
                  {item.passed ? '一致' : '待核验'}
                </Text>
              </View>
            ))}
          </View>

          <UploadImageBlock
            label='资产截图'
            hint='上传英雄列表、皮肤展示、背包仓库、装备详情等截图'
            images={assetsImages}
            setImages={setAssetsImages}
            min={2}
          />
        </View>
      )}

      {currentStep === 'security' && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionTitleIcon}>🛡️</Text>
              <Text className={styles.sectionTitleText}>安全风险检测</Text>
            </View>
            <View className={`${styles.sectionBadge} ${mockReportMode ? styles.badgeDone : styles.badgeCurrent}`}>
              {mockReportMode ? '已完成' : '进行中'}
            </View>
          </View>

          <View className={styles.checkItemList}>
            {verifyReport.items.filter(i => i.category === 'security').map((item, i) => (
              <View
                key={i}
                className={`${styles.checkItem} ${item.passed ? styles.checkItemDone : item.warning ? styles.checkItemWarning : ''}`}
              >
                <View className={`${styles.checkIcon} ${item.passed ? styles.iconPass : item.warning ? styles.iconWarn : styles.iconPending}`}>
                  {item.passed ? '✓' : item.warning ? '!' : '○'}
                </View>
                <View className={styles.checkInfo}>
                  <Text className={styles.checkName}>{item.name}</Text>
                  <Text className={styles.checkValue}>{item.value} {item.note && `· ${item.note}`}</Text>
                </View>
                <Text className={`${styles.checkStatus} ${item.passed ? styles.statusPass : item.warning ? styles.statusWarn : styles.statusPending}`}>
                  {item.passed ? '安全' : item.warning ? '注意' : '检测中'}
                </Text>
              </View>
            ))}
          </View>

          <View className={styles.uploadSection}>
            <View className={styles.uploadLabel}>安全状态截图</View>
            <View className={styles.uploadedImages}>
              {['https://picsum.photos/seed/sec1/400/400', 'https://picsum.photos/seed/sec2/400/400'].map((img, i) => (
                <View key={i} className={styles.uploadedItem}>
                  <Image className={styles.uploadedImg} src={img} mode='aspectFill' />
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {currentStep === 'report' && (
        <View className={`${styles.section} ${styles.summaryCard}`}>
          <View className={styles.sectionHeader}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionTitleIcon}>📊</Text>
              <Text className={styles.sectionTitleText}>验号报告</Text>
            </View>
            <View className={`${styles.sectionBadge} ${styles.badgeDone}`}>
              报告ID: {verifyReport.reportId.slice(-8)}
            </View>
          </View>

          <View className={styles.scoreCircle}>
            <View className={styles.scoreInner}>
              <Text className={styles.scoreValue}>{verifyReport.score}</Text>
              <Text className={styles.scoreLabel}>综合评分</Text>
            </View>
          </View>

          <View className={styles.summaryGrid}>
            <View className={styles.summaryStat}>
              <Text className={`${styles.summaryValue} ${styles.valuePass}`}>{passCount}</Text>
              <Text className={styles.summaryLabel}>核验通过</Text>
            </View>
            <View className={styles.summaryStat}>
              <Text className={`${styles.summaryValue} ${styles.valueWarn}`}>{warnCount}</Text>
              <Text className={styles.summaryLabel}>提示注意</Text>
            </View>
            <View className={styles.summaryStat}>
              <Text className={`${styles.summaryValue} ${styles.valueFail}`}>0</Text>
              <Text className={styles.summaryLabel}>严重不符</Text>
            </View>
          </View>

          {warnCount > 0 && (
            <View className={styles.reportSection}>
              <View className={styles.reportWarningBox}>
                <View className={styles.warningTitle}>
                  <Text>⚠️</Text>
                  <Text>需要注意的差异项</Text>
                </View>
                <Text className={styles.warningDesc}>
                  {verifyReport.items.filter(i => i.warning).map(i => i.note).join('；')}
                  {"\n"}以上为系统提示，不影响账号正常使用，请知悉
                </Text>
              </View>
            </View>
          )}

          <View className={styles.reportSection}>
            <View className={styles.reportSectionTitle}>详细核验结果</View>
            <View className={styles.reportCheckList}>
              {verifyReport.items.slice(0, 10).map((item, i) => (
                <View key={i} className={styles.reportCheckItem}>
                  <View className={styles.reportCheckLeft}>
                    <Text>{item.passed ? '✅' : item.warning ? '⚠️' : '❌'}</Text>
                    <Text>{item.name}</Text>
                  </View>
                  <Text className={`${styles.reportCheckRight} ${item.warning ? 'warn' : ''}`}>
                    {item.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {!mockReportMode ? (
        <View className={styles.footerBar}>
          <View className={styles.footerBtns}>
            {currentStep !== 'login' && (
              <Button className={styles.secondaryBtn} onClick={handlePrevStep}>
                上一步
              </Button>
            )}
            {currentStep !== 'report' ? (
              <Button
                className={`${styles.primaryBtn} ${!canNext ? styles.primaryBtnDisabled : ''}`}
                disabled={!canNext}
                onClick={handleNextStep}
              >
                {stepNavs[stepNavs.findIndex(s => s.key === currentStep) + 1]
                  ? `下一步：${stepNavs[stepNavs.findIndex(s => s.key === currentStep) + 1].title}`
                  : '生成报告'}
              </Button>
            ) : (
              <>
                <Button className={styles.secondaryBtn} onClick={handleDispute}>
                  描述不符申诉
                </Button>
                <Button className={styles.primaryBtn} onClick={handleConfirmReport}>
                  确认无误 · 进入换绑
                </Button>
              </>
            )}
          </View>
        </View>
      ) : (
        <View className={styles.footerBar}>
          <View className={styles.footerBtns}>
            <Button className={styles.secondaryBtn} onClick={handleDispute}>
              描述不符申诉
            </Button>
            <Button className={styles.primaryBtn} onClick={handleConfirmReport}>
              确认无误 · 进入换绑
            </Button>
          </View>
        </View>
      )}
    </View>
  )
}
