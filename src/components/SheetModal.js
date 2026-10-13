import React from 'react';
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import colors from '../utils/colors';

// Bottom sheet modal used for pickers and quick actions
const SheetModal = ({ visible, onClose, title, children, scroll = true }) => {
  const insets = useSafeAreaInsets();
  const Body = scroll ? ScrollView : View;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <KeyboardAvoidingView behavior="padding" style={styles.backdrop}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <X color={colors.textSecondary} size={22} />
            </TouchableOpacity>
          </View>
          <Body keyboardShouldPersistTaps="handled" {...(scroll ? { contentContainerStyle: styles.content } : { style: styles.content })}>
            {children}
          </Body>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export const SheetOption = ({ label, sublabel, emoji, active, onPress, right }) => (
  <TouchableOpacity style={[styles.option, active && styles.optionActive]} onPress={onPress} activeOpacity={0.8}>
    {emoji ? <Text style={styles.optionEmoji}>{emoji}</Text> : null}
    <View style={{ flex: 1 }}>
      <Text style={[styles.optionLabel, active && { color: colors.primary }]}>{label}</Text>
      {sublabel ? <Text style={styles.optionSub}>{sublabel}</Text> : null}
    </View>
    {right}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.surface,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  optionActive: {
    borderColor: colors.primary,
  },
  optionEmoji: {
    fontSize: 22,
  },
  optionLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  optionSub: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
});

export default SheetModal;
