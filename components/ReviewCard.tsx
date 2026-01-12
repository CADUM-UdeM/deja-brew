import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface ReviewCardProps {
  name: string;
  text: string;
  rating: number;
  memberSince?: string;
  showFullHeader?: boolean;
  onViewMore?: () => void;
}

export function ReviewCard({ name, text, rating, memberSince = '20xx', showFullHeader = false, onViewMore }: ReviewCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={{
        backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
      }}
    >
      {/* Header with profile pic and name */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        {/* Profile picture placeholder */}
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: isDark ? '#444' : '#ddd',
            marginRight: 12,
          }}
        />
        
        <View style={{ flex: 1 }}>
          <Text style={{ 
            color: isDark ? 'white' : 'black', 
            fontSize: 18, 
            fontWeight: '700' 
          }}>
            {name}
          </Text>
          <Text style={{ 
            color: isDark ? '#999' : '#666', 
            fontSize: 14,
            marginTop: 2
          }}>
            member since {memberSince}
          </Text>
        </View>

        {showFullHeader && onViewMore && (
          <Pressable 
            onPress={onViewMore}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 16,
              backgroundColor: isDark ? '#222' : '#e8e8e8',
            }}
          >
            <Text style={{ 
              color: isDark ? '#4a9eff' : '#007AFF', 
              fontSize: 14,
              fontWeight: '600'
            }}>
              Voir plus
            </Text>
          </Pressable>
        )}
      </View>

      {/* Review text */}
      <Text style={{ 
        color: isDark ? 'white' : 'black', 
        fontSize: 16,
        lineHeight: 24
      }}>
        {text}
      </Text>

      {/* Rating */}
      <Text style={{ 
        color: isDark ? '#999' : '#666', 
        fontSize: 14,
        marginTop: 8
      }}>
        Note: {rating}/5
      </Text>
    </View>
  );
}
