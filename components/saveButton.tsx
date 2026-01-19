import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable } from "react-native";

const filledColor = '#7F3B00'
const SaveButton = () => {
    const [isSaved, setIsSaved] = useState(false);
    
    const handlePress = () => {
        setIsSaved((prevIsSaved) => (!prevIsSaved))
    };

    return (
        <Pressable onPress={handlePress}>
            <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'}
                      size={24}
                      color={isSaved ? filledColor: 'black'}></Ionicons>
        </Pressable>
    );
}

export default SaveButton;