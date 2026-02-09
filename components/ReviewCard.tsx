import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { THEME } from '@/data/THEME';
import Ionicons from '@expo/vector-icons/Ionicons';

interface ReviewCardProps {
  name: string;
  text: string;
  rating: number;
  memberSince?: string;
  showFullHeader?: boolean;
  onViewMore?: () => void;
}

export function ReviewCard({ name, text, rating, memberSince = '20xx', showFullHeader = false, onViewMore }: ReviewCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.accentBar} />
      {/* Header with profile pic and name */}
      <View style={styles.headerRow}>
        {/* Profile picture placeholder */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name?.slice(0, 1)?.toUpperCase()}</Text>
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.meta}>member since {memberSince}</Text>
        </View>

        {showFullHeader && onViewMore && (
          <Pressable 
            onPress={onViewMore}
            style={styles.viewMore}
          >
            <Text style={styles.viewMoreText}>Voir plus</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.ratingRow}>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={14} color="#F6B100" />
          <Text style={styles.ratingBadgeText}>{rating}.0</Text>
        </View>
        <View style={styles.ratingStars}>
          {Array.from({ length: 5 }).map((_, idx) => (
            <Ionicons
              key={idx}
              name={idx < rating ? 'star' : 'star-outline'}
              size={14}
              color={idx < rating ? '#F6B100' : THEME.border}
            />
          ))}
        </View>
      </View>

      {/* Review text */}
      <View style={styles.bodyRow}>
        <Ionicons name="chatbubble-ellipses-outline" size={16} color={THEME.accentDark} />
        <Text style={styles.body}>{text}</Text>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.recommendChip}>
          <Ionicons name="checkmark-circle" size={14} color={THEME.accentDark} />
          <Text style={styles.recommendText}>Study‑friendly</Text>
        </View>
        <Text style={styles.timestamp}>2 days ago</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#7F3B00',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#E9C6AA',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2D6C2',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: THEME.accentDark,
    fontWeight: '800',
  },
  name: {
    color: THEME.text,
    fontSize: 15,
    fontWeight: '700',
  },
  meta: {
    color: THEME.sub,
    fontSize: 12,
    marginTop: 2,
  },
  viewMore: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F3E7E0',
  },
  viewMoreText: {
    color: THEME.accentDark,
    fontSize: 12,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FFF3E6',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  ratingBadgeText: {
    fontSize: 12,
    color: THEME.accentDark,
    fontWeight: '700',
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 3,
  },
  bodyRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  body: {
    color: THEME.text,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  footerRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recommendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F3E7E0',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  recommendText: {
    fontSize: 11,
    color: THEME.accentDark,
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 11,
    color: THEME.sub,
  },
});
