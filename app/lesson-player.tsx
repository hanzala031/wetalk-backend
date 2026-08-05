import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import lessonsData from '../data/lessons.json';
import { useLessonManager } from '@/hooks/use-lesson-manager';
import { MotiView } from 'moti';

// Import Step Components
import { WordStep } from '@/components/lesson-steps/WordStep';
import { ListenStep } from '@/components/lesson-steps/ListenStep';
import { SpeakStep } from '@/components/lesson-steps/SpeakStep';
import { PracticeStep } from '@/components/lesson-steps/PracticeStep';
import { QuizStep } from '@/components/lesson-steps/QuizStep';

const NAVY = '#00334E';
const GREEN = '#22C55E';
const RED = '#EF4444';

export default function LessonPlayerScreen() {
  const { lessonId, startStep } = useLocalSearchParams<{ lessonId: string, startStep?: string }>();
  const [currentStepIndex, setCurrentStepIndex] = useState(startStep ? parseInt(startStep) : 0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [lessonContent, setLessonContent] = useState<any>(null);

  useEffect(() => {
    const loadLesson = () => {
      const activeId = lessonId || '1';
      const allLessons = lessonsData.lessons || [];
      const currentLesson = allLessons.find(l => l.id === activeId);
      if (currentLesson) {
        setLessonContent(currentLesson);
      }
      setLoading(false);
    };
    loadLesson();
  }, [lessonId]);

  if (loading || !lessonContent) {
    return (
      <View style={[styles.centered, { backgroundColor: '#FFFFFF' }]}>
        <ActivityIndicator size="large" color={NAVY} />
      </View>
    );
  }

  const progress = ((currentStepIndex + 1) / 5) * 100;
  
  const handleValidation = (valid: boolean) => {
    setIsCorrect(valid);
  };

  const handleNext = async () => {
    if (isCorrect) {
      const newScore = score + 10;
      setScore(newScore);
      if (currentStepIndex < 4) {
        setCurrentStepIndex(i => i + 1);
        setIsCorrect(null);
      } else {
        router.replace({
          pathname: '/lesson-completion',
          params: { lessonId: lessonId || '1', score: newScore, totalSteps: 5 }
        });
      }
    } else {
      setIsCorrect(null);
    }
  };

  const renderStep = () => {
    const steps = lessonContent.steps;
    switch (currentStepIndex) {
      case 0: // Step 1: Word
        const wordData = steps.learn[0] || { word: "Hello", phonetic: "/həˈloʊ/", meaning: "Greeting" };
        return (
          <WordStep 
            key={`word-${currentStepIndex}`}
            content={{
              word: wordData.word,
              phonetic: wordData.phonetic || "/.../",
              meaning: wordData.meaning
            }} 
            onValidate={handleValidation} 
          />
        );

      case 1: // Step 2: Listen
        const listenData = steps.practice.find((p: any) => p.type === 'listen_repeat') || { phrase: "Hello" };
        return (
          <ListenStep 
            key={`listen-${currentStepIndex}`}
            content={{
              instruction: "What did you hear?",
              sentence: listenData.phrase,
              options: [listenData.phrase, "Hi", "Bye", "Good"],
              correctAnswer: listenData.phrase
            }} 
            onValidate={handleValidation} 
          />
        );

      case 2: // Step 3: Speak
        const speakData = steps.practice.find((p: any) => p.type === 'speak_yourself') || { phrase: "Hello" };
        return (
          <SpeakStep 
            key={`speak-${currentStepIndex}`}
            content={{
              instruction: "Say the sentence above clearly.",
              sentence: speakData.phrase || lessonContent.steps.learn[0].word
            }} 
            onValidate={handleValidation} 
          />
        );

      case 3: // Step 4: Practice
        const practiceData = steps.practice.find((p: any) => p.type === 'fill_blanks') || { sentence: "How ___ you?", correctAnswer: "are" };
        return (
          <PracticeStep 
            key={`practice-${currentStepIndex}`}
            content={{
              instruction: "Fill in the blank.",
              sentence: practiceData.sentence,
              options: [practiceData.correctAnswer, "is", "am", "be"],
              correctAnswer: practiceData.correctAnswer
            }} 
            onValidate={handleValidation} 
          />
        );

      case 4: // Step 5: Quiz
        const quizData = steps.quiz[0] || { question: "Greeting?", options: ["Hello", "Bye"], correctOptionIndex: 0 };
        return (
          <QuizStep 
            key={`quiz-${currentStepIndex}`}
            content={{
              instruction: quizData.question,
              options: quizData.options,
              correctAnswer: quizData.options[quizData.correctOptionIndex]
            }} 
            onValidate={handleValidation} 
          />
        );

      default:
        return null;
    }
  };

  const getCorrectAnswerText = () => {
     const steps = lessonContent.steps;
     switch(currentStepIndex) {
       case 1: return steps.practice.find((p: any) => p.type === 'listen_repeat')?.phrase || "Hello";
       case 3: return steps.practice.find((p: any) => p.type === 'fill_blanks')?.correctAnswer || "are";
       case 4: return steps.quiz[0]?.options[steps.quiz[0].correctOptionIndex] || "Hello";
       default: return "";
     }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={32} color={NAVY} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
             <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: NAVY }]} />
          </View>
        </View>
        <View style={styles.heartContainer}>
           <Ionicons name="heart" size={26} color={NAVY} />
           <Text style={[styles.heartText, { color: NAVY }]}>5</Text>
        </View>
      </View>

      <View style={styles.content}>
        {renderStep()}
      </View>

      {isCorrect !== null && (
        <MotiView from={{ translateY: 100 }} animate={{ translateY: 0 }} style={[
          styles.footer, 
          isCorrect ? styles.footerCorrect : styles.footerWrong
        ]}>
          <View style={styles.feedbackPanel}>
             <View style={styles.feedbackHeader}>
                <Ionicons name={isCorrect ? "checkmark-circle" : "close-circle"} size={36} color={isCorrect ? GREEN : RED} />
                <Text style={[styles.feedbackTitle, { color: isCorrect ? GREEN : RED }]}>
                  {isCorrect ? 'Excellent!' : 'Incorrect'}
                </Text>
             </View>
             {!isCorrect && <Text style={styles.correctAnswerText}>Correct: {getCorrectAnswerText()}</Text>}
          </View>

          <TouchableOpacity style={[styles.nextButton, { backgroundColor: isCorrect ? GREEN : RED }]} onPress={handleNext}>
            <Text style={styles.nextButtonText}>{isCorrect ? (currentStepIndex === 4 ? 'FINISH' : 'CONTINUE') : 'TRY AGAIN'}</Text>
          </TouchableOpacity>
        </MotiView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, gap: 15 },
  progressContainer: { flex: 1 },
  progressBarBg: { height: 14, backgroundColor: '#E2E8F0', borderRadius: 10, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 10 },
  heartContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heartText: { fontSize: 20, fontFamily: 'Inter-Bold' },
  content: { flex: 1 },
  footer: { paddingHorizontal: 25, paddingTop: 30, paddingBottom: 40, borderTopWidth: 2, borderTopColor: '#F1F5F9' },
  footerCorrect: { backgroundColor: '#D1FAE5', borderTopColor: '#A7F3D0' },
  footerWrong: { backgroundColor: '#FEE2E2', borderTopColor: '#FECACA' },
  feedbackPanel: { marginBottom: 25 },
  feedbackHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  feedbackTitle: { fontSize: 28, fontFamily: 'Inter-Bold' },
  correctAnswerText: { fontSize: 18, fontFamily: 'Inter-Medium', color: '#991B1B', marginLeft: 48 },
  nextButton: { height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  nextButtonText: { color: '#FFFFFF', fontSize: 20, fontFamily: 'Inter-Bold', letterSpacing: 1 },
});
