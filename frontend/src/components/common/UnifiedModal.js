import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function UnifiedModal({
  visible,
  onClose,
  icon = 'info',
  iconColor = '#00A8A8',
  title,
  description,
  children,
  buttons = [],
  input = null,
  maxHeight = false
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.content, maxHeight && styles.contentMaxHeight]}>
          <MaterialIcons name={icon} size={64} color={iconColor} style={styles.icon} />
          <Text style={styles.title}>{title}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
          
          {input && (
            <TextInput
              style={styles.input}
              placeholder={input.placeholder}
              placeholderTextColor="#999"
              multiline={input.multiline}
              value={input.value}
              onChangeText={input.onChange}
            />
          )}
          
          {children && (
            <ScrollView style={styles.childrenContainer} showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
          )}
          
          <View style={styles.buttonContainer}>
            {buttons.map((btn, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.button,
                  btn.style === 'primary' && styles.buttonPrimary,
                  btn.style === 'success' && styles.buttonSuccess,
                  btn.style === 'danger' && styles.buttonDanger,
                  btn.style === 'secondary' && styles.buttonSecondary,
                  buttons.length > 1 && styles.buttonFlex
                ]}
                onPress={btn.onPress}
              >
                <Text style={[
                  styles.buttonText,
                  (btn.style === 'primary' || btn.style === 'success' || btn.style === 'danger') && styles.buttonTextWhite
                ]}>
                  {btn.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  content: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, width: '100%', maxWidth: 400 },
  contentMaxHeight: { maxHeight: '80%' },
  icon: { alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#1B3B6F', marginBottom: 8, textAlign: 'center' },
  description: { fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center', lineHeight: 20 },
  input: { backgroundColor: '#F5F7FA', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', fontSize: 14, color: '#1B3B6F', minHeight: 100, textAlignVertical: 'top', marginBottom: 16 },
  childrenContainer: { maxHeight: 300, marginBottom: 16 },
  buttonContainer: { flexDirection: 'row', gap: 12 },
  button: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  buttonFlex: { flex: 1 },
  buttonPrimary: { backgroundColor: '#00A8A8' },
  buttonSuccess: { backgroundColor: '#27AE60' },
  buttonDanger: { backgroundColor: '#E74C3C' },
  buttonSecondary: { backgroundColor: '#F3F4F6' },
  buttonText: { fontSize: 15, fontWeight: '700', color: '#6B7280' },
  buttonTextWhite: { color: '#FFFFFF' }
});
