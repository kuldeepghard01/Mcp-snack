import React from 'react';
import { Text, View, ScrollView } from 'react-native';
import { styles } from './styles';
import { C, Btn } from './ui';
import { getEmail } from './api';
import { fmtNum, APP_VERSION } from './constants';

export default function ProfileTab({ profile, onTerms, onLogout, onDelete }) {
  return (
    <ScrollView style={styles.listSection}>
      <View style={styles.adminCard}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>{'👤 ' + (profile ? profile.name : '')}</Text>
        <Text style={{ color: C.sub, fontSize: 12 }}>{'✉️ ' + getEmail()}</Text>
        <Text style={{ color: C.sub, fontSize: 12 }}>{'📞 ' + (profile && profile.phone ? '+' + profile.phone : '-')}</Text>
        <View style={{ marginTop: 14, padding: 12, backgroundColor: C.card2, borderRadius: 8 }}>
          <Text style={{ color: C.sub, fontSize: 11 }}>Coins</Text>
          <Text style={{ color: C.gold, fontSize: 22, fontWeight: 'bold' }}>{'🪙 ' + fmtNum(profile ? profile.coins : 0)}</Text>
        </View>
        <Btn title="📜 Terms & Privacy" color="#333" onPress={onTerms} style={{ marginTop: 12 }} />
        <Btn title="🚪 Log out" color="#333" onPress={onLogout} style={{ marginTop: 8 }} />
        <Btn title="🗑 Delete my account" color="#7f1d1d" onPress={onDelete} style={{ marginTop: 8 }} />
        <Text style={{ color: '#555', fontSize: 10, textAlign: 'center', marginTop: 12 }}>{'Version ' + APP_VERSION}</Text>
      </View>
    </ScrollView>
  );
}
