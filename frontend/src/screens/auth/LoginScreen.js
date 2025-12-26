import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Modal, ScrollView, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { authAPI } from '../../services/api';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState(null);
  const [pendingModal, setPendingModal] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorModal('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const data = await authAPI.login(username, password);
      if (data.role === 'ADMIN') {
        navigation.navigate('AdminDashboard');
      } else {
        navigation.navigate('ChemsingDashboard', { username: data.username, name: data.name });
      }
    } catch (error) {
      if (error.message === 'EMAIL_NOT_VERIFIED') {
        setErrorModal('Please verify your email before logging in. Check your inbox for the verification token.');
      } else if (error.message === 'PENDING_APPROVAL') {
        setPendingModal(true);
      } else {
        setErrorModal(error.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('../../../assets/img/Frame-1.png')} style={styles.bottomFrame} resizeMode="cover" pointerEvents="none" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} scrollEnabled={isKeyboardVisible}>
          <View style={styles.headerSection}>
            <Image source={require('../../../assets/img/Frame-1.png')} style={styles.topFrame} resizeMode="cover" pointerEvents="none" />
            <Image source={require('../../../assets/SVY-Logo-01.png')} style={styles.logo} />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.welcomeTitle}>Welcome to{"\n"}Sittha Viruthi Yoga</Text>
            <Text style={styles.subtitle}>Yoga is the Best Journey to Self</Text>
            <Text style={styles.supportText}>Log in to your account to access your happiness</Text>

            <View style={styles.inputWrapper}>
              <MaterialIcons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="User Id"
                placeholderTextColor="#A0AEC0"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#A0AEC0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.signInBtn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.signInText}>Sign In</Text>
                  <View style={styles.signInIconCircle}>
                    <MaterialIcons name="arrow-forward" size={18} color="#003057" />
                  </View>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an Account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.signUpText}>Sign up</Text>
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {errorModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialIcons name="error" size={64} color="#EF4444" style={{ alignSelf: 'center', marginBottom: 16 }} />
              <Text style={styles.modalTitle}>{errorModal.includes('Pending') ? 'Account Pending' : 'Enter Valid Field'}</Text>
              <Text style={styles.modalDesc}>{errorModal}</Text>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setErrorModal(null)}>
                <Text style={styles.modalBtnText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {pendingModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.pendingModalContent}>
              <View style={styles.pendingIconCircle}>
                <MaterialIcons name="hourglass-empty" size={40} color="#FF9800" />
              </View>
              <Text style={styles.pendingModalTitle}>Account Pending Approval</Text>
              <Text style={styles.pendingModalDesc}>
                Your registration is under review by our admin team. You will be able to login once your account is approved.
              </Text>
              <Text style={styles.pendingModalNote}>
                This usually takes 24-48 hours. Thank you for your patience.
              </Text>
              <TouchableOpacity style={styles.pendingModalBtn} onPress={() => setPendingModal(false)}>
                <Text style={styles.pendingModalBtnText}>Understood</Text>
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
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerSection: {
    backgroundColor: '#003057',
    paddingTop: 100,
    paddingBottom: 40,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
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

    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    paddingHorizontal: 24,
    paddingTop: 24,
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
  welcomeTitle: {
    fontSize: 18,
    fontFamily: 'JosefinSans-Bold',
    color: '#010a1bff',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
    letterSpacing: 0.3,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'JosefinSans-Bold',
    color: '#244484ff',
    textAlign: 'center',
    marginBottom: 3,
    lineHeight: 16,
  },
  supportText: {
    fontSize: 12,
    fontFamily: 'WorkSans-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
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
  eyeIcon: {
    padding: 8,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: '#254866ff',
    fontSize: 13,
    fontFamily: 'WorkSans-Medium',
    textDecorationLine: 'underline',
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
    fontFamily: 'WorkSans-Regular',
  },
  signUpText: {
    color: '#254866ff',
    fontSize: 14,
    fontFamily: 'WorkSans-Bold',
    textDecorationLine: 'underline',
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
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
    backgroundColor: '#00A8A8',
    paddingVertical: 14,
    borderRadius: 12,
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  pendingModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '88%',
    maxWidth: 400,
    alignItems: 'center',
  },
  pendingIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pendingModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1B3B6F',
    marginBottom: 16,
    textAlign: 'center',
  },
  pendingModalDesc: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 22,
  },
  pendingModalNote: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  pendingModalBtn: {
    backgroundColor: '#FF9800',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
  },
  pendingModalBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
