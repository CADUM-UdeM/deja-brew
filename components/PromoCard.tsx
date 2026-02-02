import { getCafeName } from "@/data/places";
import { formatDateEN } from "@/data/promos";
import { THEME } from "@/data/THEME";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import LikeButton from "./likeButton";
import SaveButton from "./saveButton";

type Promo = {
    id: number;
    title: string;
    description: string;
    cafe_id: string;
    tag: string;
    promoStart: string;
    promoEnd: string;
};

type PromoCardProps = {
    promo : Promo;
    enableCafeRoute: boolean;
}

// Promo card that has the button like and saved (bookmark)
export default function PromoCard({promo, enableCafeRoute} : PromoCardProps) {
  const router = useRouter()
    return (
    <View key={promo.id} style={styles.promoCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTag}>{promo.tag}</Text>
        {enableCafeRoute ? (
        <TouchableOpacity 
          onPress={()=> router.push({pathname: '/place', params: {id: promo.cafe_id, scrollTo: "promos"}})}
          style={{flexDirection: 'row', gap: 4, alignItems: 'center'}}>
          <Text style={styles.name}>by {getCafeName(promo.cafe_id)}</Text>
          <Ionicons 
            name="chevron-forward-outline"
            color={THEME.sub}/>
        </TouchableOpacity> ) : ( null) }
        
      </View>
      <Text style={styles.promoTitle}>{promo.title}</Text>
      <Text style={styles.promoText}>{promo.description}</Text>

      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
        <Text style={styles.promoDate}>{formatDateEN(promo.promoStart)} to {formatDateEN(promo.promoEnd)}</Text>
        <View style={{flexDirection: 'row', gap: 16}}>
          <SaveButton promoId={promo.id}/>
          <LikeButton promoId={promo.id}></LikeButton>
        </View>
      </View>
    </View>
    );
}

const styles = StyleSheet.create({
    name: {
      color: THEME.sub,
      fontSize: 11,
      fontWeight: '600',
    },
   promoCard: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 14,
    marginTop: 6,
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
  },
  cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6
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
      // marginBottom: 6,
    },
});

