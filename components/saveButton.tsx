import { useSavedPromos } from "@/data/savedPromosContext";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

const filledColor = "#7F3B00";

type SaveButtonProps = {
    promoId: number;
};

export default function SaveButton({ promoId }: SaveButtonProps) {
    const {savedPromoIds, toggleSavePromo} = useSavedPromos();
    const isSaved = savedPromoIds.includes(promoId);
  return (
    <Pressable onPress={() => toggleSavePromo(promoId)}>
      <Ionicons
        name={isSaved ? "bookmark" : "bookmark-outline"}
        size={24}
        color={isSaved ? filledColor : "black"}
      />
    </Pressable>
  );
}
