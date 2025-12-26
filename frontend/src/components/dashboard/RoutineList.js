import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getFontFamily } from '../../styles/fonts';

const bodyRegular = 'WorkSans-Regular';
const headingBold = getFontFamily('heading', 'bold');
const headingMedium = getFontFamily('heading', 'medium');

const steps = [
    { id: 1, title: 'Chakra Cleansing' },
    { id: 2, title: 'Forgiveness' },
    { id: 3, title: 'Awareness' },
    { id: 4, title: 'Meditation' },
    { id: 5, title: 'Manifestation' },
    { id: 6, title: 'Tharpanam/Thithi' },
    { id: 7, title: 'Healing - Self & Family' },
];

const RoutineList = ({ completedSteps, navigation, onCompleteRoutine }) => {
    return (
        <View style={styles.card}>
            <Text style={styles.cardTitleBold}>Daily Routine (7 Steps)</Text>
            <Text style={styles.dateText}>{new Date().toLocaleDateString()}</Text>

            {steps.map((step) => (
                <TouchableOpacity
                    key={step.id}
                    style={styles.stepCard}
                    onPress={() => navigation.navigate('RoutineDetail', { step: step.id })}
                >
                    <View style={styles.stepHeader}>
                        <Text style={styles.stepNumber}>{step.id}</Text>
                        <Text style={styles.stepTitle}>{step.title}</Text>
                        {completedSteps[step.id] && <Text style={styles.checkMark}>✓</Text>}
                    </View>
                </TouchableOpacity>
            ))}

            {Object.keys(completedSteps).filter(k => parseInt(k) >= 1 && parseInt(k) <= 7).length === 7 && (
                <TouchableOpacity style={styles.nextBtn} onPress={onCompleteRoutine}>
                    <Text style={styles.nextBtnText}>Complete Daily Routine →</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#b37e68', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
    cardTitleBold: { fontSize: 17, color: '#063159', marginBottom: 12, fontFamily: 'JosefinSans-Bold' },
    dateText: { fontSize: 12, color: '#66483c', marginBottom: 12, fontFamily: bodyRegular },
    stepCard: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 8, marginBottom: 6, borderWidth: 1, borderColor: '#ffcbb5', shadowColor: '#b37e68', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
    stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    stepNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#516f8b', color: '#fff', fontFamily: headingMedium, fontSize: 13, textAlign: 'center', lineHeight: 28, overflow: 'hidden' },
    stepTitle: { flex: 1, fontSize: 15, color: '#04223e', letterSpacing: 0.1, fontFamily: headingBold },
    checkMark: { fontSize: 18, color: '#28a745', fontWeight: '800' },
    nextBtn: { backgroundColor: '#516f8b', padding: 16, borderRadius: 12, marginTop: 16 },
    nextBtnText: { color: '#fff', fontSize: 16, textAlign: 'center', fontFamily: headingBold },
});

export default RoutineList;
