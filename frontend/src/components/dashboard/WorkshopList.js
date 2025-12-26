import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getFontFamily } from '../../styles/fonts';

const bodyRegular = 'WorkSans-Regular';
const headingBold = getFontFamily('heading', 'bold');

const WorkshopList = ({ workshops, selectedLevel, getLevelName, getLevelColor, title = "Upcoming Workshops", subtitle }) => {
    return (
        <View style={styles.luxuryCard}>
            <View style={styles.luxuryCardHeader}>
                <MaterialIcons name="event" size={24} color="#ffb495" />
                <Text style={[styles.cardTitleBold, { marginBottom: 0 }]}>{title}</Text>
            </View>
            {subtitle ? (
                <Text style={styles.workshopSubtitle}>{subtitle}</Text>
            ) : (
                selectedLevel && <Text style={styles.workshopSubtitle}>Level {selectedLevel} - {getLevelName(selectedLevel)}</Text>
            )}
            {Array.isArray(workshops) && workshops.length > 0 ? (
                workshops.map((workshop) => (
                    <View key={workshop?.id || Math.random()} style={styles.premiumWorkshopCard}>
                        <View style={styles.workshopBadgeRow}>
                            <View style={[styles.levelBadge, { backgroundColor: getLevelColor(workshop?.level || 1) }]}>
                                <Text style={styles.levelBadgeText}>Level {workshop?.level || 1}</Text>
                            </View>
                            <Text style={styles.workshopTime}>
                                {workshop?.startTime ? new Date(workshop.startTime).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }) : 'TBD'}
                            </Text>
                        </View>
                        <Text style={styles.premiumWorkshopTitle}>{workshop?.title || 'Workshop'}</Text>
                        <Text style={styles.workshopDesc}>{workshop?.description || ''}</Text>
                        <TouchableOpacity
                            style={styles.premiumJoinBtn}
                            onPress={() => workshop?.link && Linking.openURL(workshop.link)}>
                            <MaterialIcons name="open-in-new" size={20} color="#FFF" />
                            <Text style={styles.joinBtnText}>Join Workshop</Text>
                        </TouchableOpacity>
                    </View>
                ))
            ) : (
                <View style={styles.emptyState}>
                    <MaterialIcons name="event-available" size={48} color="#E5E7EB" />
                    <Text style={styles.emptyStateText}>No workshops scheduled</Text>
                    <Text style={styles.emptyStateSubtext}>Check back soon</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    luxuryCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
    luxuryCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    cardTitleBold: { fontSize: 17, color: '#063159', marginBottom: 12, fontFamily: 'JosefinSans-Bold' },
    workshopSubtitle: { fontSize: 12, color: '#999', marginBottom: 12, fontFamily: bodyRegular },
    premiumWorkshopCard: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#b37e68', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
    workshopBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    levelBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 12 },
    levelBadgeText: { color: '#fff', fontSize: 12, fontFamily: bodyRegular },
    workshopTime: { fontSize: 11, color: '#b37e68', fontFamily: headingBold },
    premiumWorkshopTitle: { fontSize: 14, color: '#1B3B6F', marginBottom: 6, letterSpacing: 0.1, fontFamily: headingBold },
    workshopDesc: { fontSize: 11, color: '#666', marginBottom: 6, fontFamily: bodyRegular },
    premiumJoinBtn: { backgroundColor: '#063159', padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, shadowColor: '#b37e68', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
    joinBtnText: { color: '#fff', fontSize: 13, textAlign: 'center', fontFamily: headingBold },
    emptyState: { alignItems: 'center', paddingVertical: 20 },
    emptyStateText: { fontSize: 14, color: '#6B7280', marginTop: 8, marginBottom: 2, fontFamily: headingBold },
    emptyStateSubtext: { fontSize: 12, color: '#9CA3AF', fontFamily: bodyRegular },
});

export default WorkshopList;
