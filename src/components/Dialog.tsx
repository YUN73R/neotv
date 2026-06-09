import React from 'react';
import {
    Platform,
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import FocusableView from '../layouts/FocusableView';

interface AboutDialogProps {
  visible: boolean;
  title?: string;
  content?: React.ReactNode;
  onClose: () => void;
}

const AboutDialog: React.FC<AboutDialogProps> = ({ visible, title, content, onClose }) => {
    const isTv = Platform.isTV || Platform.OS === 'android' || Platform.OS === 'ios';
  const { theme, themeMode } = useTheme();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.dialog,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          {/* 头部 */}
          <View style={[styles.header, { borderColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          </View>

          {/* 内容区域 */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={true}
          >
            {/* 这里留空，用户自己写文字内容 */}
            <View style={styles.contentPlaceholder}>
              {/* 用户可以在这里添加内容 */}
              {content}
            </View>
          </ScrollView>

          {/* 底部确认按钮 */}
          {!isTv && (
            <View style={[styles.footer, { borderColor: theme.border }]}>
            <FocusableView
              style={[styles.confirmButton, { backgroundColor: theme.accent }]}
              onPress={onClose}
            >
              <Text style={styles.confirmButtonText}>确定</Text>
            </FocusableView>
          </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  dialog: {
    width: '80%',
    maxWidth: 500,
    maxHeight: '70%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    marginBottom: 20,
  },
  contentPlaceholder: {
    minHeight: 100,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
  },
  confirmButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
});

export default AboutDialog;
