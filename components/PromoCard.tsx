import { formatDateEN } from "@/data/promos";
import { StyleSheet, Text, View } from "react-native";
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
    promo : Promo
};

const THEME = {
  bg: '#FFF6EF',
  text: '#2A1C17',
  sub: '#7A6B62',
  card: '#FFFFFF',
  border: '#E8D9D1',
  accentDark: '#7F3B00',
};

export default function PromoCard({promo} : PromoCardProps) {
    return (
        <View key={promo.id} style={styles.promoCard}>
              <Text style={styles.promoTitle}>{promo.title}</Text>
              <Text style={styles.promoText}>{promo.description}</Text>

              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                <Text style={styles.promoDate}>{formatDateEN(promo.promoStart)} to {formatDateEN(promo.promoEnd)}</Text>
                <View style={{flexDirection: 'row', gap: 16}}>
                  <SaveButton></SaveButton>
                  <LikeButton></LikeButton>
                </View>
              </View>
            </View>
    );
}

const styles = StyleSheet.create({
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
});

