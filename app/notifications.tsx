import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AppHeader from "../components/AppHeader";
import {
  acceptFriendRequest,
  acceptSessionParticipant,
  declineFriendRequest,
  declineSessionParticipant,
  fetchFriendRequests,
  fetchNotifications,
  joinSession,
  markAllNotificationsRead,
  markNotificationRead,
} from "../data/api";

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

type NotifType =
  | "FRIEND_REQUEST"
  | "FRIEND_ACCEPTED"
  | "SESSION_INVITE"
  | "SESSION_REQUEST"
  | "SESSION_ACCEPTED"
  | "SESSION_CANCELLED"
  | "PROMO_LIKED"
  | "PROMO_SAVED"
  | "REVIEW_LIKED"
  | "NEW_PROMO_NEARBY";

type NotifAction = "none" | "accepted" | "declined";

type NotificationItem = {
  id: string;
  type: NotifType;
  title: string;
  description: string;
  tag: string;
  isRead: boolean;
  action?: NotifAction;
  requestId?: string;
  sessionId?: string;
  userId?: string;
  notificationId?: string;
};

const BASE_NOTIFS: NotificationItem[] = [
  {
    id: "1",
    type: "NEW_PROMO_NEARBY",
    title: "Nouvelle promotion 2 pour 1",
    description: "Applicable seulement chez certains cafés",
    tag: "Promotion",
    isRead: false,
  },
  {
    id: "2",
    type: "SESSION_INVITE",
    title: "Léa vous a invité à une study session",
    description: "Savsav · Tonight · IFT3355",
    tag: "Session invite",
    isRead: false,
    action: "none",
  },
  {
    id: "3",
    type: "PROMO_SAVED",
    title: "Votre ami(e) a commencé une nouvelle study session",
    description: "Demander à rejoindre",
    tag: "Join",
    isRead: true,
  },
  {
    id: "5",
    type: "FRIEND_ACCEPTED",
    title: "Vous êtes maintenant amis avec Nora",
    description: "Dites bonjour et planifiez une session",
    tag: "Friend accepted",
    isRead: true,
  },
  {
    id: "6",
    type: "PROMO_LIKED",
    title: "Votre promo a été aimée",
    description: "Night owls · Savsav",
    tag: "Promo liked",
    isRead: true,
  },
  {
    id: "7",
    type: "REVIEW_LIKED",
    title: "Quelqu'un a aimé votre avis",
    description: "“Super calm with stable Wi‑Fi”",
    tag: "Review liked",
    isRead: true,
  },
];

export default function Notifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(BASE_NOTIFS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchFriendRequests()
      .then((requests) => {
        if (!mounted) return;
        const friendNotifs: NotificationItem[] = requests.map((request: any) => {
          const fromUser =
            request.fromUser ??
            request.from ??
            request.sender ??
            request.requester ??
            request.user;
          const displayName =
            fromUser?.displayName ??
            fromUser?.name ??
            request.fromDisplayName ??
            request.fromName ??
            "Someone";
          const username =
            fromUser?.username ?? request.fromUsername ?? request.fromHandle ?? null;
          const requestId = String(request._id ?? request.id ?? request.requestId ?? "");
          const status = String(request.status ?? request.state ?? "pending").toLowerCase();
          const action: NotifAction =
            status === "accepted" ? "accepted" : status === "declined" ? "declined" : "none";

          return {
            id: `fr-${requestId || displayName}`,
            type: "FRIEND_REQUEST",
            title: `${displayName} sent you a friend request`,
            description: username ? `@${username}` : "Tap to respond",
            tag: "Friend request",
            isRead: action !== "none",
            action,
            requestId: requestId || undefined,
          };
        });

        setNotifications((prev) => {
          const existingByRequestId = new Map(
            prev
              .filter((item) => item.type === "FRIEND_REQUEST" && item.requestId)
              .map((item) => [item.requestId as string, item])
          );
          const nonFriendNotifs = prev.filter((item) => item.type !== "FRIEND_REQUEST");
          const mergedFriendNotifs = friendNotifs.map((item) => {
            const existing = item.requestId
              ? existingByRequestId.get(item.requestId)
              : undefined;
            if (!existing) return item;
            return {
              ...item,
              action: existing.action ?? item.action,
              isRead: existing.isRead ?? item.isRead,
            };
          });
          return [...mergedFriendNotifs, ...nonFriendNotifs];
        });
      })
      .catch(() => { })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    fetchNotifications()
      .then((items) => {
        if (!mounted) return;
        const mapped = (items ?? [])
          .map((notif: any) => {
            const rawType = String(
              notif?.type ?? notif?.kind ?? notif?.category ?? notif?.event ?? ""
            ).toUpperCase();
            const data = notif?.data ?? notif?.payload ?? notif?.meta ?? {};
            const fromUser =
              data?.fromUser ??
              data?.sender ??
              data?.requester ??
              data?.user ??
              notif?.fromUser ??
              notif?.sender ??
              notif?.requester ??
              notif?.user;
            const id = String(notif?._id ?? notif?.id ?? notif?.notificationId ?? "");
            const sessionId = String(
              data?.sessionId ??
              data?.session?._id ??
              data?.session?.id ??
              data?.session?._id ??
              data?.session?.id ??
              data?.session ??
              notif?.sessionId ??
              ""
            );
            const userId = String(
              data?.userId ??
              data?.fromUserId ??
              data?.requesterId ??
              data?.senderId ??
              data?.user?._id ??
              data?.user?.id ??
              fromUser?._id ??
              fromUser?.id ??
              notif?.userId ??
              ""
            );
            const requestId = String(
              data?.requestId ??
              data?.friendRequestId ??
              data?.sessionRequestId ??
              data?.request?._id ??
              data?.request?.id ??
              notif?.requestId ??
              ""
            );
            const normalizedType: NotifType | null =
              rawType.includes("FRIEND") && rawType.includes("REQUEST")
                ? "FRIEND_REQUEST"
                : rawType.includes("FRIEND") && rawType.includes("ACCEPT")
                  ? "FRIEND_ACCEPTED"
                  : rawType.includes("SESSION") && rawType.includes("INVITE")
                    ? "SESSION_INVITE"
                    : rawType.includes("SESSION") && rawType.includes("REQUEST")
                      ? "SESSION_REQUEST"
                      : rawType.includes("SESSION") && rawType.includes("ACCEPT")
                        ? "SESSION_ACCEPTED"
                        : rawType.includes("SESSION") && rawType.includes("CANCEL")
                          ? "SESSION_CANCELLED"
                          : rawType.includes("PROMO") && rawType.includes("SAVED")
                            ? "PROMO_SAVED"
                            : rawType.includes("PROMO")
                              ? "PROMO_LIKED"
                              : rawType.includes("REVIEW")
                                ? "REVIEW_LIKED"
                                : rawType.includes("NEW_PROMO")
                                  ? "NEW_PROMO_NEARBY"
                                  : null;

            if (!normalizedType) return null;

            const fromName =
              fromUser?.displayName ??
              fromUser?.name ??
              data?.fromName ??
              data?.senderName ??
              data?.requesterName ??
              null;

            const title =
              notif?.title ??
              notif?.message ??
              notif?.body ??
              notif?.text ??
              (normalizedType === "SESSION_INVITE" && fromName
                ? `${fromName} invited you to a session`
                : normalizedType === "SESSION_REQUEST" && fromName
                  ? `${fromName} wants to join your session`
                  : "New notification");

            const description =
              notif?.description ??
              notif?.summary ??
              (sessionId ? `Session ${sessionId}` : "");

            const action: NotifAction =
              notif?.action ??
              (notif?.status === "accepted"
                ? "accepted"
                : notif?.status === "declined"
                  ? "declined"
                  : "none");

            return {
              id: `api-${id || Math.random().toString(36).slice(2)}`,
              type: normalizedType,
              title,
              description,
              tag:
                normalizedType === "SESSION_REQUEST"
                  ? "Session request"
                  : normalizedType === "SESSION_INVITE"
                    ? "Session invite"
                    : normalizedType === "FRIEND_REQUEST"
                      ? "Friend request"
                      : "Notification",
              isRead: Boolean(notif?.isRead ?? notif?.read),
              action,
              requestId: requestId || undefined,
              sessionId: sessionId || undefined,
              userId: userId || undefined,
              notificationId: id || undefined,
            } as NotificationItem;
          })
          .filter(Boolean) as NotificationItem[];

        if (mapped.length === 0) return;

        setNotifications((prev) => {
          const existing = new Map(prev.map((item) => [item.id, item]));
          mapped.forEach((item) => {
            existing.set(item.id, item);
          });
          return Array.from(existing.values());
        });
      })
      .catch(() => { });

    return () => {
      mounted = false;
    };
  }, []);

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isRead: !item.isRead } : item
      )
    );
  };

  const handleAction = async (notif: NotificationItem, action: NotifAction) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === notif.id ? { ...item, action, isRead: true } : item
      )
    );
    try {
      if (notif.type === "FRIEND_REQUEST" && notif.requestId) {
        if (action === "accepted") await acceptFriendRequest(notif.requestId);
        if (action === "declined") await declineFriendRequest(notif.requestId);
      }
      if (notif.type === "SESSION_REQUEST" && notif.sessionId && notif.userId) {
        if (action === "accepted")
          await acceptSessionParticipant(notif.sessionId, notif.userId);
        if (action === "declined")
          await declineSessionParticipant(notif.sessionId, notif.userId);
      }
      if (notif.type === "SESSION_INVITE" && notif.sessionId) {
        if (action === "accepted") await joinSession(notif.sessionId);
      }
      if (notif.notificationId) {
        await markNotificationRead(notif.notificationId);
      }
    } catch {
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notif.id ? { ...item, action: "none", isRead: false } : item
        )
      );
    }
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    markAllNotificationsRead().catch(() => { });
  };

  const ordered = [...notifications].sort(
    (a, b) => Number(a.isRead) - Number(b.isRead)
  );

  return (
    <>
      {/* Enlève le header automatique (barre noire + flèche + titre) */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* Barre système (Android) assortie au fond */}
      <StatusBar style="dark" backgroundColor={THEME.bg} />

      <View style={{ flex: 1, backgroundColor: THEME.bg }}>
        {/* Ton header custom, avec une flèche retour */}
        <AppHeader
          leftIcon="chevron-back"
          onLeftPress={() => router.back()}
          rightIcon={null}
          showLogo={false}
          title="Notifications"
          subtitle="Promotions, study invites & more"
          isModal={true}
        />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleRow}>
            <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          </View>

          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={THEME.accentDark} />
              <Text style={styles.loadingText}>Loading notifications...</Text>
            </View>
          )}

          {ordered.map((notif, index) => {
            const prev = ordered[index - 1];
            const showSection =
              index === 0 || notif.isRead !== prev?.isRead;
            const canAct =
              notif.action === "none" &&
              ((notif.type === "FRIEND_REQUEST" && Boolean(notif.requestId)) ||
                (notif.type === "SESSION_REQUEST" &&
                  Boolean(notif.sessionId) &&
                  Boolean(notif.userId)) ||
                (notif.type === "SESSION_INVITE" && Boolean(notif.sessionId)));

            return (
              <View key={notif.id}>
                {showSection && (
                  <Text style={styles.sectionLabel}>
                    {notif.isRead ? "Read" : "Unread"}
                  </Text>
                )}
                <TouchableOpacity
                  style={[styles.card, notif.isRead && styles.cardRead]}
                  onPress={() => toggleRead(notif.id)}
                  activeOpacity={0.9}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTag}>{notif.tag}</Text>
                    {!notif.isRead && <Text style={styles.newBadge}>New</Text>}
                  </View>
                  <Text style={styles.cardTitle}>{notif.title}</Text>
                  <Text style={styles.cardText}>{notif.description}</Text>
                  {(notif.type === "FRIEND_REQUEST" ||
                    notif.type === "SESSION_REQUEST" ||
                    notif.type === "SESSION_INVITE") && (
                      <View style={styles.actionRow}>
                        {notif.action === "none" && (
                          <>
                            <TouchableOpacity
                              style={[styles.acceptBtn, !canAct && styles.actionDisabled]}
                              onPress={() => canAct && handleAction(notif, "accepted")}
                              disabled={!canAct}
                            >
                              <Text style={styles.acceptText}>
                                {notif.type === "SESSION_INVITE" ? "Join" : "Accept"}
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.declineBtn, !canAct && styles.actionDisabled]}
                              onPress={() => canAct && handleAction(notif, "declined")}
                              disabled={!canAct}
                            >
                              <Text style={styles.declineText}>
                                {notif.type === "SESSION_INVITE" ? "Ignore" : "Decline"}
                              </Text>
                            </TouchableOpacity>
                          </>
                        )}
                        {notif.action !== "none" && (
                          <View style={styles.statusPill}>
                            <Text style={styles.statusText}>{notif.action}</Text>
                          </View>
                        )}
                      </View>
                    )}
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
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
  markAllBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: THEME.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  markAllText: {
    color: THEME.accentDark,
    fontWeight: "700",
    fontSize: 12,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  loadingText: {
    color: THEME.sub,
    fontSize: 12,
  },
  card: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 16,
    marginTop: 12,
    shadowColor: '#7F3B00',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardRead: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
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
  },
  sectionLabel: {
    marginTop: 16,
    marginBottom: 6,
    fontSize: 12,
    fontWeight: "700",
    color: THEME.sub,
  },
  newBadge: {
    fontSize: 11,
    color: THEME.accentDark,
    fontWeight: "700",
    backgroundColor: "#F3E7E0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
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
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: THEME.accentDark,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  acceptText: {
    color: "#fff",
    fontWeight: "700",
  },
  declineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  actionDisabled: {
    opacity: 0.5,
  },
  declineText: {
    color: THEME.sub,
    fontWeight: "600",
  },
  statusPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#F3E7E0",
  },
  statusText: {
    fontSize: 11,
    color: THEME.accentDark,
    fontWeight: "700",
    textTransform: "capitalize",
  },
});
