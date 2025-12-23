import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image, ActivityIndicator, Modal, Keyboard } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { authAPI } from '../../services/api';
import { validateEmail, validatePhone, validatePassword, validateUsername, validateName } from '../../utils/validation';
import { notificationService } from '../../services/notificationService';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState(null);
  const [successModal, setSuccessModal] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);


  const handleRegister = async () => {
    if (!name || !username || !email || !phone || !password || !confirmPassword) {
      setErrorModal('Please fill all fields');
      return;
    }
    
    const nameError = validateName(name);
    if (nameError) {
      setErrorModal(nameError);
      return;
    }
    
    const usernameError = validateUsername(username);
    if (usernameError) {
      setErrorModal(usernameError);
      return;
    }
    
    const emailError = validateEmail(email);
    if (emailError) {
      setErrorModal(emailError);
      return;
    }
    
    const phoneError = validatePhone(phone);
    if (phoneError) {
      setErrorModal(phoneError);
      return;
    }
    
    const passwordError = validatePassword(password);
    if (passwordError) {
      setErrorModal(passwordError);
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorModal('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authAPI.register(name, username, email, phone, password);
      // Send welcome notification
      await notificationService.notifyRegistrationSuccess(username);
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
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} scrollEnabled={isKeyboardVisible}>
          <View style={styles.headerSection}>
            <View style={styles.mandalaPattern} />
            <Image source={require('../../../assets/SVY-Logo-01.png')} style={styles.logo} />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.welcomeTitle}>Join Sittha Viruthi Yoga</Text>
            <Text style={styles.subtitle}>Begin Your Journey to Self</Text>
            <Text style={styles.supportText}>Create your account to start your transformation</Text>

            <View style={styles.formContainer}>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputWrapper}>
                <MaterialIcons name="account-circle" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Username (unique)"
                  placeholderTextColor="#9CA3AF"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputWrapper}>
                <MaterialIcons name="email" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputWrapper}>
                <MaterialIcons name="phone" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor="#9CA3AF"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password (min 8 chars)"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                  <MaterialIcons name={showConfirmPassword ? "visibility" : "visibility-off"} size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.signInBtn} onPress={handleRegister} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.signInText}>Create Account</Text>
                    <View style={styles.signInIconCircle}>
                      <MaterialIcons name="arrow-forward" size={18} color="#003057" />
                    </View>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an Account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.signUpText}>Sign In</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.legalLinks}>
                <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
                  <Text style={styles.legalText}>Privacy Policy</Text>
                </TouchableOpacity>
                <Text style={styles.legalSeparator}> • </Text>
                <TouchableOpacity onPress={() => navigation.navigate('TermsOfService')}>
                  <Text style={styles.legalText}>Terms of Service</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.bottomMandala} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {errorModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialIcons name="error" size={64} color="#EF4444" style={{alignSelf: 'center', marginBottom: 16}} />
              <Text style={styles.modalTitle}>Registration Error</Text>
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
              <View style={styles.successIconCircle}>
                <MaterialIcons name="check" size={40} color="#FFFFFF" />
              </View>
              <Text style={styles.modalTitle}>Registration Successful!</Text>
              <Text style={styles.modalDesc}>Your account has been created successfully. Please wait for admin approval to access the app.</Text>
              <TouchableOpacity style={styles.modalBtn} onPress={() => { setSuccessModal(false); navigation.navigate('Login'); }}>
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
    backgroundColor: '#FFFFFF',
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
    paddingBottom: 24,
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
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  formSection: {
    flex: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 60,
  },
  welcomeTitle: {
    fontSize: 18,
    fontFamily: 'JosefinSans-Bold',
    color: '#003057',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: 0.3,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'JosefinSans-Bold',
    color: '#E8B490',
    textAlign: 'center',
    marginBottom: 3,
    lineHeight: 16,
  },
  supportText: {
    fontSize: 11,
    fontFamily: 'WorkSans-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  formContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
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
    paddingVertical: 12,
    fontSize: 13,
    fontFamily: 'WorkSans-Medium',
    color: '#1A2B4C',
  },
  eyeIcon: {
    padding: 8,
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
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
  signInText: {
    color: '#FFFFFF',
    fontSize: 15,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 12,
    fontFamily: 'WorkSans-Regular',
  },
  signUpText: {
    color: '#4A6984',
    fontSize: 12,
    fontFamily: 'WorkSans-Bold',
    textDecorationLine: 'underline',
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  legalText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontFamily: 'WorkSans-Regular',
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    color: '#9CA3AF',
    fontSize: 11,
    fontFamily: 'WorkSans-Regular',
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
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'JosefinSans-Bold',
    color: '#1B3B6F',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 13,
    fontFamily: 'WorkSans-Regular',
    color: '#6B7280',
    marginBottom: 18,
    textAlign: 'center',
    lineHeight: 19,
  },
  modalBtn: {
    backgroundColor: '#00A8A8',
    paddingVertical: 12,
    borderRadius: 10,
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'JosefinSans-Bold',
    textAlign: 'center',
  },
  successIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
});
