import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { useUserSettings } from '@/hooks/use-user-progress';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '@/constants/api';
import { apiClient, authConfig } from '@/lib/api-client';

const { width } = Dimensions.get('window');

// Colors from the image
const BACKGROUND_COLOR = '#FFFFFF';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6B7280';
const ACCENT_BLUE = '#004D73'; // Dark navy for goal selection and buttons
const BORDER_COLOR = '#E5E7EB';
const ERROR_RED = '#991B1B';

export default function EditProfileScreen() {
  const { userName, userAvatar, userEmail, setUserData, userToken } = useAuth();
  const { settings, saveSettings } = useUserSettings();
  const [fullName, setFullName] = useState(userName || '');
  const [email, setEmail] = useState(userEmail || '');
  const [selectedGoal, setSelectedGoal] = useState(settings?.learningGoal || 'Casual');
  const [avatarUri, setAvatarUri] = useState<string | null>(userAvatar);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (settings?.learningGoal) {
      setSelectedGoal(settings.learningGoal);
    }
  }, [settings]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUri(result.assets[0].uri);
        if (result.assets[0].base64) {
          setAvatarBase64(result.assets[0].base64);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Failed to pick an image');
    }
  };

  const handleSave = async () => {
    if (!userToken) return;
    setIsSaving(true);
    try {
      let finalAvatarUrl = avatarUri || '';

      // Check if it's a local uri/base64 that needs to be uploaded
      if (avatarUri && (avatarUri.startsWith('file://') || avatarUri.startsWith('content://') || !avatarUri.startsWith('http'))) {
        if (avatarBase64) {
          const base64Data = `data:image/jpeg;base64,${avatarBase64}`;
          
          const uploadResponse = await apiClient.post('/user/upload-image', {
            base64Data: base64Data,
          });

          if (uploadResponse.data?.success && uploadResponse.data?.secure_url) {
            finalAvatarUrl = uploadResponse.data.secure_url;
          }
        }
      }

      // Update backend database profile and settings in parallel
      const [profileRes, settingsRes] = await Promise.all([
        apiClient.put('/user/profile', {
          name: fullName,
          email: email,
          profileImage: finalAvatarUrl,
        }, authConfig(userToken)),
        saveSettings({ learningGoal: selectedGoal })
      ]);

      if (profileRes.data?.success) {
        // Update local AuthContext state
        await setUserData(fullName, finalAvatarUrl, email);
        router.back();
      } else {
        alert(profileRes.data?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save changes. Please check your connection.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('edit_profile')}</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerButton} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color={TEXT_PRIMARY} />
          ) : (
            <Text style={styles.saveText}>{t('save')}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.imageSection}>
          <TouchableOpacity activeOpacity={0.8} onPress={pickImage} style={styles.avatarPlaceholder}>
            <Image 
              source={{ uri: (avatarUri && avatarUri !== 'default-avatar.png') ? avatarUri : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'User')}&background=004D73&color=fff` }} 
              style={styles.avatarImage} 
            />
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} onPress={pickImage}>
            <Text style={styles.changePhotoText}>{t('change_photo')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.inputLabel}>{t('full_name')}</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder={t('full_name')}
          />

          <Text style={styles.inputLabel}>{t('email_address')}</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder={t('email_address')}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.goalSection}>
          <Text style={styles.sectionTitle}>{t('learning_goal')}</Text>
          
          <GoalOption 
            icon="coffee" 
            title={t('casual')} 
            subtitle={t('casual_desc')} 
            isSelected={selectedGoal === 'Casual'}
            onPress={() => setSelectedGoal('Casual')}
          />
          <GoalOption 
            icon="book" 
            title={t('regular')} 
            subtitle={t('regular_desc')} 
            isSelected={selectedGoal === 'Regular'}
            onPress={() => setSelectedGoal('Regular')}
          />
          <GoalOption 
            icon="bolt" 
            title={t('intensive')} 
            subtitle={t('intensive_desc')} 
            isSelected={selectedGoal === 'Intensive'}
            onPress={() => setSelectedGoal('Intensive')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const GoalOption = ({ icon, title, subtitle, isSelected, onPress }: any) => (
  <TouchableOpacity 
    style={[styles.goalOption, isSelected && styles.goalOptionSelected]} 
    onPress={onPress}
  >
    <View style={styles.goalIconContainer}>
        {icon === 'bolt' ? (
             <FontAwesome5 name={icon} size={20} color={isSelected ? '#FFFFFF' : TEXT_PRIMARY} />
        ) : (
            <MaterialCommunityIcons name={icon} size={24} color={isSelected ? '#FFFFFF' : TEXT_PRIMARY} />
        )}
    </View>
    <View style={styles.goalTextContainer}>
      <Text style={[styles.goalOptionTitle, isSelected && styles.goalOptionTextSelected]}>{title}</Text>
      <Text style={[styles.goalOptionSubtitle, isSelected && styles.goalOptionTextSelected]}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 15,
    backgroundColor: BACKGROUND_COLOR,
  },
  headerButton: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    justifyContent: 'center',
    minWidth: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
  },
  saveText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
    textAlign: 'right',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  imageSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
    marginBottom: 10,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: ACCENT_BLUE,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  changePhotoText: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
  },
  formSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: TEXT_PRIMARY,
    marginBottom: 20,
  },
  goalSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
    marginBottom: 15,
  },
  goalOption: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalOptionSelected: {
    backgroundColor: ACCENT_BLUE,
    borderColor: ACCENT_BLUE,
  },
  goalIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  goalTextContainer: {
    flex: 1,
  },
  goalOptionTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
  },
  goalOptionSubtitle: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  goalOptionTextSelected: {
    color: '#FFFFFF',
  },
});

