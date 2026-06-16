import React, { useEffect } from 'react';
import { getCafeName } from "@/data/places";
import { formatDateEN } from "@/data/promos";
import type { Promo } from "@/data/promos";
import { THEME } from "@/data/THEME";
import { getPromoStateMeta } from "@/data/promoStatus";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Reanimated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import LikeButton from "./likeButton";
import SaveButton from "./saveButton";

const SPRING = { damping: 18, stiffness: 180, mass: 0.8 };

type PromoCardProps = {
  promo: Promo;
  enableCafeRoute: boolean;
  index?: number;
};

export default function PromoCard({ promo, enableCafeRoute, index = 0 }: PromoCardProps) {
  const router = useRouter();
  const status = getPromoStateMeta(promo);

  const progress = useSharedValue(0);
  const pressed = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(Math.min(index * 70, 560), withSpring(1, SPRING));
  }, [index, progress]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [20, 0]) },
      { scale: interpolate(pressed.value, [0, 1], [1, 0.972]) },
    ],
  }));

  return (
    <Reanimated.View
      style={cardStyle}
      onTouchStart={() => { pressed.value = withTiming(1, { duration: 80 }); }}
      onTouchEnd={() => { pressed.value = withSpring(0, { damping: 14, stiffness: 200 }); }}
      onTouchCancel={() => { pressed.value = withSpring(0, { damping: 14, stiffness: 200 }); }}
    >
      <View style={styles.promoCard}>
        <View style={styles.cardHeader}>
          <View style={styles.tagRow}>
            <Text style={styles.cardTag}>{promo.tag}</Text>
            <Text style={[styles.statusTag, styles[`status_${status.tone}`]]}>
              {status.label}
            </Text>
          </View>
          {enableCafeRoute ? (
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/place', params: { id: promo.cafe_id } })}
              style={styles.cafeLink}
            >
              <Text style={styles.name} numberOfLines={1}>by {getCafeName(promo.cafe_id)}</Text>
              <Ionicons name="chevron-forward-outline" color={THEME.sub} />
            </TouchableOpacity>
          ) : null}
        </View>
        <Text style={styles.promoTitle}>{promo.title}</Text>
        <Text style={styles.promoText}>{promo.description}</Text>

        <View style={styles.footerRow}>
          <Text style={styles.promoDate}>
            {formatDateEN(promo.promoStart)} to {formatDateEN(promo.promoEnd)} · {status.reminder}
          </Text>
          <View style={styles.actionRow}>
            <SaveButton promoId={promo.id} />
            <LikeButton promoId={promo.id} />
          </View>
        </View>
      </View>
    </Reanimated.View>
  );
}

const styles = StyleSheet.create({
  name: {
    color: THEME.sub,
    fontSize: 11,
    fontWeight: '600',
    flexShrink: 1,
  },
  cafeLink: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  promoCard: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 14,
    marginTop: 6,
    shadowColor: '#7F3B00',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.accentDark,
    marginBottom: 4,
  },
  promoText: {
    fontSize: 13,
    color: THEME.text,
    padding: 4,
  },
  promoDate: {
    color: THEME.sub,
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    minWidth: 120,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    flex: 1,
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
  },
  statusTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 10,
    fontWeight: '800',
    overflow: 'hidden',
  },
  status_good: { backgroundColor: '#E7F5EA', color: '#2F6B3F' },
  status_warm: { backgroundColor: '#FFF3E6', color: THEME.accentDark },
  status_urgent: { backgroundColor: '#FFE0C4', color: '#9A3A12' },
  status_muted: { backgroundColor: '#E7DFDA', color: THEME.sub },
});
