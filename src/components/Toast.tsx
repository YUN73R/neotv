import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface ToastProps {
  visible: boolean;
  message: string;
  offsetTop?: number | string;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ visible, message, offsetTop = 100, onClose, duration = 2000 }) => {
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          onClose();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, opacity, onClose]);

  if (!visible) return null;

  return (
    /** @ts-ignore */
    <Animated.View style={[styles.container, { opacity, top: offsetTop }]}>
      <View style={styles.toast}>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  toast: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  message: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Toast;
