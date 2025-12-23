import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function TermsOfServiceScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString()}</Text>

        <Text style={styles.intro}>
          Welcome to Sittha Viruthi Yoga. By accessing or using our mobile application, you agree to be bound by these Terms of Service. Please read them carefully.
        </Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.text}>
          By creating an account and using Sittha Viruthi Yoga, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
        </Text>

        <Text style={styles.sectionTitle}>2. Eligibility</Text>
        <Text style={styles.text}>
          You must be at least 13 years old to use this service. By using the app, you represent that you meet this age requirement and have the legal capacity to enter into this agreement.
        </Text>

        <Text style={styles.sectionTitle}>3. Account Registration</Text>
        <Text style={styles.text}>To use our services, you must:</Text>
        <Text style={styles.bullet}>• Provide accurate and complete information</Text>
        <Text style={styles.bullet}>• Maintain the security of your password</Text>
        <Text style={styles.bullet}>• Accept responsibility for all activities under your account</Text>
        <Text style={styles.bullet}>• Notify us immediately of unauthorized access</Text>
        <Text style={styles.bullet}>• Wait for admin approval before accessing the app</Text>

        <Text style={styles.sectionTitle}>4. Program Structure</Text>
        <Text style={styles.text}>
          Sittha Viruthi Yoga offers a 3-level program (360 days total):
        </Text>
        <Text style={styles.bullet}>• Level 1: NarKarma Viruthi (120 days)</Text>
        <Text style={styles.bullet}>• Level 2: Suya Viruthi (120 days)</Text>
        <Text style={styles.bullet}>• Level 3: Yoga Viruthi (120 days)</Text>
        <Text style={styles.text}>
          Progress through levels is tracked by the system. Completion of daily routines and habits is required for advancement.
        </Text>

        <Text style={styles.sectionTitle}>5. User Responsibilities</Text>
        <Text style={styles.text}>You agree to:</Text>
        <Text style={styles.bullet}>• Mark daily attendance honestly</Text>
        <Text style={styles.bullet}>• Complete the 7-step daily routine</Text>
        <Text style={styles.bullet}>• Track habits accurately</Text>
        <Text style={styles.bullet}>• Attend scheduled workshops and appointments</Text>
        <Text style={styles.bullet}>• Use the app for personal, non-commercial purposes</Text>
        <Text style={styles.bullet}>• Not share your account credentials</Text>
        <Text style={styles.bullet}>• Not attempt to hack or disrupt the service</Text>

        <Text style={styles.sectionTitle}>6. Content and Intellectual Property</Text>
        <Text style={styles.text}>
          All content including videos, routines, habits, and workshop materials are owned by Sittha Viruthi Yoga and protected by copyright laws. You may not:
        </Text>
        <Text style={styles.bullet}>• Copy, distribute, or reproduce content</Text>
        <Text style={styles.bullet}>• Record or download videos</Text>
        <Text style={styles.bullet}>• Share content with non-users</Text>
        <Text style={styles.bullet}>• Use content for commercial purposes</Text>

        <Text style={styles.sectionTitle}>7. Appointments and Workshops</Text>
        <Text style={styles.text}>
          When requesting appointments or joining workshops:
        </Text>
        <Text style={styles.bullet}>• Provide accurate availability information</Text>
        <Text style={styles.bullet}>• Attend scheduled sessions on time</Text>
        <Text style={styles.bullet}>• Cancel at least 24 hours in advance</Text>
        <Text style={styles.bullet}>• Respect instructor time and guidelines</Text>
        <Text style={styles.text}>
          Repeated no-shows may result in appointment privileges being revoked.
        </Text>

        <Text style={styles.sectionTitle}>8. Q&A System</Text>
        <Text style={styles.text}>
          When using the Q&A feature:
        </Text>
        <Text style={styles.bullet}>• Ask relevant, respectful questions</Text>
        <Text style={styles.bullet}>• Do not spam or abuse the system</Text>
        <Text style={styles.bullet}>• Wait for admin response (typically 24-48 hours)</Text>
        <Text style={styles.bullet}>• Do not share personal medical information</Text>

        <Text style={styles.sectionTitle}>9. Prohibited Conduct</Text>
        <Text style={styles.text}>You may not:</Text>
        <Text style={styles.bullet}>• Violate any laws or regulations</Text>
        <Text style={styles.bullet}>• Harass, abuse, or harm others</Text>
        <Text style={styles.bullet}>• Impersonate others</Text>
        <Text style={styles.bullet}>• Upload malicious code or viruses</Text>
        <Text style={styles.bullet}>• Interfere with app functionality</Text>
        <Text style={styles.bullet}>• Scrape or data mine the app</Text>
        <Text style={styles.bullet}>• Create multiple accounts</Text>

        <Text style={styles.sectionTitle}>10. Health and Safety Disclaimer</Text>
        <Text style={styles.text}>
          Sittha Viruthi Yoga provides educational content. We are not medical professionals. You should:
        </Text>
        <Text style={styles.bullet}>• Consult your doctor before starting any yoga program</Text>
        <Text style={styles.bullet}>• Practice at your own risk</Text>
        <Text style={styles.bullet}>• Stop if you experience pain or discomfort</Text>
        <Text style={styles.bullet}>• Not rely on the app for medical advice</Text>
        <Text style={styles.text}>
          We are not liable for any injuries or health issues arising from your use of the program.
        </Text>

        <Text style={styles.sectionTitle}>11. Payment and Refunds</Text>
        <Text style={styles.text}>
          If applicable:
        </Text>
        <Text style={styles.bullet}>• All fees are stated clearly before purchase</Text>
        <Text style={styles.bullet}>• Payments are processed securely</Text>
        <Text style={styles.bullet}>• Refund policy will be provided separately</Text>
        <Text style={styles.bullet}>• Subscription terms will be clearly stated</Text>

        <Text style={styles.sectionTitle}>12. Account Termination</Text>
        <Text style={styles.text}>
          We reserve the right to suspend or terminate your account if you:
        </Text>
        <Text style={styles.bullet}>• Violate these Terms of Service</Text>
        <Text style={styles.bullet}>• Engage in prohibited conduct</Text>
        <Text style={styles.bullet}>• Provide false information</Text>
        <Text style={styles.bullet}>• Abuse the service</Text>
        <Text style={styles.text}>
          You may delete your account at any time through the app settings.
        </Text>

        <Text style={styles.sectionTitle}>13. Limitation of Liability</Text>
        <Text style={styles.text}>
          Sittha Viruthi Yoga is provided "as is" without warranties. We are not liable for:
        </Text>
        <Text style={styles.bullet}>• Service interruptions or errors</Text>
        <Text style={styles.bullet}>• Data loss</Text>
        <Text style={styles.bullet}>• Indirect or consequential damages</Text>
        <Text style={styles.bullet}>• Third-party actions</Text>
        <Text style={styles.bullet}>• Health issues or injuries</Text>

        <Text style={styles.sectionTitle}>14. Indemnification</Text>
        <Text style={styles.text}>
          You agree to indemnify and hold harmless Sittha Viruthi Yoga from any claims, damages, or expenses arising from your use of the service or violation of these terms.
        </Text>

        <Text style={styles.sectionTitle}>15. Changes to Terms</Text>
        <Text style={styles.text}>
          We may modify these Terms of Service at any time. Continued use of the app after changes constitutes acceptance of the new terms. We will notify you of significant changes.
        </Text>

        <Text style={styles.sectionTitle}>16. Governing Law</Text>
        <Text style={styles.text}>
          These terms are governed by the laws of [Your Jurisdiction]. Any disputes will be resolved in the courts of [Your Jurisdiction].
        </Text>

        <Text style={styles.sectionTitle}>17. Contact Information</Text>
        <Text style={styles.text}>
          For questions about these Terms of Service:
        </Text>
        <Text style={styles.contact}>Email: support@sitthaviruthiyoga.com</Text>
        <Text style={styles.contact}>Phone: [Your Phone Number]</Text>
        <Text style={styles.contact}>Address: [Your Business Address]</Text>

        <Text style={styles.sectionTitle}>18. Severability</Text>
        <Text style={styles.text}>
          If any provision of these terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
        </Text>

        <Text style={styles.sectionTitle}>19. Entire Agreement</Text>
        <Text style={styles.text}>
          These Terms of Service, together with our Privacy Policy, constitute the entire agreement between you and Sittha Viruthi Yoga.
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using Sittha Viruthi Yoga, you acknowledge that you have read and agree to these Terms of Service.
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
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1B3B6F',
    marginTop: 24,
    marginBottom: 12,
    letterSpacing: 0.3,
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
    backgroundColor: '#DBEAFE',
    padding: 16,
    borderRadius: 12,
    marginTop: 32,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  footerText: {
    fontSize: 15,
    color: '#1E40AF',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
});
