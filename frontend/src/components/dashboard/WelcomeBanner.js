import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getFontFamily } from '../../styles/fonts';

const bodyRegular = 'WorkSans-Regular';
const headingBold = getFontFamily('heading', 'bold');

const WelcomeBanner = ({ daysCompleted, user, getLevelName }) => {
    return (
        <View style={styles.welcomeBanner}>
            <View style={styles.bannerGradient}>
                <Text style={styles.bannerTitle}>Welcome to Your Journey</Text>
                <Text style={styles.bannerSubtitle}>Transform your life</Text>
                <View style={styles.bannerStats}>
                    <View style={styles.bannerStatItem}>
                        <Text style={styles.bannerStatValue}>{daysCompleted}</Text>
                        <Text style={styles.bannerStatLabel}>Days</Text>
                    </View>
                    <View style={styles.bannerDivider} />
                    <View style={styles.bannerStatItem}>
                        <Text style={styles.bannerStatValue}>Level {user.level}</Text>
                        <Text style={styles.bannerStatLabel}>{getLevelName(user.level)}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    welcomeBanner: { borderRadius: 12, marginBottom: 10, overflow: 'hidden', shadowColor: '#667eea', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    bannerGradient: { backgroundColor: '#1B3B6F', padding: 12, alignItems: 'center' },
    bannerTitle: {
        fontSize: 16,
        fontFamily: 'JosefinSans-Bold',
        color: '#E5E7EB',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 4,
        letterSpacing: 0.3,
        lineHeight: 20,
    },
    bannerSubtitle: { fontSize: 11, color: '#E5E7EB', marginBottom: 8, textAlign: 'center', fontFamily: 'WorkSans-Regular' },
    bannerStats: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    bannerStatItem: { alignItems: 'center' },
    bannerStatValue: { fontSize: 18, color: '#FFD700', marginBottom: 2, fontFamily: headingBold },
    bannerStatLabel: { fontSize: 9, color: '#E5E7EB', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: bodyRegular },
    bannerDivider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.3)' },
});

export default WelcomeBanner;
