import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { tabs } from '../config/config';
import FocusableView from '../layouts/FocusableView';

interface TabBarProps {
  activeTab: string;
  onTabChange: (title: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const { theme } = useTheme();

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.scrollView}
    >
      <View style={styles.tabsContainer}>
        {tabs.map((tab, index) => (
          <FocusableView
            key={tab.title}
            style={[
              styles.tabButton,
              activeTab === tab.title && { backgroundColor: theme.accent },
            ]}
            onPress={() => onTabChange(tab.title)}
            onFocus={() => onTabChange(tab.title)}
            hasTVPreferredFocus={index === 0 && activeTab === tab.title}
          >
            <Text 
              style={[
                styles.tabText,
                { color: activeTab === tab.title ? 'white' : theme.text },
              ]}
            >
              {tab.title}
            </Text>
          </FocusableView>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 0,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 10,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default TabBar;
