import { useColorScheme } from '@/hooks/use-color-scheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { ReviewCard } from './ReviewCard';

interface Review {
  name: string;
  text: string;
  rating: number;
}

interface ReviewsModalProps {
  visible: boolean;
  onClose: () => void;
  reviews: Review[];
}

export function ReviewsModal({ visible, onClose, reviews }: ReviewsModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: isDark ? '#000' : '#fff'
      }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingTop: Platform.OS === 'ios' ? 16 : 30,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? '#333' : '#ddd'
        }}>
          <Text style={{
            color: isDark ? 'white' : 'black',
            fontSize: 24,
            fontWeight: '700'
          }}>
            Tous les avis
          </Text>
          <Pressable
            onPress={onClose}
            style={{
              padding: 8,
              borderRadius: 20,
              backgroundColor: isDark ? '#222' : '#f0f0f0'
            }}
          >
            <Ionicons name="close" size={24} color={isDark ? 'white' : 'black'} />
          </Pressable>
        </View>

        {/* Reviews list */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16 }}
        >
          {reviews.map((review, index) => (
            <ReviewCard
              key={index}
              name={review.name}
              text={review.text}
              rating={review.rating}
              memberSince="2024"
            />
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}
