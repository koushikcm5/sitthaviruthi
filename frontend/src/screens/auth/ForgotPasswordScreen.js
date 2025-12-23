import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { authAPI } from '../../services/api';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(null);

  const handleSendOTP = async () => {
    if (!email) {
      setErrorModal('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      setErrorModal('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.forgotPassword(email);
      setSuccessModal(true);
    } catch (error) {
      setErrorModal(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessModal(false);
    navigation.navigate('ResetPassword', { email });
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <View style={styles.headerSection}>
          <View style={styles.mandalaPattern} />
          <Image source={require('../../../assets/SVY-Logo-01.png')} style={styles.logo} />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.welcomeTitle}>Reset Password</Text>
          <Text style={styles.subtitle}>Find Your Way Back</Text>
          <Text style={styles.supportText}>We'll send you an OTP to reset your password</Text>

          <View style={styles.inputWrapper}>
            <MaterialIcons name="email" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <TouchableOpacity style={styles.signInBtn} onPress={handleSendOTP} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.signInText}>Send OTP</Text>
                <View style={styles.signInIconCircle}>
                  <MaterialIcons name="arrow-forward" size={18} color="#003057" />
                </View>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
            <MaterialIcons name="arrow-back" size={18} color="#6B7280" />
            <Text style={styles.backText}>Back to Login</Text>
          </TouchableOpacity>

          <View style={styles.bottomMandala} />
        </View>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      {successModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.successModalContent}>
              <View style={styles.successIconCircle}>
                <MaterialIcons name="check" size={40} color="#FFFFFF" />
              </View>
              <Text style={styles.modalTitle}>OTP Sent Successfully!</Text>
              <Text style={styles.modalDesc}>
                We've sent a 6-digit OTP to your email address. Please check your inbox (and spam folder).
              </Text>
              <TouchableOpacity style={styles.modalBtn} onPress={handleSuccessClose}>
                <Text style={styles.modalBtnText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Error Modal */}
      {errorModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.errorModalContent}>
              <View style={styles.errorIconCircle}>
                <MaterialIcons name="error" size={40} color="#FFFFFF" />
              </View>
              <Text style={styles.modalTitle}>Unable to Send OTP</Text>
              <Text style={styles.modalDesc}>{errorModal}</Text>
              <TouchableOpacity style={styles.errorModalBtn} onPress={() => setErrorModal(null)}>
                <Text style={styles.modalBtnText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  headerSection: {
    backgroundColor: '#1B3B6F',
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  mandalaPattern: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
  },
  logo: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
  },
  formSection: {
    flex: 1,
    backgroundColor: '#FAFBFC',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 40,
  },
  welcomeTitle: {
    fontSize: 24,
    fontFamily: 'JosefinSans-Bold',
    color: '#1B3B6F',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'JosefinSans-Bold',
    color: '#E8B490',
    textAlign: 'center',
    marginBottom: 6,
  },
  supportText: {
    fontSize: 13,
    fontFamily: 'WorkSans-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 15,
    fontFamily: 'WorkSans-Medium',
    color: '#1B3B6F',
  },
  signInBtn: {
    backgroundColor: '#003057',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
  signInText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'JosefinSans-Bold',
    letterSpacing: 0.5,
    textAlign: 'center',
    flex: 1,
  },
  signInIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  backButton: {
    marginTop: 28,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  backText: {
    color: '#4A6984',
    fontSize: 14,
    fontFamily: 'WorkSans-Medium',
    textDecorationLine: 'underline',
  },
  bottomMandala: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(212,165,116,0.2)',
    borderStyle: 'dashed',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '85%',
    alignItems: 'center',
  },
  errorModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '85%',
    alignItems: 'center',
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'JosefinSans-Bold',
    color: '#1B3B6F',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 15,
    fontFamily: 'WorkSans-Regular',
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalBtn: {
    backgroundColor: '#00A8A8',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
  },
  errorModalBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'JosefinSans-Bold',
    textAlign: 'center',
  },
});
