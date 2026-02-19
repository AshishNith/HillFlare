import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  StatusBar,
} from 'react-native';
import { BlurView } from 'expo-blur';
import GlassView from './GlassView';

interface BlurModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  animationType?: 'slide' | 'fade' | 'none';
  transparent?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  closeOnOverlayPress?: boolean;
}

export default function BlurModal({
  visible,
  onClose,
  children,
  animationType = 'fade',
  transparent = true,
  style,
  contentStyle,
  closeOnOverlayPress = true,
}: BlurModalProps) {
  return (
    <Modal
      visible={visible}
      animationType={animationType}
      transparent={transparent}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar backgroundColor="transparent" barStyle="light-content" />
      
      <View style={[styles.overlay, style]}>
        <BlurView intensity={20} tint="dark" style={styles.blurOverlay}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={closeOnOverlayPress ? onClose : undefined}
          >
            <View style={styles.centeredView}>
              <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
                <GlassView style={[styles.contentContainer, contentStyle]}>
                  {children}
                </GlassView>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  blurOverlay: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
  },
  contentContainer: {
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
});