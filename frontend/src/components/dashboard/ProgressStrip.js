import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const bodyRegular = 'WorkSans-Regular';

const ProgressStrip = ({ user, daysCompleted }) => {
    const getProgressWidth = () => {
        if (user.level === 1) return Math.min((daysCompleted / 120) * 100, 100);
        if (user.level === 2) return Math.min(((daysCompleted - 120) / 120) * 100, 100);
        if (user.level === 3) return Math.min(((daysCompleted - 240) / 120) * 100, 100);
        return 0;
    };

    const getProgressText = () => {
        if (user.level === 1) return `${daysCompleted}/120 days to Level 2`;
        if (user.level === 2) return `${daysCompleted - 120}/120 days to Level 3`;
        if (user.level === 3) return `${daysCompleted - 240}/120 days - Completed!`;
        return '';
    };

    return (
        <View style={styles.progressStrip}>
            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${getProgressWidth()}%` }]} />
            </View>
            <Text style={styles.progressLabel}>{getProgressText()}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    progressStrip: { backgroundColor: '#F5F7FA', padding: 12 },
    progressBar: { height: 6, backgroundColor: '#ffe1d5', borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#b37e68' },
    progressLabel: { color: '#1B3B6F', fontSize: 12, marginTop: 6, textAlign: 'center', fontFamily: bodyRegular },
});

export default ProgressStrip;
