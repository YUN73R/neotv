import React, { useState } from 'react';
import { View, Text, StyleSheet, BackHandler } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import FocusableView from '../layouts/FocusableView';

interface TVLivePageProps {
  onBack: () => void;
}

const TVLivePage: React.FC<TVLivePageProps> = ({ onBack }) => {
  const { theme } = useTheme();
  const [showControls, setShowControls] = useState(true);
  const [showChannelList, setShowChannelList] = useState(false);

  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => backHandler.remove();
  }, [onBack]);

  const handleChannelSelect = (channelId: string) => {
    setShowChannelList(false);
  };

  const handleOKPress = () => {
    setShowChannelList(true);
  };

  const toggleControls = () => {
    if (showChannelList) {
      setShowChannelList(false);
    } else {
      setShowControls(!showControls);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      <FocusableView 
        style={styles.playerContainer} 
        onPress={toggleControls}
      >
        <View style={styles.playerPlaceholder}>
          <MaterialIcons name="live-tv" size={80} color="#333" />
          <Text style={styles.playerText}>正在播放...</Text>
        </View>

        {showControls && !showChannelList && (
          <View style={[styles.controlsOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
            <FocusableView style={styles.backButton} onPress={onBack} hasTVPreferredFocus>
              <MaterialIcons name="arrow-back" size={32} color="white" />
            </FocusableView>
            <Text style={styles.channelName}>CCTV-1</Text>
            <FocusableView 
              style={styles.channelListButton}
              onPress={handleOKPress}
            >
              <MaterialIcons name="format-list-numbered" size={32} color="white" />
              <Text style={styles.channelListText}>按OK键换台</Text>
            </FocusableView>
          </View>
        )}

        {showChannelList && (
          <View style={[styles.channelListOverlay, { backgroundColor: theme.background }]}>
            <View style={styles.channelListHeader}>
              <Text style={[styles.channelListTitle, { color: theme.text }]}>频道列表</Text>
              <FocusableView onPress={() => setShowChannelList(false)}>
                <MaterialIcons name="close" size={28} color={theme.text} />
              </FocusableView>
            </View>
            <View style={styles.channelList}>
              {['CCTV-1', 'CCTV-2', 'CCTV-3', 'CCTV-4', 'CCTV-5', 'CCTV-6', 'CCTV-7', 'CCTV-8', 'CCTV-9', 'CCTV-10'].map((channel, index) => (
                <FocusableView
                  key={index}
                  style={[styles.channelItem, index === 0 && { backgroundColor: theme.accent }]}
                  onPress={() => handleChannelSelect(channel)}
                  hasTVPreferredFocus={index === 0}
                >
                  <Text style={[styles.channelItemText, { color: theme.text }]}>{channel}</Text>
                </FocusableView>
              ))}
            </View>
            <Text style={[styles.channelListHint, { color: theme.textSecondary }]}>
              按返回键关闭
            </Text>
          </View>
        )}
      </FocusableView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  playerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerText: {
    color: '#333',
    fontSize: 14,
    marginTop: 10,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  channelListButton: {
    alignItems: 'center',
  },
  channelListText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  channelListOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '40%',
    padding: 20,
  },
  channelListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  channelListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  channelList: {
    flex: 1,
  },
  channelItem: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 5,
  },
  channelItemText: {
    fontSize: 14,
  },
  channelListHint: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
});

export default TVLivePage;
