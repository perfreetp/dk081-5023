import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import AccountCard from '@/components/AccountCard';
import { gameCategories, rankFilters, priceRanges, sortOptions } from '@/data/games';
import { mockAccounts } from '@/data/accounts';
import { formatNumber } from '@/utils/format';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [selectedRank, setSelectedRank] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [activeSort, setActiveSort] = useState('sort1');

  useDidShow(() => {
    console.log('[HomePage] Page show');
  });

  const filteredAccounts = useMemo(() => {
    let list = [...mockAccounts];
    if (selectedGame) {
      list = list.filter(a => a.gameId === selectedGame);
    }
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      list = list.filter(a => 
        a.title.toLowerCase().includes(kw) || 
        a.gameName.toLowerCase().includes(kw) ||
        a.tags.some(t => t.name.toLowerCase().includes(kw))
      );
    }
    if (selectedRank) {
      const range = rankFilters.find(r => r.id === selectedRank);
      if (range) {
        const [min, max] = range.range.split('-').map(Number);
        list = list.filter(a => a.rankLevel >= min && a.rankLevel <= max);
      }
    }
    if (selectedPrice) {
      const pr = priceRanges.find(p => p.id === selectedPrice);
      if (pr) {
        list = list.filter(a => a.price >= pr.min && a.price < pr.max);
      }
    }
    const sortOpt = sortOptions.find(s => s.id === activeSort);
    switch (sortOpt?.key) {
      case 'price_asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime());
        break;
      case 'credit':
        list.sort((a, b) => b.seller.creditScore - a.seller.creditScore);
        break;
    }
    return list;
  }, [selectedGame, searchKeyword, selectedRank, selectedPrice, activeSort]);

  const handleCategoryClick = (gameId: string) => {
    setSelectedGame(prev => prev === gameId ? null : gameId);
    console.log('[HomePage] Category selected:', gameId);
  };

  const handleSearch = () => {
    console.log('[HomePage] Search keyword:', searchKeyword);
  };

  return (
    <ScrollView scrollY className={styles.page} enableBackToTop>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <View className={styles.brand}>
            <View className={styles.brandLogo}>🎮</View>
            <Text className={styles.brandText}>账号担保</Text>
          </View>
          <View className={styles.sloganBadge}>
            <Text>🛡️</Text>
            <Text>先验后放款</Text>
          </View>
        </View>
        <View className={styles.searchBox}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder='搜索游戏、账号、皮肤...'
            placeholderClass='input-placeholder'
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
            onConfirm={handleSearch}
          />
          <View className={styles.searchBtn} onClick={handleSearch}>
            <Text>搜索</Text>
          </View>
        </View>
        <View className={styles.guaranteeBar}>
          <View className={styles.guaranteeItem}>
            <Text>✅</Text>
            <Text>平台验号</Text>
          </View>
          <View className={styles.guaranteeItem}>
            <Text>💰</Text>
            <Text>资金担保</Text>
          </View>
          <View className={styles.guaranteeItem}>
            <Text>⏰</Text>
            <Text>售后保障</Text>
          </View>
          <View className={styles.guaranteeItem}>
            <Text>⚖️</Text>
            <Text>争议仲裁</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.categorySection}>
          <View className={styles.sectionTitle}>
            <Text className={styles.titleText}>热门游戏</Text>
            <Text className={styles.moreBtn}>全部 ›</Text>
          </View>
          <View className={styles.categoryGrid}>
            {gameCategories.map((cat) => (
              <View
                key={cat.id}
                className={styles.categoryItem}
                onClick={() => handleCategoryClick(cat.id)}
              >
                <View
                  className={styles.categoryIcon}
                  style={selectedGame === cat.id ? {
                    background: '$color-primary',
                    color: '#fff'
                  } : {}}
                >
                  <Text>{cat.icon}</Text>
                  {cat.hot && <Text className={styles.hotMark}>HOT</Text>}
                </View>
                <Text className={styles.categoryName}>{cat.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.filterSection}>
          <View className={styles.filterRow}>
            <Text className={styles.filterLabel}>段位</Text>
            <View className={styles.filterTags}>
              <Text
                className={classnames(styles.filterTag, !selectedRank && styles.active)}
                onClick={() => setSelectedRank(null)}
              >
                全部
              </Text>
              {rankFilters.map(r => (
                <Text
                  key={r.id}
                  className={classnames(styles.filterTag, selectedRank === r.id && styles.active)}
                  onClick={() => setSelectedRank(prev => prev === r.id ? null : r.id)}
                >
                  {r.name}
                </Text>
              ))}
            </View>
          </View>
          <View className={styles.filterRow}>
            <Text className={styles.filterLabel}>价格</Text>
            <View className={styles.filterTags}>
              <Text
                className={classnames(styles.filterTag, !selectedPrice && styles.active)}
                onClick={() => setSelectedPrice(null)}
              >
                全部
              </Text>
              {priceRanges.map(p => (
                <Text
                  key={p.id}
                  className={classnames(styles.filterTag, selectedPrice === p.id && styles.active)}
                  onClick={() => setSelectedPrice(prev => prev === p.id ? null : p.id)}
                >
                  {p.name}
                </Text>
              ))}
            </View>
          </View>
        </View>

        <View className={styles.sortBar}>
          <View className={styles.sortLeft}>
            <Text className={styles.countText}>共 {filteredAccounts.length} 个账号</Text>
            {selectedGame && (
              <Text
                className={styles.filterTag}
                style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}
                onClick={() => setSelectedGame(null)}
              >
                {gameCategories.find(g => g.id === selectedGame)?.name} ✕
              </Text>
            )}
          </View>
          <View className={styles.sortOptions}>
            {sortOptions.slice(0, 3).map(s => (
              <Text
                key={s.id}
                className={classnames(styles.sortOption, activeSort === s.id && styles.active)}
                onClick={() => setActiveSort(s.id)}
              >
                {s.name}
              </Text>
            ))}
          </View>
        </View>

        <View className={styles.listSection}>
          {filteredAccounts.length > 0 ? (
            filteredAccounts.map(account => (
              <AccountCard key={account.id} account={account} />
            ))
          ) : (
            <View style={{ padding: '80rpx 0', textAlign: 'center' }}>
              <Text style={{ fontSize: '80rpx' }}>🔍</Text>
              <Text style={{ display: 'block', marginTop: '24rpx', color: '#94A3B8', fontSize: '26rpx' }}>
                暂无符合条件的账号
              </Text>
              <Text
                style={{ display: 'block', marginTop: '16rpx', color: '#3B82F6', fontSize: '24rpx' }}
                onClick={() => {
                  setSelectedGame(null);
                  setSelectedRank(null);
                  setSelectedPrice(null);
                  setSearchKeyword('');
                }}
              >
                清除筛选条件
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;
