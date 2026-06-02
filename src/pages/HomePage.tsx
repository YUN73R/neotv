import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, ScrollView, Image, ActivityIndicator, Animated } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useTheme, PRIMARY_COLOR_HEX, BOX_SHADOW } from '../context/ThemeContext';
import Banner from '../components/Banner';
import TabBar from '../components/TabBar';
import { doubanApi } from '../utils/api';
import { tabs } from '../config/config';
import FocusableView from '../layouts/FocusableView';

interface BannerItem {
  id: string;
  pic?: {
    normal?: string;
    large?: string;
    small?: string;
  };
  cover_url?: string;
  title: string;
}

interface ContentItem {
  id: string;
  pic?: {
    normal?: string;
    large?: string;
    small?: string;
  };
  cover_url?: string;
  title: string;
  rating?: number;
  card_subtitle?: string;
}

interface HomePageProps {
  onNavigate: (route: string, params?: any) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { theme, themeMode, toggleTheme } = useTheme();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('推荐');
  const [content, setContent] = useState<Record<string, ContentItem[]>>({});
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const isTV = Platform.OS === 'android' || Platform.OS === 'ios';
  const headerBg = themeMode === 'dark' ? '#2d2d2d' : '#e0e0e0';
  const iconButtonBg = themeMode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';

  const handleBannerItemPress = (item: BannerItem) => {
    onNavigate('Detail', { movie: item });
  };

  const fetchTabContent = useCallback(async (tabTitle: string) => {
    if (content[tabTitle]) {
      return;
    }
    setLoading(true);
    try {
      const tab = tabs.find(t => t.title === tabTitle);
      if (!tab) return;
      const response = await doubanApi.getTabContent(tab);
      if (response.data && response.data.items) {
        const items: ContentItem[] = response.data.items.map((item: any) => {
          return {
            id: item.id?.toString() || Math.random().toString(),
            cover_url: item.pic?.normal,
            title: item.title || item.name || '未知',
            rating: item.rating?.value,
            card_subtitle: item.card_subtitle || '',
          };
        });
        setContent(prev => ({ ...prev, [tabTitle]: items }));
      }
    } catch (error) {
      console.error('Failed to fetch tab content:', error);
      setContent(prev => ({ ...prev, [tabTitle]: [] }));
    } finally {
      setLoading(false);
    }
  }, [content]);

  useEffect(() => {
    fetchTabContent(activeTab);
  }, [activeTab, fetchTabContent]);

  useEffect(() => {
    fetchTabContent('推荐');
  }, [fetchTabContent]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: loading ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [loading, fadeAnim]);

  const handleTabChange = (tabTitle: string) => {
    setActiveTab(tabTitle);
  };

  const currentContent = content[activeTab] || [];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <View style={styles.headerLeft}>
          <Image source={require('../assets/images/logo.png')} style={styles.logo} />
          <Text style={[styles.logoText, { color: theme.text }]}>极简TV</Text>
        </View>
        
        <FocusableView style={styles.searchContainer} onPress={() => onNavigate('Search')}>
          <View
            style={[styles.searchInput, { backgroundColor: theme.backgroundSecondary }]}
          >
            <Text style={[styles.searchInputText, { color: theme.textSecondary }]}>按剧名搜索</Text>
          </View>
          <View 
            style={[styles.searchButton, { backgroundColor: PRIMARY_COLOR_HEX }]}
          >
            <MaterialIcons name="search" size={20} color="white" />
          </View>
        </FocusableView>

        <View style={styles.headerRight}>
          <FocusableView 
            style={[styles.headerButton, { backgroundColor: PRIMARY_COLOR_HEX }]}
            onPress={() => onNavigate('TVLive')}
          >
            <MaterialIcons name="video-library" size={15} color="white" />
            <Text style={styles.buttonText}>电视直播</Text>
          </FocusableView>
          
          <FocusableView 
            style={[styles.headerIconButton, { backgroundColor: iconButtonBg }]}
            onPress={toggleTheme}
          >
            <Feather name={themeMode === 'dark' ? 'moon' : 'sun'} size={15} color={theme.text} />
          </FocusableView>
          
          <FocusableView 
            style={[styles.headerIconButton, { backgroundColor: iconButtonBg }]}
            onPress={() => onNavigate('Favorites')}
          >
            <MaterialIcons name="favorite-border" size={15} color={theme.text} />
          </FocusableView>
          
          <FocusableView 
            style={[styles.headerIconButton, { backgroundColor: iconButtonBg }]}
            onPress={() => onNavigate('History')}
          >
            <MaterialIcons name="history" size={15} color={theme.text} />
          </FocusableView>
          
          <FocusableView 
            style={[styles.headerIconButton, { backgroundColor: iconButtonBg }]}
            onPress={() => onNavigate('Settings')}
          >
            <MaterialIcons name="settings" size={15} color={theme.text} />
          </FocusableView>
        </View>
      </View>
      
      <ScrollView style={[styles.content, { backgroundColor: theme.background }]}>
        <Banner onItemPress={handleBannerItemPress} />
        <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{activeTab}</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator 
                size="large" 
                color={theme.accent} 
              />
              <Text style={{ color: theme.textSecondary, marginTop: 12 }}>
                正在加载{activeTab}内容...
              </Text>
            </View>
          ) : currentContent.length === 0 ? (
            <Animated.View style={[styles.empty, { opacity: fadeAnim }]}>
              <Text style={{ color: theme.textSecondary }}>暂无内容</Text>
            </Animated.View>
          ) : (
            <Animated.View style={[styles.contentGrid, { opacity: fadeAnim }]}>
              {currentContent.map((item, index) => {
                const safeTitle = typeof item.title === 'string' ? item.title : '';
                const safeCover = item.pic?.normal || item.cover_url || '';
                const safeRating = typeof item.rating === 'number' ? item.rating : null;
                const safeSubtitle = item.card_subtitle?.split(' / ') || [];
                const safeActors = safeSubtitle ? `${safeSubtitle?.[1]}-${safeSubtitle?.[3]}` : ''
                
                return (
                  <FocusableView 
                    key={item.id} 
                    style={styles.contentCard}
                    onPress={() => onNavigate('Detail', { movie: item })}
                    hasTVPreferredFocus={index === 0}
                  >
                    <View style={styles.coverContainer}>
                      <Image 
                        source={{ uri: safeCover }} 
                        style={styles.contentCover}
                        resizeMode="cover"
                      />
                      {safeRating !== null && (
                        <View style={[styles.ratingBadge, { backgroundColor: theme.secondary }]}>
                          <MaterialIcons name="star" size={10} color="white" />
                          <Text style={styles.ratingBadgeText}>{safeRating.toFixed(1)}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.titleContainer}>
                      <Text style={[styles.contentTitle, { color: theme.text }]} numberOfLines={1}>
                        {safeTitle}
                      </Text>
                      {safeActors.trim() !== '' && (
                        <Text style={[styles.actorsText, { color: theme.textSecondary }]} numberOfLines={1}>
                          {safeActors}
                        </Text>
                      )}
                    </View>
                  </FocusableView>
                );
              })}
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 20,
    height: 26,
    borderRadius: 20,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputText: {
    fontSize: 12,
    paddingHorizontal: 10,
  },
  searchButton: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  headerIconButton: {
    width: 26,
    height: 26,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  loadingContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  contentCard: {
    width: '18%',
    maxWidth: 140,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    flexDirection: 'column',
    boxShadow: BOX_SHADOW,
  },
  coverContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 12 / 16,
  },
  contentCover: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderBottomLeftRadius: 6,
    gap: 2,
  },
  ratingBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 8,
  },
  contentTitle: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 2,
  },
  actorsText: {
    fontSize: 10,
    lineHeight: 14,
  },
});

export default HomePage;
