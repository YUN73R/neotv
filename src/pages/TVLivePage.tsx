import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, BackHandler } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getLiveStreamList } from '../services/liveService';
import { useTheme } from '../context/ThemeContext';
import FocusableView from '../layouts/FocusableView';

interface TVLivePageProps {
  onBack: () => void;
}

const TVLivePage: React.FC<TVLivePageProps> = ({ onBack }) => {
  const { theme } = useTheme();
  const [showControls, setShowControls] = useState(true);
  const [showChannelList, setShowChannelList] = useState(false);

  useEffect(() => {
    getLiveStreamList()
  }, [])
  useEffect(() => {
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
    <View style={[styles.container]}>
      <FocusableView 
        focusBorderColor=""
        onPress={toggleControls}
      >
        <View style={styles.playerBar}>

        </View>
      </FocusableView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
  },
  playerBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 20,
    pointerEvents: 'none',
    zIndex: 10,
  }
});

export default TVLivePage;
