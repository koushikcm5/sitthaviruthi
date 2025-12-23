import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Modal } from 'react-native';
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
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.iconCircle}>
              <Text style={styles.logo}>🔑</Text>
            </View>
            <Text style={styles.title}>Create New Password</Text>
            <Text style={styles.subtitle}>Enter your new password</Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit OTP"
              placeholderTextColor="#8E8E93"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
            />

            <TextInput
              style={styles.input}
              placeholder="New Password (min 8 chars)"
              placeholderTextColor="#8E8E93"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#8E8E93"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.buttonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {errorModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialIcons name="error" size={56} color="#EF4444" style={{marginBottom: 16}} />
              <Text style={styles.modalTitle}>Error</Text>
              <Text style={styles.modalDesc}>{errorModal}</Text>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#EF4444'}]} onPress={() => setErrorModal(null)}>
                <Text style={styles.modalBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {successModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialIcons name="check-circle" size={56} color="#10B981" style={{marginBottom: 16}} />
              <Text style={styles.modalTitle}>Success!</Text>
              <Text style={styles.modalDesc}>Password reset successful!</Text>
              <TouchableOpacity style={styles.modalBtn} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.modalBtnText}>Go to Login</Text>
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
    backgroundColor: '#F5F7FA',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#00A8A8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    fontSize: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1B3B6F',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  input: {
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 16,
    color: '#1B3B6F',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  button: {
    backgroundColor: '#00A8A8',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#00A8A8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, alignItems: 'center', width: '85%', maxWidth: 360, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1B3B6F', marginBottom: 10, textAlign: 'center' },
  modalDesc: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  modalBtn: { backgroundColor: '#00A8A8', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 10, width: '100%' },
  modalBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', textAlign: 'center', letterSpacing: 0.3 }
});
