import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString()}</Text>

        <Text style={styles.intro}>
          Sittha Viruthi Yoga ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
        </Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        
        <Text style={styles.subTitle}>1.1 Personal Information</Text>
        <Text style={styles.text}>We collect the following personal information:</Text>
        <Text style={styles.bullet}>• Name and username</Text>
        <Text style={styles.bullet}>• Email address</Text>
        <Text style={styles.bullet}>• Phone number</Text>
        <Text style={styles.bullet}>• Password (encrypted)</Text>
        <Text style={styles.bullet}>• Profile information</Text>

        <Text style={styles.subTitle}>1.2 Usage Data</Text>
        <Text style={styles.text}>We automatically collect:</Text>
        <Text style={styles.bullet}>• Daily attendance records</Text>
        <Text style={styles.bullet}>• Routine completion status</Text>
        <Text style={styles.bullet}>• Habit tracking data</Text>
        <Text style={styles.bullet}>• Video viewing history</Text>
        <Text style={styles.bullet}>• Workshop participation</Text>
        <Text style={styles.bullet}>• Progress through 3-level program</Text>
        <Text style={styles.bullet}>• Device information and timestamps</Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.text}>We use your information to:</Text>
        <Text style={styles.bullet}>• Provide and maintain the yoga program</Text>
        <Text style={styles.bullet}>• Track your progress through levels</Text>
        <Text style={styles.bullet}>• Send appointment confirmations</Text>
        <Text style={styles.bullet}>• Answer your questions (Q&A system)</Text>
        <Text style={styles.bullet}>• Send notifications about workshops</Text>
        <Text style={styles.bullet}>• Improve our services</Text>
        <Text style={styles.bullet}>• Communicate with you via email</Text>
        <Text style={styles.bullet}>• Ensure account security</Text>

        <Text style={styles.sectionTitle}>3. Data Storage and Security</Text>
        <Text style={styles.text}>
          Your data is stored securely on our servers. We implement industry-standard security measures including:
        </Text>
        <Text style={styles.bullet}>• Password encryption using BCrypt</Text>
        <Text style={styles.bullet}>• JWT token authentication</Text>
        <Text style={styles.bullet}>• Secure HTTPS connections</Text>
        <Text style={styles.bullet}>• Regular security updates</Text>
        <Text style={styles.bullet}>• Access controls and monitoring</Text>

        <Text style={styles.sectionTitle}>4. Data Sharing</Text>
        <Text style={styles.text}>
          We do NOT sell your personal information. We may share your data only:
        </Text>
        <Text style={styles.bullet}>• With your explicit consent</Text>
        <Text style={styles.bullet}>• To comply with legal obligations</Text>
        <Text style={styles.bullet}>• To protect our rights and safety</Text>
        <Text style={styles.bullet}>• With service providers (email, hosting)</Text>

        <Text style={styles.sectionTitle}>5. Your Rights</Text>
        <Text style={styles.text}>You have the right to:</Text>
        <Text style={styles.bullet}>• Access your personal data</Text>
        <Text style={styles.bullet}>• Correct inaccurate data</Text>
        <Text style={styles.bullet}>• Request data deletion</Text>
        <Text style={styles.bullet}>• Export your data</Text>
        <Text style={styles.bullet}>• Withdraw consent</Text>
        <Text style={styles.bullet}>• Object to data processing</Text>

        <Text style={styles.sectionTitle}>6. Data Retention</Text>
        <Text style={styles.text}>
          We retain your data for as long as your account is active. If you delete your account, we will remove your personal information within 30 days, except where required by law.
        </Text>

        <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
        <Text style={styles.text}>
          Our service is intended for users aged 13 and above. We do not knowingly collect information from children under 13.
        </Text>

        <Text style={styles.sectionTitle}>8. Cookies and Tracking</Text>
        <Text style={styles.text}>
          We use authentication tokens to maintain your session. We do not use third-party tracking cookies.
        </Text>

        <Text style={styles.sectionTitle}>9. Email Communications</Text>
        <Text style={styles.text}>
          We send emails for:
        </Text>
        <Text style={styles.bullet}>• Password reset requests</Text>
        <Text style={styles.bullet}>• Appointment confirmations</Text>
        <Text style={styles.bullet}>• Important account updates</Text>
        <Text style={styles.text}>
          You can opt-out of non-essential emails at any time.
        </Text>

        <Text style={styles.sectionTitle}>10. Changes to Privacy Policy</Text>
        <Text style={styles.text}>
          We may update this Privacy Policy periodically. We will notify you of significant changes via email or app notification.
        </Text>

        <Text style={styles.sectionTitle}>11. Contact Us</Text>
        <Text style={styles.text}>
          For privacy concerns or data requests, contact us at:
        </Text>
        <Text style={styles.contact}>Email: privacy@sitthaviruthiyoga.com</Text>
        <Text style={styles.contact}>Phone: [Your Phone Number]</Text>
        <Text style={styles.contact}>Address: [Your Business Address]</Text>

        <Text style={styles.sectionTitle}>12. GDPR Compliance (EU Users)</Text>
        <Text style={styles.text}>
          If you are in the European Union, you have additional rights under GDPR including data portability and the right to lodge a complaint with a supervisory authority.
        </Text>

        <Text style={styles.sectionTitle}>13. CCPA Compliance (California Users)</Text>
        <Text style={styles.text}>
          California residents have the right to know what personal information is collected, request deletion, and opt-out of sale (we do not sell data).
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using Sittha Viruthi Yoga, you agree to this Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#1B3B6F',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
  },
  intro: {
    fontSize: 16,
    color: '#1B3B6F',
    lineHeight: 24,
    marginBottom: 24,
    backgroundColor: '#E0F2FE',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00A8A8',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1B3B6F',
    marginTop: 24,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  subTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#00A8A8',
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
  bullet: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
    marginLeft: 16,
    marginBottom: 6,
  },
  contact: {
    fontSize: 15,
    color: '#00A8A8',
    fontWeight: '600',
    marginLeft: 16,
    marginBottom: 6,
  },
  footer: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginTop: 32,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  footerText: {
    fontSize: 15,
    color: '#92400E',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
});
