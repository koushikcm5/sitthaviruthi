import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getFontFamily } from '../../styles/fonts';

const bodyRegular = 'WorkSans-Regular';
const headingBold = getFontFamily('heading', 'bold');

const QuickActions = ({ setActiveTab }) => {
    return (
        <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionCard} onPress={() => setActiveTab('routine')}>
                <View style={styles.quickActionIcon}>
                    <MaterialIcons name="self-improvement" size={32} color="#ffb495" />
                </View>
                <Text style={styles.quickActionTitle}>Daily Routine</Text>
                <Text style={styles.quickActionDesc}>7 Steps to Wellness</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard} onPress={() => setActiveTab('habits')}>
                <View style={styles.quickActionIcon}>
                    <MaterialIcons name="task-alt" size={32} color="#ffb495" />
                </View>
                <Text style={styles.quickActionTitle}>Habits</Text>
                <Text style={styles.quickActionDesc}>Track Progress</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    quickActions: { flexDirection: 'row', gap: 8, marginBottom: 10 },
    quickActionCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 10, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
    quickActionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F9FF', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
    quickActionTitle: { fontSize: 12, color: '#1B3B6F', marginBottom: 2, fontFamily: headingBold },
    quickActionDesc: { fontSize: 9, color: '#6B7280', fontFamily: bodyRegular },
});

export default QuickActions;
