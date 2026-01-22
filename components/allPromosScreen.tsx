import { getCafeName } from '@/data/places';
import { formatDateEN, PROMOS } from '@/data/promos';
import { THEME } from '@/data/THEME';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


export default function AllPromosScreen() {
    const router = useRouter();
  return(
    <ScrollView>
      {PROMOS.map((promo) => (
          <TouchableOpacity onPress={()=> router.push({pathname: '/place', params: {id: promo.cafe_id}})} key={promo.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTag}>{promo.tag}</Text>
              <Text style={styles.name}>by {getCafeName(promo.cafe_id)}</Text>
            </View>
            <Text style={styles.cardTitle}>{promo.title}</Text>
            <Text style={styles.cardText}>{promo.description}</Text>
            {/* Time limit date */}
            <View style={styles.cardBottom}>
              <Text style={styles.name}>from {formatDateEN(promo.promoStart)} to {formatDateEN(promo.promoEnd)}</Text>
              {/* liked by many users */}
              <View style={{flexDirection: 'row', gap: 4}}>
                <Ionicons name='heart'
                          color={THEME.sub}></Ionicons>
                <Text style={styles.name}>number</Text>
              </View>
            </View> 
          </TouchableOpacity>
        ))}
    </ScrollView>
      
  )
}


const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: THEME.sub,
    marginBottom: 16,
  },
  name: {
    color: THEME.sub,
    fontSize: 11,
    fontWeight: '600',
  },
  card: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 16,
    marginTop: 12,
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.accentDark,
    marginBottom: 4,
  },
  cardText: {
    fontSize: 13,
    color: THEME.text,
    padding: 4,
  },
  cardBottom: {
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'space-between', 
    paddingTop: 4,
  }
});