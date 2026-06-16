import { useMemo } from 'react'
import { View, Image, Text, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import styles from './index.module.scss'
import { mockAccounts } from '../../data/accounts'
import { mockUsers } from '../../data/users'
import { creditLevelInfo } from '../../data/users'
import { formatPrice, maskPhone } from '../../utils/format'

export default function AccountDetail() {
  const router = useRouter()
  const accountId = router.params.id || mockAccounts[0].id

  const account = useMemo(() => {
    return mockAccounts.find(a => a.id === accountId) || mockAccounts[0]
  }, [accountId])

  const seller = useMemo(() => {
    return mockUsers.find(u => u.id === account.sellerId) || mockUsers[0]
  }, [account])

  const creditInfo = creditLevelInfo[seller.creditLevel]

  const guaranteeItems = [
    { icon: '🔒', title: '资金担保', desc: '验号通过再放款' },
    { icon: '✅', title: '平台验号', desc: '36项专业检测' },
    { icon: '🛡️', title: '找回包赔', desc: '90天售后保障' },
    { icon: '📞', title: '专属客服', desc: '7x24小时在线' },
  ]

  const handleNegotiate = () => {
    Taro.navigateTo({ url: `/pages/chat/index?userId=${seller.id}&accountId=${account.id}` })
  }

  const handleBuyNow = () => {
    Taro.showModal({
      title: '确认下单',
      content: `将冻结担保金 ${formatPrice(account.price)}，平台将先验号再放款给卖家`,
      confirmText: '确认冻结',
      confirmColor: '#10B981',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '下单成功', icon: 'success' })
          setTimeout(() => {
            Taro.navigateTo({ url: '/pages/verify/index?mock=1' })
          }, 800)
        }
      }
    })
  }

  const handleViewVerifyReport = () => {
    Taro.navigateTo({ url: '/pages/verify/index?mock=1' })
  }

  const handleAppeal = () => {
    Taro.navigateTo({ url: '/pages/appeal/index' })
  }

  return (
    <View className={styles.page}>
      <View className={styles.coverSection}>
        <Image
          className={styles.coverImage}
          src={account.coverImage}
          mode='aspectFill'
        />
        {account.verifyReport && (
          <View className={styles.verifyBadge}>✓ 已验号</View>
        )}
        <View className={styles.imageCount}>{account.images.length} 张图</View>
      </View>

      <View className={styles.infoCard}>
        <View className={styles.priceRow}>
          <Text className={styles.currentPrice}>{formatPrice(account.price)}</Text>
          {account.originalPrice && (
            <Text className={styles.originalPrice}>{formatPrice(account.originalPrice)}</Text>
          )}
          <View className={`${styles.priceTag} ${account.negotiable ? styles.negotiable : styles.fixed}`}>
            {account.negotiable ? '可议价' : '一口价'}
          </View>
        </View>

        <View className={styles.titleRow}>
          <Text className={styles.title}>{account.title}</Text>
          <View className={styles.gameTag}>{account.gameName}</View>
        </View>

        <View className={styles.metaRow}>
          <View className={styles.metaItem}>
            <Text>区服</Text>
            <Text className={styles.metaValue}>{account.server}</Text>
          </View>
          <View className={styles.metaItem}>
            <Text>发布于</Text>
            <Text className={styles.metaValue}>{account.publishedAt}</Text>
          </View>
          <View className={styles.metaItem}>
            <Text>浏览</Text>
            <Text className={styles.metaValue}>{account.viewCount}</Text>
          </View>
        </View>

        <View className={styles.tagList}>
          {account.tags.map((tag, i) => {
            let tagClass = styles.tag
            if (tag.type === 'rank') tagClass = styles.tagRank
            else if (tag.type === 'skin') tagClass = styles.tagSkin
            else if (tag.type === 'equip') tagClass = styles.tagEquip
            return (
              <View key={i} className={`${styles.tag} ${tagClass}`}>
                {tag.value}
              </View>
            )
          })}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionTitleText}>🛡️ 平台担保保障</Text>
        </View>
        <View className={styles.guaranteeList}>
          {guaranteeItems.map((item, i) => (
            <View key={i} className={styles.guaranteeItem}>
              <Text className={styles.guaranteeIcon}>{item.icon}</Text>
              <View className={styles.guaranteeText}>
                <strong>{item.title}</strong>
                {item.desc}
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionTitleText}>👤 卖家信息</Text>
          <Text className={styles.sectionAction} onClick={handleAppeal}>申诉</Text>
        </View>
        <View className={styles.sellerCard}>
          <View className={styles.sellerAvatar}>
            {seller.avatarEmoji}
          </View>
          <View className={styles.sellerInfo}>
            <View className={styles.sellerNameRow}>
              <Text className={styles.sellerName}>{seller.nickname}</Text>
              {seller.realNameVerified && (
                <View className={styles.verifiedBadge}>已实名</View>
              )}
              <View className={`${styles.creditLevel} ${seller.creditLevel === 'excellent' ? styles.creditExcellent : styles.creditGood}`}>
                {creditInfo.label}
              </View>
            </View>
            <View className={styles.sellerStats}>
              <View className={styles.sellerStat}>成交 <strong>{seller.totalSales}</strong></View>
              <View className={styles.sellerStat}>好评率 <strong>{seller.goodRate}%</strong></View>
              <View className={styles.sellerStat}>入驻 <strong>{seller.daysActive}天</strong></View>
            </View>
          </View>
        </View>
      </View>

      {account.verifyReport && (
        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleText}>📋 平台验号报告</Text>
            <Text className={styles.sectionAction} onClick={handleViewVerifyReport}>查看详情</Text>
          </View>
          <View className={styles.reportSummary}>
            <View className={styles.reportItem}>
              <Text className={styles.reportValue}>{account.verifyReport.items.filter(i => i.passed).length}</Text>
              <Text className={styles.reportLabel}>通过项</Text>
            </View>
            <View className={styles.reportItem}>
              <Text className={styles.reportValue}>{account.verifyReport.items.filter(i => i.warning).length}</Text>
              <Text className={styles.reportLabel}>提示项</Text>
            </View>
            <View className={styles.reportItem}>
              <Text className={styles.reportValue}>{account.verifyReport.verifyTime}</Text>
              <Text className={styles.reportLabel}>验号用时</Text>
            </View>
          </View>
          <View className={styles.reportList}>
            {account.verifyReport.items.slice(0, 4).map((item, i) => (
              <View key={i} className={styles.reportCheck}>
                <View className={styles.reportCheckLeft}>
                  <Text>{item.passed ? '✅' : '⚠️'}</Text>
                  <Text>{item.name}</Text>
                </View>
                <Text className={item.passed ? styles.pass : ''}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionTitleText}>📝 账号描述</Text>
        </View>
        <Text className={styles.description}>{account.description}</Text>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionTitleText}>🖼️ 账号截图</Text>
        </View>
        <View className={styles.imageGrid}>
          {account.images.map((img, i) => (
            <Image
              key={i}
              className={styles.gridImage}
              src={img}
              mode='aspectFill'
            />
          ))}
        </View>
      </View>

      <View className={styles.footerBar}>
        <Button className={styles.footerIconBtn}>
          <Text className={styles.footerIcon}>💬</Text>
          <Text className={styles.footerIconText}>咨询</Text>
        </Button>
        <View className={styles.footerBtns}>
          {account.negotiable && (
            <Button className={styles.secondaryBtn} onClick={handleNegotiate}>
              议价
            </Button>
          )}
          <Button className={styles.primaryBtn} onClick={handleBuyNow}>
            立即购买（先冻结）
          </Button>
        </View>
      </View>
    </View>
  )
}
