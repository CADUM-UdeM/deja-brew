import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const THEME = {
  bg: "#FFF6EF",
  text: "#2A1C17",
  sub: "#7A6B62",
  card: "#FFFFFF",
  border: "#E8D9D1",
  accentDark: "#7F3B00",
};

// catégories de notifs : 
// 1. Nouvelles promotions
// 2. Study session invite
// 3. Study session reminder
// 4. Friend started study session
// 5. New friend request

const NOTIFS = [
  {
    id: 1,
    title: "Nouvelle promotion 2 pour 1",
    description: "Applicable seulement chez certains cafés",
    tag: "Promotion",
  },
  {
    id: 2,
    title: "Vous avez été invité à une study session",
    description: "Cliquez ici pour accepter",
    tag: "Invitation",
  },
  {
    id: 3,
    title: "Vous avez une study session dans 30 minutes",
    description: "Au café sans fil à 13h",
    tag: "Reminder",
  },
  {
    id: 4,
    title: "Votre ami(e) a commencé une nouvelle study session",
    description: "Demander à rejoindre",
    tag: "Join",
  },
  {
    id: 5,
    title: "Vous avez une nouvelle demande d'ami",
    description: "Cliquer ici pour accepter",
    tag: "Friend",
  },
];

export default function Notifications() {
  const router = useRouter();

  return (
    <>
      {/* Enlève le header automatique (barre noire + flèche + titre) */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* Barre système (Android) assortie au fond */}
      <StatusBar style="dark" backgroundColor={THEME.bg} />

      <View style={{ flex: 1, backgroundColor: THEME.bg }}>


        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View>
              <Text style={styles.title}>Notifications</Text>
              <Text style={styles.subtitle}>Promotions, study invites & more.</Text>
            </View>

            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={32} color={THEME.sub} />
            </TouchableOpacity>
          </View>

          {NOTIFS.map((notif) => (
            <View key={notif.id} style={styles.card}>
              <Text style={styles.cardTag}>{notif.tag}</Text>
              <Text style={styles.cardTitle}>{notif.title}</Text>
              <Text style={styles.cardText}>{notif.description}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "800",
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
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#F3E7E0",
    color: THEME.accentDark,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.accentDark,
    marginBottom: 4,
  },
  cardText: {
    fontSize: 13,
    color: THEME.text,
  },
});
