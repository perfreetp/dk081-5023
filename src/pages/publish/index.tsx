import React, { useState, useMemo } from 'react';
import { View, Text, Input, Textarea, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { gameCategories } from '@/data/games';
import { currentUser } from '@/data/users';
import styles from './index.module.scss';

const rankOptions = ['青铜', '白银', '黄金', '铂金', '钻石', '星耀', '王者', '荣耀王者', '大师', '宗师'];
const highlightTags = ['满英雄', '满皮肤', '可议价', '急售', '送保险', '支持验号', '秒换绑'];

const PublishPage: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rank, setRank] = useState('');
  const [heroCount, setHeroCount] = useState('');
  const [skinCount, setSkinCount] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceType, setPriceType] = useState<'fixed' | 'negotiable'>('fixed');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [images, setImages] = useState<string[]>([
    'https://picsum.photos/id/1/300/300',
    'https://picsum.photos/id/2/300/300',
  ]);
  const [agreed, setAgreed] = useState(false);

  const selectedGameInfo = useMemo(() => 
    gameCategories.find(g => g.id === selectedGame), [selectedGame]);

  const serviceFee = useMemo(() => {
    const p = parseFloat(price) || 0;
    return (p * 0.05).toFixed(2);
  }, [price]);

  const finalAmount = useMemo(() => {
    const p = parseFloat(price) || 0;
    return (p * 0.95).toFixed(2);
  }, [price]);

  const canSubmit = selectedGame && title && price && agreed && images.length > 0;

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleAddImage = () => {
    if (images.length >= 9) {
      Taro.showToast({ title: '最多上传9张图片', icon: 'none' });
      return;
    }
    const newImages = [
      ...images,
      `https://picsum.photos/id/${Math.floor(Math.random() * 200)}/300/300`,
    ];
    setImages(newImages);
    console.log('[PublishPage] Add image, total:', newImages.length);
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      Taro.showToast({ title: '请完善必填信息', icon: 'none' });
      return;
    }
    console.log('[PublishPage] Submit publish', {
      selectedGame, title, price, priceType, images,
    });
    Taro.showToast({ title: '发布成功，等待审核', icon: 'success' });
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.content}>
        <View className={styles.noticeCard}>
          <View className={styles.noticeTitle}>
            <Text>🛡️</Text>
            <Text>平台担保，安全交易</Text>
          </View>
          <View className={styles.noticeList}>
            <Text className={styles.noticeItem}>1. 平台先验号，买家满意后才放款给卖家</Text>
            <Text className={styles.noticeItem}>2. 必须完成实名认证才能发布和交易</Text>
            <Text className={styles.noticeItem}>3. 严禁发布盗号、找回等高风险账号</Text>
            <Text className={styles.noticeItem}>4. 平台收取5%服务费，无其他隐形费用</Text>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionIcon}>🎮</Text>
            <Text className={styles.sectionTitle}>选择游戏</Text>
          </View>
          <View className={styles.fieldRow}>
            <Text className={styles.fieldLabel}>
              游戏<Text className={styles.required}>*</Text>
            </Text>
            <View
              className={styles.selectBox}
              onClick={() => console.log('[PublishPage] Select game')}
            >
              <Text className={classnames(styles.selectValue, !selectedGame && styles.placeholder)}>
                {selectedGameInfo?.name || '请选择游戏'}
              </Text>
              <Text className={styles.arrow}>›</Text>
            </View>
          </View>
          {selectedGameInfo?.servers && (
            <View className={styles.fieldRow}>
              <Text className={styles.fieldLabel}>
                区服<Text className={styles.required}>*</Text>
              </Text>
              <View className={styles.tagSelectRow}>
                {selectedGameInfo.servers.map(s => (
                  <Text
                    key={s.id}
                    className={classnames(styles.tagOption, selectedServer === s.id && styles.active)}
                    onClick={() => setSelectedServer(s.id)}
                  >
                    {s.name}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionIcon}>📝</Text>
            <Text className={styles.sectionTitle}>账号信息</Text>
          </View>
          <View className={styles.fieldRow}>
            <Text className={styles.fieldLabel}>
              标题<Text className={styles.required}>*</Text>
            </Text>
            <View className={styles.inputBox}>
              <Input
                className={styles.input}
                placeholder='如：V10满英雄满皮肤 5荣耀水晶'
                maxlength={50}
                value={title}
                onInput={(e) => setTitle(e.detail.value)}
              />
            </View>
          </View>
          <View className={styles.fieldRow}>
            <Text className={styles.fieldLabel}>段位/等级</Text>
            <View className={styles.tagSelectRow}>
              {rankOptions.map(r => (
                <Text
                  key={r}
                  className={classnames(styles.tagOption, rank === r && styles.active)}
                  onClick={() => setRank(rank === r ? '' : r)}
                >
                  {r}
                </Text>
              ))}
            </View>
          </View>
          <View className={styles.fieldRow} style={{ display: 'flex', gap: '16rpx' }}>
            <View style={{ flex: 1 }}>
              <Text className={styles.fieldLabel}>英雄数量</Text>
              <View className={styles.inputBox}>
                <Input
                  className={styles.input}
                  type='number'
                  placeholder='个'
                  value={heroCount}
                  onInput={(e) => setHeroCount(e.detail.value)}
                />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text className={styles.fieldLabel}>皮肤数量</Text>
              <View className={styles.inputBox}>
                <Input
                  className={styles.input}
                  type='number'
                  placeholder='个'
                  value={skinCount}
                  onInput={(e) => setSkinCount(e.detail.value)}
                />
              </View>
            </View>
          </View>
          <View className={styles.fieldRow}>
            <Text className={styles.fieldLabel}>特色标签</Text>
            <View className={styles.tagSelectRow}>
              {highlightTags.map(tag => (
                <Text
                  key={tag}
                  className={classnames(styles.tagOption, selectedTags.includes(tag) && styles.active)}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Text>
              ))}
            </View>
          </View>
          <View className={styles.fieldRow}>
            <Text className={styles.fieldLabel}>详细描述</Text>
            <View className={styles.textareaBox}>
              <Textarea
                className={styles.textarea}
                placeholder='详细描述账号情况，包括稀有皮肤、英雄、装备、是否可换绑等...'
                maxlength={500}
                value={description}
                onInput={(e) => setDescription(e.detail.value)}
              />
              <Text className={styles.textCount}>{description.length}/500</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionIcon}>🖼️</Text>
            <Text className={styles.sectionTitle}>账号截图</Text>
          </View>
          <View className={styles.fieldRow}>
            <View className={styles.uploadGrid}>
              {images.map((img, index) => (
                <View key={index} className={styles.uploadItem}>
                  <Image
                    className={styles.uploadImage}
                    src={img}
                    mode='aspectFill'
                    onError={(e) => console.error('[PublishPage] Image error:', e)}
                  />
                  <View
                    className={styles.uploadDelete}
                    onClick={() => handleRemoveImage(index)}
                  >
                    <Text>✕</Text>
                  </View>
                </View>
              ))}
              {images.length < 9 && (
                <View className={styles.uploadAdd} onClick={handleAddImage}>
                  <Text className={styles.uploadAddIcon}>＋</Text>
                  <Text className={styles.uploadAddText}>上传图片</Text>
                </View>
              )}
            </View>
            <Text className={styles.imageTip}>
              请上传至少1张，最多9张。建议包含：登录界面、段位截图、英雄/皮肤截图、贵重道具截图等
            </Text>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionIcon}>💰</Text>
            <Text className={styles.sectionTitle}>价格设置</Text>
          </View>
          <View className={styles.fieldRow}>
            <Text className={styles.fieldLabel}>交易方式</Text>
            <View className={styles.priceTypeToggle}>
              <Text
                className={classnames(styles.toggleOption, priceType === 'fixed' && styles.active)}
                onClick={() => setPriceType('fixed')}
              >
                一口价
              </Text>
              <Text
                className={classnames(styles.toggleOption, priceType === 'negotiable' && styles.active)}
                onClick={() => setPriceType('negotiable')}
              >
                接受议价
              </Text>
            </View>
          </View>
          <View className={styles.fieldRow}>
            <Text className={styles.fieldLabel}>
              售价<Text className={styles.required}>*</Text>
            </Text>
            <View className={styles.priceRow}>
              <View className={styles.priceInputBox}>
                <Text className={styles.pricePrefix}>¥</Text>
                <Input
                  className={styles.priceInput}
                  type='digit'
                  placeholder='0.00'
                  value={price}
                  onInput={(e) => setPrice(e.detail.value)}
                />
                <Text className={styles.priceSuffix}>元</Text>
              </View>
            </View>
          </View>
          <View className={styles.fieldRow}>
            <Text className={styles.fieldLabel}>原价（选填）</Text>
            <View className={styles.priceRow}>
              <View className={styles.priceInputBox}>
                <Text className={styles.pricePrefix}>¥</Text>
                <Input
                  className={styles.priceInput}
                  type='digit'
                  placeholder='0.00'
                  value={originalPrice}
                  onInput={(e) => setOriginalPrice(e.detail.value)}
                />
                <Text className={styles.priceSuffix}>元</Text>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionIcon}>🔐</Text>
            <Text className={styles.sectionTitle}>卖家资质</Text>
          </View>
          <View className={styles.verifyStatusCard}>
            <View className={styles.verifyLeft}>
              <View
                className={classnames(
                  styles.verifyIcon,
                  !currentUser.isVerified && styles.unverified
                )}
              >
                <Text>{currentUser.isVerified ? '✅' : '⚠️'}</Text>
              </View>
              <View className={styles.verifyInfo}>
                <Text className={styles.verifyTitle}>
                  实名认证：{currentUser.isVerified ? '已认证' : '未认证'}
                </Text>
                <Text className={styles.verifyDesc}>
                  {currentUser.isVerified
                    ? `${currentUser.realName} · ${currentUser.phone}`
                    : '完成实名认证后才能发布账号'}
                </Text>
              </View>
            </View>
            <View
              className={classnames(
                styles.verifyBtn,
                currentUser.isVerified && styles.outline
              )}
              onClick={() => console.log('[PublishPage] Verify identity')}
            >
              <Text>{currentUser.isVerified ? '查看详情' : '去认证'}</Text>
            </View>
          </View>
        </View>

        <View className={styles.protocolBox}>
          <View
            className={classnames(styles.checkbox, agreed && styles.checked)}
            onClick={() => setAgreed(!agreed)}
          >
            {agreed && <Text>✓</Text>}
          </View>
          <Text className={styles.protocolText}>
            我已阅读并同意
            <Text className={styles.protocolLink}> 《平台交易服务协议》</Text>
            <Text className={styles.protocolLink}> 《用户隐私政策》</Text>
            ，承诺所发布账号信息真实有效，无盗号、找回等恶意行为。
          </Text>
        </View>
      </View>

      <View className={styles.footerBar}>
        <View className={styles.feeInfo}>
          <Text className={styles.feeLabel}>平台服务费 5%</Text>
          <Text className={styles.feeAmount}>
            预计到账 <Text className={styles.feeAmountValue}>¥{finalAmount}</Text>
            <Text style={{ color: '#94A3B8', marginLeft: '8rpx' }}>(服务费 ¥{serviceFee})</Text>
          </Text>
        </View>
        <View
          className={classnames(styles.submitBtn, !canSubmit && styles.disabled)}
          onClick={handleSubmit}
        >
          <Text>立即发布</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default PublishPage;
