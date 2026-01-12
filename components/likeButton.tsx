import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable } from 'react-native';

const LikeButton = () => {
    const [isLike, setIsLiked] = useState(false);

    const handlePress = () => {
        setIsLiked((prevIsLiked) => (!prevIsLiked))
    };

    return (
        <Pressable onPress={handlePress}>
            <Ionicons name={isLike ? 'heart' : 'heart-outline'} 
                      size={24}
                      color={isLike ? 'red' : 'black'}></Ionicons>
        </Pressable>
    );
};

export default LikeButton;
