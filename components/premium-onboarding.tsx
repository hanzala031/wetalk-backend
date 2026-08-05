import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { cssInterop } from 'nativewind';

const { width } = Dimensions.get('window');

const PaginationDots = () => (
  <View style={styles.dotsContainer}>
    <View style={[styles.dot, styles.activeDot]} />
    <View style={styles.dot} />
    <View style={styles.dot} />
    <View style={styles.dot} />
  </View>
);

export const PremiumOnboarding = () => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop',
        }}
        style={StyleSheet.absoluteFill}
        blurRadius={5}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.contentContainer}>
            <View style={styles.spacer} />

            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 1000 }}
              style={styles.textBlock}
            >
              <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>Welcome to WeVersity!</Text>
              <Text style={styles.subtitle}>
                Build confidence and fluency with the leading AI English tutor.
              </Text>
            </MotiView>

            <View style={styles.footer}>
              <PaginationDots />

              <TouchableOpacity activeOpacity={0.8} style={styles.buttonContainer}>
                <MotiView
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Get Started</Text>
                </MotiView>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryLink}>
                <Text style={styles.secondaryText}>I already have an account</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  spacer: {
    flex: 1.5,
  },
  textBlock: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E1E1E',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D3D3D3',
    marginHorizontal: 5,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#000',
  },
  buttonContainer: {
    width: '100%',
    shadowColor: '#2F6BFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    backgroundColor: '#2F6BFF',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default PremiumOnboarding;
