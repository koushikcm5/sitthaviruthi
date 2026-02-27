import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { authAPI } from '../../services/api';

export default function ResetPasswordScreen({ route, navigation }) {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState(null);
  const [successModal, setSuccessModal] = useState(false);

  const validatePassword = (pwd) => {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    if (pwd.length < minLength) return 'Password must be at least 8 characters';
    if (!hasUpper) return 'Password must contain an uppercase letter';
    if (!hasLower) return 'Password must contain a lowercase letter';
    if (!hasNumber) return 'Password must contain a number';
    if (!hasSpecial) return 'Password must contain a special character';
    return null;
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      setErrorModal('Please fill all fields');
      return;
    }

    if (otp.length !== 6) {
      setErrorModal('OTP must be 6 digits');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setErrorModal(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorModal('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(email, otp, newPassword);
      setSuccessModal(true);
    } catch (error) {
      setErrorModal(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('../../../assets/img/Frame-1.png')} style={styles.bottomFrame} resizeMode="cover" pointerEvents="none" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <Image source={require('../../../assets/img/Frame-1.png')} style={styles.topFrame} resizeMode="cover" pointerEvents="none" />
            <Image source={require('../../../assets/SVY-Logo-01.png')} style={styles.logo} />
          </View>

          <View style={styles.formSection}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#003057" />
              <Text style={styles.backText}>Back to Login</Text>
            </TouchableOpacity>

            <Text style={styles.welcomeTitle}>Create New Password</Text>
            <Text style={styles.subtitle}>Secure your account</Text>
            <Text style={styles.supportText}>Enter the OTP sent to your email and your new password</Text>

            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock-clock" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit OTP"
                placeholderTextColor="#A0AEC0"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="New Password (min 8 chars)"
                placeholderTextColor="#A0AEC0"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#A0AEC0"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.signInBtn} onPress={handleResetPassword} disabled={loading} activeOpacity={0.85}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.signInText}>Reset Password</Text>
                  <View style={styles.signInIconCircle}>
                    <MaterialIcons name="check" size={18} color="#003057" />
                  </View>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {errorModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialIcons name="error" size={64} color="#EF4444" style={{ alignSelf: 'center', marginBottom: 16 }} />
              <Text style={styles.modalTitle}>Error</Text>
              <Text style={styles.modalDesc}>{errorModal}</Text>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setErrorModal(null)}>
                <Text style={styles.modalBtnText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {successModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialIcons name="check-circle" size={64} color="#10B981" style={{ alignSelf: 'center', marginBottom: 16 }} />
              <Text style={styles.modalTitle}>Success!</Text>
              <Text style={styles.modalDesc}>Password reset successful!</Text>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#003057' }]} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.modalBtnText}>Go to Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerSection: {
    backgroundColor: '#003057',
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    height: 200,
  },
  topFrame: {
    position: 'absolute',
    top: -10,
    left: 50,
    right: 0,
    width: '70%',
    height: '100%',
    opacity: 100,
    zIndex: 1,
    tintColor: '#ffffffff',
  },
  logo: {
    width: 200,
    height: 110,
    resizeMode: 'contain',
    zIndex: 2,
  },
  formSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -30,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 60,
    position: 'relative',
    zIndex: 2,
  },
  bottomFrame: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: 100,
    opacity: 0.90,
    zIndex: 0,
    transform: [{ rotate: '180deg' }],
    tintColor: '#2b6230ff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    fontSize: 14,
    fontFamily: 'WorkSans-Medium',
    color: '#003057',
    marginLeft: 8,
  },
  welcomeTitle: {
    fontSize: 22,
    fontFamily: 'JosefinSans-Bold',
    color: '#010a1bff',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'JosefinSans-Bold',
    color: '#244484ff',
    textAlign: 'center',
    marginBottom: 4,
  },
  supportText: {
    fontSize: 13,
    fontFamily: 'WorkSans-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 16,
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
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: 'WorkSans-Medium',
    color: '#1A2B4C',
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
    marginTop: 10,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1B3B6F',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalBtn: {
    backgroundColor: '#003057',
    paddingVertical: 14,
    borderRadius: 12,
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
