import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { MaterialIcons, FontAwesome, FontAwesome5 } from '@expo/vector-icons';

const headingBold = 'JosefinSans-Bold';
const bodyRegular = 'WorkSans-Regular';

export default function AboutScreen({ navigation }) {
  const appVersion = '1.0.0';

  const openLink = (url) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.appName}>Sittha Viruthi Yoga</Text>
          <Text style={styles.version}>Version {appVersion}</Text>
          <Text style={styles.tagline}>Attendance & Progress Tracking</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the Program</Text>
          <Text style={styles.text}>
            A comprehensive 3-level yoga program spanning 360 days, designed to guide you through
            NarKarma Viruthi, Suya Viruthi, and Yoga Viruthi. Track your daily routines, habits,
            and progress on your spiritual journey.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <TouchableOpacity style={styles.contactItem} onPress={() => openLink('tel:+918056959392')}>
            <MaterialIcons name="phone" size={24} color="#ffb495" />
            <Text style={styles.contactText}>+91 80569 - 59392</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem} onPress={() => openLink('https://www.sitthaviruthiyoga.com')}>
            <MaterialIcons name="language" size={24} color="#ffb495" />
            <Text style={styles.contactText}>www.sitthaviruthiyoga.com</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem}>
            <MaterialIcons name="location-on" size={24} color="#ffb495" />
            <Text style={styles.contactText}>Coimbatore, TamilNadu</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow Us</Text>
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton} onPress={() => openLink('https://www.facebook.com/sitthaviruthiyoga')}>
              <FontAwesome name="facebook" size={24} color="#1877F2" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} onPress={() => openLink('https://www.instagram.com/sitthaviruthiyoga')}>
              <FontAwesome name="instagram" size={24} color="#E4405F" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} onPress={() => openLink('https://www.youtube.com/@sitthaviruthiyoga')}>
              <FontAwesome name="youtube-play" size={24} color="#FF0000" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} onPress={() => openLink('https://twitter.com/sitthaviruthi')}>
              <Text style={styles.xLogo}>𝕏</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>

          <TouchableOpacity style={styles.legalItem} onPress={() => navigation.navigate('PrivacyPolicy')}>
            <Text style={styles.legalText}>Privacy Policy</Text>
            <MaterialIcons name="chevron-right" size={24} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.legalItem} onPress={() => navigation.navigate('TermsOfService')}>
            <Text style={styles.legalText}>Terms of Service</Text>
            <MaterialIcons name="chevron-right" size={24} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        <Text style={styles.copyright}>© 2025 Sittha Viruthi Yoga. All rights reserved.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ebelee',
  },
  header: {
    backgroundColor: '#063159',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    fontFamily: headingBold,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  appName: {
    fontSize: 28,
    color: '#063159',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.8,
    fontFamily: headingBold,
  },
  version: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: bodyRegular,
  },
  tagline: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    fontFamily: bodyRegular,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#063159',
    marginBottom: 12,
    letterSpacing: 0.5,
    fontFamily: headingBold,
  },
  text: {
    fontSize: 14,
    color: '#2e2e2e',
    lineHeight: 22,
    fontFamily: bodyRegular,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  contactText: {
    fontSize: 14,
    color: '#063159',
    marginLeft: 12,
    fontFamily: bodyRegular,
  },
  legalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  legalText: {
    fontSize: 14,
    color: '#063159',
    fontFamily: bodyRegular,
  },
  copyright: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 40,
    fontFamily: bodyRegular,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ebelee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  xLogo: {
    fontSize: 24,
    color: '#000000',
    fontFamily: headingBold,
  },
});
