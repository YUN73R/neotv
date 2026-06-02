import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Image, Text, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme, BOX_SHADOW } from '../context/ThemeContext';
import { doubanApi } from '../utils/api';
import FocusableView from '../layouts/FocusableView';

interface BannerItem {
  id: string;
  cover_url: string;
  title: string;
  rating?: number;
}

interface BannerProps {
  onItemPress: (item: BannerItem) => void;
}

const Banner: React.FC<BannerProps> = ({ onItemPress }) => {
  const { theme } = useTheme();
  const [allData, setAllData] = useState<BannerItem[]>([]);
  const [displayData, setDisplayData] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const updateIntervalRef = useRef<number | null>(null);

  // 随机选择3个
  const selectRandomThree = useCallback((data: BannerItem[]) => {
    if (data.length <= 3) {
      return data;
    }
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const response = await doubanApi.getWeeklyMovies();
      if (response.data && response.data.subject_collection_items) {
        const items = response.data.subject_collection_items.map((item: any) => ({
          id: item.id.toString(),
          cover_url: item.pic?.normal,
          title: item.title,
          rating: item.rating?.value,
        }));
        setAllData(items);
        setDisplayData(selectRandomThree(items));
      }
    } catch (error) {
      console.error('Failed to fetch banner data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectRandomThree]);

  useEffect(() => {
    fetchData();

    // 每10分钟更新一次
    updateIntervalRef.current = window.setInterval(() => {
      setAllData(data => {
        if (data.length > 0) {
          setDisplayData(selectRandomThree(data));
        }
        return data;
      });
    }, 10 * 60 * 1000);

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [fetchData, selectRandomThree]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="large" 
            color={theme.accent} 
          />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            正在加载精彩内容...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.bannerRow}>
        {displayData.map((item, index) => {
          const safeTitle = typeof item.title === 'string' ? item.title : '';
          const safeCover = typeof item.cover_url === 'string' ? item.cover_url : '';
          const safeRating = typeof item.rating === 'number' ? item.rating : null;
          
          return (
            <FocusableView 
              key={item.id}
              style={styles.bannerCard}
              onPress={() => onItemPress(item)}
              hasTVPreferredFocus={index === 0}
            >
              <Image 
                source={{ uri: safeCover }} 
                style={styles.bannerImage}
                resizeMode="cover"
              />
              {safeRating !== null && (
                <View style={[styles.ratingContainer, { backgroundColor: theme.secondary }]}>
                  <MaterialIcons name="star" size={11} color="white" />
                  <Text style={styles.ratingText}>{safeRating.toFixed(1)}</Text>
                </View>
              )}
            </FocusableView>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  loadingContainer: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  bannerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bannerCard: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    aspectRatio: 16 / 9,
    position: 'relative',
    boxShadow: BOX_SHADOW,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  ratingContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    gap: 2,
  },
  ratingText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '500',
  },
});

export default Banner;
