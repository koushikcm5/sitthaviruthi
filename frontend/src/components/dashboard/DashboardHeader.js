import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getFontFamily } from '../../styles/fonts';

const bodyRegular = 'WorkSans-Regular';
const bodyBold = getFontFamily('body', 'bold');

const DashboardHeader = ({ user, unreadCount, navigation, setMenuModal, getStatusBarHeight, getLevelColor }) => {
    return (
        <View style={[styles.header, { paddingTop: getStatusBarHeight() + 16 }]}>
            <View style={styles.headerLeft}>
                <View style={styles.avatar}>
                    {user.profilePicture ? (
                        <Image source={{ uri: user.profilePicture }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                    ) : (
                        <Text style={styles.avatarText}>{user.name[0]?.toUpperCase()}</Text>
                    )}
                </View>
                <View>
                    <Text style={styles.greeting}>Hello, {user.name}</Text>
                    <View style={[styles.levelPill, { backgroundColor: getLevelColor(user.level) }]}>
                        <Text style={styles.levelText}>Level {user.level}</Text>
                    </View>
                </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
                    <MaterialIcons name="notifications" size={28} color="#ffcbb5" />
                    {unreadCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{unreadCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => setMenuModal(true)}>
                    <MaterialIcons name="menu" size={28} color="#ffcbb5" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: { backgroundColor: '#F5F7FA', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#b37e68', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1B3B6F', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#FFFFFF', fontSize: 18, fontFamily: bodyRegular },
    greeting: { color: '#1B3B6F', fontSize: 16, fontFamily: bodyRegular, flexShrink: 1 },
    levelPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginTop: 4 },
    levelText: { color: '#fff', fontSize: 11, fontFamily: bodyRegular },
    iconBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
    badge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#E74C3C', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
    badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', fontFamily: bodyBold },
});

export default DashboardHeader;
