import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import lessonsData from '@/data/lessons.json';

const { width } = Dimensions.get('window');

const PRIMARY_BLUE = '#004D73';
const TEXT_DARK = '#111827';
const TEXT_GRAY = '#6B7280';
const BG_COLOR = '#F8FAFC';
const LIGHT_BLUE = '#EEF2FF';

const LESSON_IMAGES: Record<number, any> = {
  1: require('../assets/images/lesson_1.png'),
  2: require('../assets/images/lesson_2.png'),
  3: require('../assets/images/lesson_3.png'),
  4: require('../assets/images/lesson_4.png'),
  5: require('../assets/images/lesson_5.png'),
  6: require('../assets/images/lesson_6.png'),
  7: require('../assets/images/lesson_7.png'),
  8: require('../assets/images/lesson_8.png'),
  9: require('../assets/images/lesson_9.png'),
  10: require('../assets/images/lesson_10.png'),
  11: require('../assets/images/lesson_11.png'),
  12: require('../assets/images/lesson_12.png'),
  13: require('../assets/images/lesson_13.png'),
  14: require('../assets/images/lesson_14.png'),
  15: require('../assets/images/lesson_15.png')
};

const getLessonImage = (id: string | undefined) => {
  const numId = parseInt(id || '1', 10);
  return LESSON_IMAGES[numId] || { uri: 'https://img.freepik.com/free-vector/teaching-concept-illustration_114360-1708.jpg' };
};

export default function LearnNewWordsScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { userAvatar } = useAuth();
  const [highestUnlockedIndex, setHighestUnlockedIndex] = useState(0);
  const [words, setWords] = useState<any[]>([]);
  const [lessonTitle, setLessonTitle] = useState('New Words');

  const loadProgress = async () => {
    try {
      const activeId = lessonId || '1';
      const savedIndexStr = await AsyncStorage.getItem(`learned_word_index_${activeId}`);
      const savedIndex = savedIndexStr ? parseInt(savedIndexStr, 10) : 0;
      setHighestUnlockedIndex(savedIndex);

      const completed = await AsyncStorage.getItem(`completed_words_${activeId}`);
      if (completed === 'true' && false) { // Removed auto-redirect to allow review
        // router.replace({ pathname: '/lesson-details', params: { id: activeId } });
      }

      // Load dynamic data
      const allLessons = lessonsData.lessons || [];
      const currentLesson = allLessons.find(l => l.id === activeId);
      if (currentLesson && currentLesson.steps.learn) {
        const formattedWords = currentLesson.steps.learn.map((w: any) => ({
          word: w.word,
          phonetic: w.phonetic || w.meaning.substring(0, 20) + '...',
          example: w.example,
          icon: 'book-outline'
        }));
        setWords(formattedWords);
        setLessonTitle(currentLesson.title);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadProgress();
    }, [lessonId])
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color={PRIMARY_BLUE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Learn</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/notifications')}>
              <Ionicons name="notifications-outline" size={24} color={PRIMARY_BLUE} />
            </TouchableOpacity>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: userAvatar || 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png' }} 
                style={styles.avatar}
              />
            </View>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Top Hero Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroIconWrapper}>
              <Ionicons name="book-outline" size={32} color="#FFFFFF" />
              <View style={styles.heroIconBadge}>
                 <Ionicons name="school" size={12} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>{"Let's Learn"}</Text>
              <Text style={styles.heroSubtitle}>{"Let's learn some common words and phrases."}</Text>
            </View>
            <Image 
              source={getLessonImage(lessonId)} 
              style={styles.heroIllustration}
              contentFit="contain"
            />
          </View>

          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vocabulary List</Text>
            <Text style={styles.sectionSubtitle}>Tap to each word to hear pronunciations and see examples.</Text>
          </View>

          {/* Word List */}
          <View style={styles.wordList}>
            {(words.length > 0 ? words : []).map((item, index) => {
              const isLocked = index > highestUnlockedIndex;
              const activeId = lessonId || '1';
              
              return (
                <View 
                  key={index} 
                  style={[
                    styles.wordCard,
                    isLocked && { opacity: 0.6 }
                  ]}
                >
                  <View style={[styles.wordIconContainer, isLocked && { backgroundColor: '#F1F5F9' }]}>
                    <Ionicons 
                      name={item.icon as any} 
                      size={24} 
                      color={isLocked ? '#94A3B8' : PRIMARY_BLUE} 
                    />
                  </View>
                  
                  <View style={styles.wordInfo}>
                    <Text style={[styles.wordText, isLocked && { color: '#94A3B8' }]}>{item.word}</Text>
                    <Text style={styles.phoneticText}>{item.phonetic}</Text>
                  </View>

                  {isLocked ? (
                    <View style={styles.lockedPlayButton}>
                      <Ionicons name="lock-closed" size={16} color="#94A3B8" />
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.playButton}
                      onPress={() => router.push({ pathname: '/word-details', params: { word: item.word, phonetic: item.phonetic, example: item.example, lessonId: activeId } })}
                    >
                      <Ionicons name="play" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity 
                    style={styles.exampleContainer}
                    disabled={isLocked}
                    onPress={() => router.push({ pathname: '/word-details', params: { word: item.word, phonetic: item.phonetic, example: item.example, lessonId: activeId } })}
                  >
                    <Text style={[styles.exampleLabel, isLocked && { color: '#94A3B8' }]}>Example:</Text>
                    <Text style={styles.exampleText}>{item.example}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          {/* Practice Tip Card */}
          <View style={styles.tipCard}>
             <View style={styles.tipIconWrapper}>
                <Ionicons name="bulb-outline" size={30} color="#4CAF50" />
             </View>
             <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Practice tip</Text>
                <Text style={styles.tipText}>Trying using this words in daily conversations to remember them better</Text>
             </View>
             <Image 
               source={{ uri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1779345793/47306607-a224-47cb-94eb-6538c4e375fd_removalai_preview_gtszq4.png' }} 
               style={styles.tipRobot}
               contentFit="contain"
             />
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBtn: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: PRIMARY_BLUE,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    marginRight: 10,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  heroIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: PRIMARY_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  heroIconBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: PRIMARY_BLUE,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#000000',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: TEXT_GRAY,
    lineHeight: 15,
  },
  heroIllustration: {
    width: 90,
    height: 90,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#000000',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: TEXT_GRAY,
  },
  wordList: {
    gap: 12,
  },
  wordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  wordIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  wordInfo: {
    width: 100,
  },
  wordText: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#000000',
  },
  phoneticText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: TEXT_GRAY,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PRIMARY_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lockedPlayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  exampleContainer: {
    flex: 1,
  },
  exampleLabel: {
    fontSize: 11,
    fontFamily: 'Nunito-Bold',
    color: '#000000',
  },
  exampleText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: TEXT_GRAY,
  },
  tipCard: {
    marginTop: 24,
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  tipIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#22C55E',
    marginBottom: 2,
  },
  tipText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    lineHeight: 14,
  },
  tipRobot: {
    width: 85,
    height: 85,
  },
  bottomSpacer: {
    height: 20,
  },
});
