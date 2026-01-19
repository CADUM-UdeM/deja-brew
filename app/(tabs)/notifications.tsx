import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import AppHeader from '../../components/AppHeader';

const THEME = {
  bg: '#FFF6EF',
  text: '#2A1C17',
  sub: '#7A6B62',
  card: '#FFFFFF',
  border: '#E8D9D1',
  accentDark: '#7F3B00',
};

const NOTIFS = [
    {
        id: 1,
        title: 'Nouvelle promotion 2 pour 1',
        description: 'Applicable seulement chez certaines succursales',
        tag: 'Promotion',
    },
    {
        id: 2,
        title: 'Vous avez été invité à une study date',
        description: 'Cliquez ici pour accepter',
        tag: 'Invitation',
    },
    {
        id: 3,
        title: 'New cafe recently opened nearby',
        description: 'Click here to it see on the map',
        tag: 'New cafe',
    },
];

export default function notification(){
    return (
        <View style={{ flex: 1, backgroundColor: THEME.bg }}>
            <AppHeader rightIcon="notifications-outline" />
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Notifications</Text>
                <Text style={styles.subtitle}>
                  Promotions, study invites & more.
                </Text>
        
                {NOTIFS.map((notif) => (
                  <View key={notif.id} style={styles.card}>
                    <Text style={styles.cardTag}>{notif.tag}</Text>
                    <Text style={styles.cardTitle}>{notif.title}</Text>
                    <Text style={styles.cardText}>{notif.description}</Text>
                  </View>
                ))}
              </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: THEME.sub,
    marginBottom: 16,
  },
  card: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 16,
    marginTop: 12,
  },
  cardTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F3E7E0',
    color: THEME.accentDark,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.accentDark,
    marginBottom: 4,
  },
  cardText: {
    fontSize: 13,
    color: THEME.text,
  },
});