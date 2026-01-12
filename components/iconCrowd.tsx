import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { View } from "react-native";

// Component qui affiche l'icon pour le crowd level/meter
interface IconCrowdProps {
    crowdLVL : string;
}

export function IconCrowd ({crowdLVL} : IconCrowdProps){
    const iconSize = 14; 
    const THEME = {
        // bg: '#FFF6EF',
        // text: '#2A1C17',
        // sub: '#7A6B62',
        // card: '#FFFFFF',
        // border: '#E8D9D1',
        accentDark: '#7F3B00',
    };

    // Fonction qui affiche un icon selon le crowd level : low, moderate et high
    const renderIcons = ()=> {
        switch (crowdLVL){
            case 'low':
                return(
                    // <> </> Parce qu'il faut un élément parent pour ne peut créer une erreur 
                    <>
                    <Ionicons name='person' size={iconSize} color={THEME.accentDark}></Ionicons>
                    <Ionicons name='person-outline' size={iconSize} color={THEME.accentDark}></Ionicons>
                    <Ionicons name='person-outline'size={iconSize} color={THEME.accentDark}></Ionicons>
                    </>
                )
            case 'moderate':
                return(
                    <>
                    <Ionicons name='person' size={iconSize} color={THEME.accentDark}></Ionicons>
                    <Ionicons name='person' size={iconSize} color={THEME.accentDark}></Ionicons>
                    <Ionicons name='person-outline'size={iconSize} color={THEME.accentDark}></Ionicons>
                    </>
                )
            case 'high':
                return(
                    <>
                    <Ionicons name='person' size={iconSize} color={THEME.accentDark}></Ionicons>
                    <Ionicons name='person' size={iconSize} color={THEME.accentDark}></Ionicons>
                    <Ionicons name='person'size={iconSize} color={THEME.accentDark}></Ionicons>
                    </>
                )
            default: 
                return null;
        }
    }

    return(
        <View style={{flexDirection: 'row', paddingTop: 4}}> 
            {renderIcons()}
        </View>

    );

}