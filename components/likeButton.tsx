import { useLikedPromos } from '@/data/likedPromosContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable } from 'react-native';

type LikeButtonProps = {
    promoId: number;
};

export default function LikeButton({ promoId }: LikeButtonProps) {
    const {isLiked, toggleLiked} = useLikedPromos();
    const liked = isLiked(promoId);

    return (
        <Pressable onPress={ () => toggleLiked(promoId)}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} 
                      size={24}
                      color={liked ? 'red' : 'black'}></Ionicons>
        </Pressable>
    );
};

