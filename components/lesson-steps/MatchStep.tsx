import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { MotiView } from 'moti';

interface MatchStepProps {
  content: {
    word: string;
    imageUrl: string;
    zones: string[];
    correctZone: string;
  };
  onValidate: (isValid: boolean) => void;
}

const NAVY = '#0B2A4A';
const CYAN = '#06B6D4';

export const MatchStep = ({ content, onValidate }: MatchStepProps) => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const handleSelect = (zone: string) => {
    setSelectedZone(zone);
    onValidate(zone === content.correctZone);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Match the category</Text>
      
      <MotiView 
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={styles.imageCard}
      >
        <Image source={{ uri: content.imageUrl }} style={styles.mainImage} />
        <Text style={styles.wordText}>{content.word}</Text>
      </MotiView>

      <View style={styles.zonesContainer}>
        {content.zones.map((zone, index) => {
          const isSelected = selectedZone === zone;
          const isCorrect = zone === content.correctZone;
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.zoneBtn,
                isSelected && (isCorrect ? styles.zoneCorrect : styles.zoneWrong)
              ]}
              onPress={() => handleSelect(zone)}
              disabled={!!selectedZone}
            >
              <Text style={[styles.zoneText, isSelected && styles.zoneTextSelected]}>
                {zone}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20 },
  headerText: { fontSize: 24, fontFamily: 'Nunito-SemiBold', color: NAVY, marginBottom: 30, textAlign: 'center' },
  imageCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 30, 
    padding: 30, 
    alignItems: 'center', 
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  mainImage: { width: 120, height: 120, marginBottom: 15 },
  wordText: { fontSize: 32, fontFamily: 'Inter-Regular', color: NAVY },
  zonesContainer: { gap: 12 },
  zoneBtn: { 
    backgroundColor: '#F8FAFC', 
    padding: 20, 
    borderRadius: 20, 
    borderWidth: 2, 
    borderColor: '#E2E8F0',
    alignItems: 'center'
  },
  zoneCorrect: { backgroundColor: '#D1FAE5', borderColor: '#22C55E' },
  zoneWrong: { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
  zoneText: { fontSize: 18, fontFamily: 'Nunito-SemiBold', color: '#000000' },
  zoneTextSelected: { color: NAVY }
});
