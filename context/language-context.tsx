import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Translation Dictionary ---
export const translations: Record<string, any> = {
  English: {
    welcome: "Hi there! I'm WeBot!",
    what_learn: "What would you like to learn?",
    how_much: "How much {lang} do you know?",
    why_learning: "Why are you learning {lang}?",
    continue: "CONTINUE",
    native_lang: "What is your native language?",
    get_started: "Get Started",
    new_to: "I'm new to {lang}",
    common_words: "I know some common words",
    basic_conv: "I can have basic conversations",
    talk_topics: "I can talk about various topics",
    discuss_detail: "I can discuss most topics in detail",
    daily_goal: "What's your daily learning goal?",
    committed: "I'M COMMITTED",
    
    // Onboarding Reasons
    boost_career: "Boost my career",
    just_fun: "Just for fun",
    spend_time: "Spend time productively",
    connect_people: "Connect with people",
    support_education: "Support my education",
    prepare_travel: "Prepare for travel",
    other: "Other",

    // Profile Setup
    personalize_profile: "Personalize your profile",
    choose_avatar: "Choose an avatar that represents you best, {name}!",
    select_avatar: "Select your avatar",
    skip_profile: "SKIP THE PROFILE",

    // Achieve
    achieve_title: "Here's what you can achieve in 3 months!",
    achieve_1_title: "Converse with confidence",
    achieve_1_desc: "Stress-free speaking and listening exercises",
    achieve_2_title: "Build up your vocabulary",
    achieve_2_desc: "Common words and practical phrases",
    achieve_3_title: "Develop a learning habit",
    achieve_3_desc: "Smart reminders, fun challenges, and more",

    // Source
    source_title: "One more thing! How did you hear about us?",
    source_news: "News/article/blog",
    source_app_store: "App store",
    source_google_search: "Google Search",

    // Placement
    placement_title: "Now let's find the best place to start!",
    placement_1_title: "Learning {lang} for the first time?",
    placement_1_desc: "Start from scratch!",
    placement_2_title: "Already know some {lang}?",
    placement_2_desc: "Let's find your starting point!",
    recommended: "RECOMMENDED",
    
    streak: "{count} Daily Streak",
    welcome_title: "Welcome to WeTalk!",
    welcome_subtitle: "Let's learn something new today.",
    ai_tutor: "AI Tutor",
    ai_tutor_desc: "Your personal learning assistant",
    chat_now: "Chat Now",
    your_lessons: "Your Lessons",
    view_all: "View All",
    lesson: "Lesson",
    completed: "Completed",
    // Tabs
    home: "Home",
    practice: "Practice",
    achievements: "Achievements",
    profile: "Profile",
    // Lessons 1 & 2
    lesson_1_title: "Basic Greetings",
    lesson_1_desc: "Learn how to greet people.",
    lesson_2_title: "Common Phrases",
    lesson_2_desc: "Learn simple and useful phrases for daily life.",
    
    // Practice Screen
    unlimited_ai_talk: "Unlimited AI Talk",
    unlimited_ai_talk_desc: "Master natural conversation with real-time feedback from our advanced AI tutor.",
    start_session: "Start Session",
    logs: "Logs",
    learning_tools: "Learning Tools",
    pronunciation: "Pronunciation",
    pronunciation_desc: "Perfect your accent with AI phonetic analysis.",
    practice_now: "Practice Now",
    vocabulary: "Vocabulary",
    vocabulary_desc: "Contextual learning for 10k+ curated academic terms.",
    explore_sets: "Explore Sets",
    grammar_takeaways: "Grammar Takeaways",
    grammar_takeaways_desc: "Instant corrections and structural insights from chats.",
    review_insights: "Review Insights",
    custom_tool: "Custom Tool",
    custom_tool_desc: "Add your favorite practice mode",
    recent_progress: "Recent Progress",
    view_detailed_analytics: "View Detailed Analytics",
    practice_streak: "Practice Streak",
    streak_sub: "Days burning bright!",
    
    // Achievements Screen
    achievement_progress: "Achievement Progress",
    total_badges: "Total Badges",
    achievement_progress_desc: "Keep going! 13 more badges to become a Grand Master.",
    earned_badges: "Earned Badges",
    earned_count: "{count} Earned",
    mastery_certificates: "Mastery Certificates",
    beginner_mastery: "Beginner Mastery",
    earned_date: "Earned June 12, 2023",
    view_pdf: "View PDF",
    locked_achievements: "Locked Achievements",
    fast_learner: "Fast Learner",
    vocab_master: "Vocab Master",
    grammar_guru: "Grammar Guru",
    seven_day_streak: "7-Day Streak",
    chatty_box: "Chatty Box",
    top_scorer: "Top Scorer",
    night_owl: "Night Owl",
    early_bird: "Early Bird",
    public_speaker: "Public Speaker",
    polyglot_path: "Polyglot Path",
    essayist: "Essayist",
    champion: "Champion",
    
    // Profile Screen
    intermediate_level: "Intermediate Level",
    day_streak: "Day Streak",
    words: "Words",
    lessons: "Lessons",
    weekly_goal: "Weekly Goal",
    goal_completed_desc: "4 of 5 lessons completed",
    edit_profile: "Edit Profile",
    learning_statistics: "Learning Statistics",
    my_certificates: "My Certificates",
    subscription_plan: "Subscription Plan",
    
    // Additional Screens (Settings, Welcome, Edit Profile, Subscription Plan)
    profile_setup_success: "Profile Set Up Successful!",
    avatar_confirmed_desc: "Your avatar has been confirmed! Press continue to begin your learning journey, {name}!",
    go_to_dashboard: "GO TO DASHBOARD",
    settings: "Settings",
    save: "Save",
    account_settings: "Account Settings",
    privacy_security: "Privacy & Security",
    notification_preferences: "Notification Preferences",
    language_settings: "Language Settings",
    help_support: "Help & Support",
    faq_contact: "FAQ, Contact Us",
    logout: "Logout",
    delete_account: "Delete Account",
    change_photo: "Change Photo",
    full_name: "Full Name",
    email_address: "Email Address",
    phone_number: "Phone Number",
    learning_goal: "Learning Goal",
    casual: "Casual",
    regular: "Regular",
    serious: "Serious",
    intense: "Intense",
    intensive: "Intensive",
    casual_desc: "10 mins/day",
    regular_desc: "30 mins/day",
    intensive_desc: "60 mins/day",
    save_changes: "Save Changes",
    choose_your_plan: "Choose your plan",
    plan_subtitle: "Unlock your full potential and achieve fluency with structured learning paths and professional tools designed for serious learners.",
    entry_level: "ENTRY LEVEL",
    professional: "PROFESSIONAL",
    enterprise: "ENTERPRISE",
    basic_plan: "Basic",
    pro_scholar_plan: "Pro Scholar",
    academic_master_plan: "Academic Master",
    forever: "forever",
    month: "month",
    subscribe_now: "Subscribe Now",
    upgrade_to_master: "Upgrade to Master",
    best_value: "BEST VALUE",
    
    // Notifications
    lesson_reminders: "Lesson reminders",
    lesson_reminders_desc: "Get reminded to continue your daily lessons.",
    streak_alerts: "Streak alerts",
    streak_alerts_desc: "Notify when your streak is at risk of breaking.",
    achievement_alerts: "Achievement alerts",
    achievement_alerts_desc: "Celebrate badges, certificates, and milestones.",
    weekly_report: "Weekly progress report",
    weekly_report_desc: "Summary of lessons, words, and streak each week.",
    
    // Sign In & Sign Up
    sign_in: "Sign In",
    welcome_back: "Welcome Back to WeTalk!",
    welcome_subtext: "Sign in to continue your personalized learning journey with your AI English tutor.",
    password: "Password",
    forgot_password: "Forgot Password?",
    continue_with: "CONTINUE WITH:",
    continue_google: "Continue with Google",
    continue_facebook: "Continue with Facebook",
    continue_apple: "Continue with Apple",
    new_to_wetalk: "New to WeTalk? ",
    sign_up: "Sign Up",
    create_account: "Create your account",
    join_now_desc: "Join now and start your {lang} journey!",
    full_name_placeholder: "Full name",
    confirm_password_placeholder: "Confirm password",
    let_create_account: "Let's create your account to start learning! 👋",
    already_have_account: "Already have an account? ",
    login: "Log in"
  },
  Urdu: {
    welcome: "ہیلو! میں وی بوٹ ہوں!",
    what_learn: "آپ کیا سیکھنا چاہیں گے؟",
    how_much: "آپ {lang} کتنی جانتے ہیں؟",
    why_learning: "آپ {lang} کیوں سیکھ رہے ہیں؟",
    continue: "جاری رکھیں",
    native_lang: "آپ کی مادری زبان کیا ہے؟",
    get_started: "شروع کریں",
    new_to: "میں {lang} کے لیے بالکل نیا ہوں",
    common_words: "میں کچھ عام الفاظ جانتا ہوں",
    basic_conv: "میں بنیادی گفتگو کر سکتا ہوں",
    talk_topics: "میں مختلف موضوعات پر بات کر سکتا ہوں",
    discuss_detail: "میں زیادہ تر موضوعات پر تفصیل سے بحث کر سکتا ہوں",
    daily_goal: "آپ کا روزانہ سیکھنے کا ہدف کیا ہے؟",
    committed: "میں تیار ہوں",

    // Onboarding Reasons
    boost_career: "اپنے کیریئر کو فروغ دیں",
    just_fun: "صرف تفریح کے لیے",
    spend_time: "وقت کو تعمیری انداز میں گزاریں",
    connect_people: "لوگوں سے جڑیں",
    support_education: "اپنی تعلیم کی حمایت کریں",
    prepare_travel: "سفر کی تیاری کریں",
    other: "دیگر",

    // Profile Setup
    personalize_profile: "اپنی پروفائل کو ذاتی بنائیں",
    choose_avatar: "ایسا اوتار منتخب کریں جو آپ کی بہترین نمائندگی کرے، {name}!",
    select_avatar: "اپنا اوتار منتخب کریں",
    skip_profile: "پروفائل چھوڑیں",

    // Achieve
    achieve_title: "یہاں وہ ہے جو آپ 3 مہینوں میں حاصل کر سکتے ہیں!",
    achieve_1_title: "اعتماد کے ساتھ بات چیت کریں",
    achieve_1_desc: "بغیر تناؤ کے بولنے اور سننے کی مشقیں",
    achieve_2_title: "اپنے الفاظ کا ذخیرہ بڑھائیں",
    achieve_2_desc: "عام الفاظ اور عملی جملے",
    achieve_3_title: "سیکھنے کی عادت تیار کریں",
    achieve_3_desc: "سمارٹ یاد دہانیاں، تفریحی چیلنجز، اور بہت کچھ",

    // Source
    source_title: "ایک اور بات! آپ نے ہمارے بارے میں کیسے سنا؟",
    source_news: "خبریں/مضمون/بلاگ",
    source_app_store: "ایپ اسٹور",
    source_google_search: "گوگل سرچ",

    // Placement
    placement_title: "اب آئیے شروع کرنے کے لیے بہترین جگہ تلاش کریں!",
    placement_1_title: "پہلی بار {lang} سیکھ رہے ہیں؟",
    placement_1_desc: "شروع سے آغاز کریں!",
    placement_2_title: "پہلے ہی کچھ {lang} جانتے ہیں؟",
    placement_2_desc: "آئیے آپ کا نقطہ آغاز تلاش کریں!",
    recommended: "تجویز کردہ",

    streak: "{count} دن کا سٹریک",
    welcome_title: "وی ٹاک میں خوش آمدید!",
    welcome_subtitle: "آج کچھ نیا سیکھتے ہیں۔",
    ai_tutor: "اے آئی ٹیوٹر",
    ai_tutor_desc: "آپ کا ذاتی سیکھنے کا اسسٹنٹ",
    chat_now: "ابھی بات کریں",
    your_lessons: "آپ کے اسباق",
    view_all: "سب دیکھیں",
    lesson: "سبق",
    completed: "مکمل ہوا",
    // Tabs
    home: "ہوم",
    practice: "مشق",
    achievements: "کامیابیاں",
    profile: "پروفائل",
    // Lessons 1 & 2
    lesson_1_title: "بنیادی گفتگو",
    lesson_1_desc: "لوگوں کو سلام کرنے کا طریقہ سیکھیں۔",
    lesson_2_title: "عام جملے",
    lesson_2_desc: "روزمرہ کی زندگی کے لیے سادہ اور مفید جملے سیکھیں۔",
    
    // Practice Screen
    unlimited_ai_talk: "لامحدود اے آئی ٹاک",
    unlimited_ai_talk_desc: "ہمارے جدید اے آئی ٹیوٹر سے لائیو فیڈ بیک کے ساتھ قدرتی گفتگو میں مہارت حاصل کریں۔",
    start_session: "سیشن شروع کریں",
    logs: "لاگز",
    learning_tools: "سیکھنے کے اوزار",
    pronunciation: "تلفظ",
    pronunciation_desc: "اے آئی صوتی تجزیہ کے ساتھ اپنے لہجے کو بہترین بنائیں۔",
    practice_now: "ابھی مشق کریں",
    vocabulary: "الفاظ کا ذخیرہ",
    vocabulary_desc: "10k+ منتخب تعلیمی الفاظ کے لیے سیاق و سباق کے ساتھ سیکھنا۔",
    explore_sets: "سیٹس تلاش کریں",
    grammar_takeaways: "گرامر کے اسباق",
    grammar_takeaways_desc: "بات چیت سے فوری تصحیح اور ساختی بصیرت۔",
    review_insights: "بصیرت کا جائزہ لیں",
    custom_tool: "اپنی مرضی کا ٹول",
    custom_tool_desc: "اپنا پسندیدہ مشق موڈ شامل کریں",
    recent_progress: "حالیہ پیش رفت",
    view_detailed_analytics: "تفصیلی تجزیہ دیکھیں",
    practice_streak: "مشق کا سٹریک",
    streak_sub: "دن روشن چمک رہے ہیں!",
    
    // Achievements Screen
    achievement_progress: "کامیابی کی پیش رفت",
    total_badges: "کل بیجز",
    achievement_progress_desc: "جاری رکھیں! گرینڈ ماسٹر بننے کے لیے 13 مزید بیجز درکار ہیں۔",
    earned_badges: "حاصل کردہ بیجز",
    earned_count: "{count} حاصل کیے",
    mastery_certificates: "مہارت کے سرٹیفکیٹس",
    beginner_mastery: "ابتدائی مہارت",
    earned_date: "حاصل کیا 12 جون، 2023",
    view_pdf: "پی ڈی ایف دیکھیں",
    locked_achievements: "بند کامیابیوں",
    fast_learner: "تیز سیکھنے والا",
    vocab_master: "الفاظ کا ماہر",
    grammar_guru: "گرامر کا گرو",
    seven_day_streak: "7 دن کا سٹریک",
    chatty_box: "باتونی باکس",
    top_scorer: "اعلیٰ سکورر",
    night_owl: "شب بیدار",
    early_bird: "سحر خیز",
    public_speaker: "عوامی مقرر",
    polyglot_path: "کثیر لسانی راستہ",
    essayist: "مضمون نگار",
    champion: "چیمپئن",
    
    // Profile Screen
    intermediate_level: "انٹرمیڈیٹ لیول",
    day_streak: "دن کا سٹریک",
    words: "الفاظ",
    lessons: "اسباق",
    weekly_goal: "ہفتہ وار ہدف",
    goal_completed_desc: "5 میں سے 4 اسباق مکمل",
    edit_profile: "پروفائل تبدیل کریں",
    learning_statistics: "سیکھنے کے اعداد و شمار",
    my_certificates: "میرے سرٹیفکیٹس",
    subscription_plan: "سبسکرپشن پلان",

    // Additional Screens (Settings, Welcome, Edit Profile, Subscription Plan)
    profile_setup_success: "پروفائل کا سیٹ اپ کامیاب رہا!",
    avatar_confirmed_desc: "آپ کے اوتار کی تصدیق ہو گئی ہے! اپنے سیکھنے کا سفر شروع کرنے کے لیے جاری رکھیں پر کلک کریں، {name}!",
    go_to_dashboard: "ڈیش بورڈ پر جائیں",
    settings: "ترتیبات",
    save: "محفوظ کریں",
    account_settings: "اکاؤنٹ کی ترتیبات",
    privacy_security: "رازداری اور سیکیورٹی",
    notification_preferences: "اطلاعات کی ترجیحات",
    language_settings: "زبان کی ترتیبات",
    help_support: "مدد اور تعاون",
    faq_contact: "اکثر پوچھے گئے سوالات، ہم سے رابطہ کریں",
    logout: "لاگ آؤٹ",
    delete_account: "اکاؤنٹ حذف کریں",
    change_photo: "تصویر تبدیل کریں",
    full_name: "پورا نام",
    email_address: "ای میل ایڈریس",
    phone_number: "فون نمبر",
    learning_goal: "سیکھنے کا ہدف",
    casual: "سادہ",
    regular: "باقاعدہ",
    serious: "سنجیدہ",
    intense: "انتہائی",
    intensive: "شدید",
    casual_desc: "10 منٹ/دن",
    regular_desc: "30 منٹ/دن",
    intensive_desc: "60 منٹ/دن",
    save_changes: "تبدیلیاں محفوظ کریں",
    choose_your_plan: "اپنے پلان کا انتخاب کریں",
    plan_subtitle: "سنجیدہ سیکھنے والوں کے لیے ڈیزائن کیے گئے اسٹرکچرڈ سیکھنے کے راستوں اور پیشہ ورانہ اوزاروں کے ساتھ اپنی پوری صلاحیتوں کو غیر مقفل کریں اور روانی حاصل کریں۔",
    entry_level: "بنیادی سطح",
    professional: "پیشہ ورانہ",
    enterprise: "انٹرپرائز",
    basic_plan: "بنیادی",
    pro_scholar_plan: "پرو سکالر",
    academic_master_plan: "اکیڈمک ماسٹر",
    forever: "ہمیشہ کے لیے",
    month: "مہینہ",
    subscribe_now: "ابھی سبسکرائب کریں",
    upgrade_to_master: "ماسٹر پر اپ گریڈ کریں",
    best_value: "بہترین قیمت",
    
    // Notifications
    lesson_reminders: "اسباق کی یاد دہانیاں",
    lesson_reminders_desc: "اپنے روزانہ کے اسباق جاری رکھنے کے لیے یاد دہانی حاصل کریں۔",
    streak_alerts: "سٹریک الرٹس",
    streak_alerts_desc: "جب آپ کا سٹریک ٹوٹنے کا خطرہ ہو تو اطلاع دیں۔",
    achievement_alerts: "کامیابی کے الرٹس",
    achievement_alerts_desc: "بیجز، سرٹیفکیٹس اور سنگ میلوں کا جشن منائیں۔",
    weekly_report: "ہفتہ وار پیش رفت رپورٹ",
    weekly_report_desc: "ہر ہفتے اسباق، الفاظ اور سٹریک کا خلاصہ۔",
    
    // Sign In & Sign Up
    sign_in: "سائن ان کریں",
    welcome_back: "وی ٹاک پر دوبارہ خوش آمدید!",
    welcome_subtext: "اپنے اے آئی انگریزی ٹیوٹر کے ساتھ اپنے ذاتی نوعیت کے سیکھنے کے سفر کو جاری رکھنے کے لیے سائن ان کریں۔",
    password: "پاس ورڈ",
    forgot_password: "پاس ورڈ بھول گئے؟",
    continue_with: "جاری رکھیں با:",
    continue_google: "گوگل کے ساتھ جاری رکھیں",
    continue_facebook: "فیس بک کے ساتھ جاری رکھیں",
    continue_apple: "ایپل کے ساتھ جاری رکھیں",
    new_to_wetalk: "وی ٹاک پر نئے ہیں؟ ",
    sign_up: "سائن اپ کریں",
    create_account: "اپنا اکاؤنٹ بنائیں",
    join_now_desc: "ابھی شامل ہوں اور اپنے {lang} کے سفر کا آغاز کریں!",
    full_name_placeholder: "پورا نام",
    confirm_password_placeholder: "پاس ورڈ کی تصدیق کریں",
    let_create_account: "آئیں سیکھنا شروع کرنے کے لیے آپ کا اکاؤنٹ بنائیں! 👋",
    already_have_account: "پہلے سے ہی اکاؤنٹ موجود ہے؟ ",
    login: "لاگ ان کریں"
  },
  Hindi: {
    welcome: "नमस्ते! मैं वीबॉट हूँ!",
    what_learn: "आप क्या सीखना चाहेंगे?",
    how_much: "आप {lang} कितना जानते हैं?",
    why_learning: "आप {lang} क्यों सीख रहे हैं?",
    continue: "जारी रखें",
    native_lang: "आपकी मातृभाषा क्या है?",
    get_started: "शुरू करें",
    new_to: "मैं {lang} के लिए बिल्कुल नया हूँ",
    common_words: "मुझे कुछ सामान्य शब्द पता हैं",
    basic_conv: "मैं बुनियादी बातचीत कर सकता हूँ",
    talk_topics: "मैं विभिन्न विषयों पर बात कर सकता हूँ",
    discuss_detail: "मैं अधिकांश विषयों पर विस्तार से चर्चा कर सकता हूँ",
    daily_goal: "आपका दैनिक सीखने का लक्ष्य क्या है?",
    committed: "मैं प्रतिबद्ध हूँ",
    streak: "{count} दिन का स्ट्रिक",
    welcome_title: "वीटॉक में आपका स्वागत है!",
    welcome_subtitle: "आज कुछ नया सीखते हैं।",
    ai_tutor: "एआई ट्यूटर",
    ai_tutor_desc: "आपका व्यक्तिगत शिक्षण सहायक",
    chat_now: "अभी चैट करें",
    your_lessons: "आपके पाठ",
    view_all: "सभी देखें",
    lesson: "पाठ",
    completed: "पूर्ण",
    // Tabs
    home: "होम",
    practice: "अभ्यास",
    achievements: "उपलब्धियां",
    profile: "प्रोफाइल",
    // Lessons 1 & 2
    lesson_1_title: "बुनियादी नमस्कार",
    lesson_1_desc: "लोगों का अभिवादन करना सीखें।",
    lesson_2_title: "आम वाक्यांश",
    lesson_2_desc: "दैनिक जीवन के लिए सरल और उपयोगी वाक्यांश सीखें।"
  },
  Spanish: {
    welcome: "¡Hola! ¡Soy WeBot!",
    what_learn: "¿Qué te gustaría aprender?",
    how_much: "¿Cuánto {lang} sabes?",
    why_learning: "¿Por qué estás aprendiendo {lang}?",
    continue: "CONTINUAR",
    native_lang: "¿Cuál es tu lengua materna?",
    get_started: "Empezar",
    new_to: "Soy nuevo en {lang}",
    common_words: "Sé algunas palabras comunes",
    basic_conv: "Puedo tener conversaciones básicas",
    talk_topics: "Puedo hablar de varios temas",
    discuss_detail: "Puedo discutir la mayoría de los temas en detalle",
    daily_goal: "¿Cuál es tu objetivo diario de aprendizaje?",
    committed: "ESTOY COMPROMETIDO",
    streak: "Racha de {count} Días",
    welcome_title: "¡Bienvenido a WeTalk!",
    welcome_subtitle: "Aprendamos algo nuevo hoy.",
    ai_tutor: "Tutor de IA",
    ai_tutor_desc: "Tu asistente personal de aprendizaje",
    chat_now: "Chatear Ahora",
    your_lessons: "Tus Lecciones",
    view_all: "Ver Todo",
    lesson: "Lección",
    completed: "Completado",
    // Tabs
    home: "Inicio",
    practice: "Práctica",
    achievements: "Logros",
    profile: "Perfil",
    // Lessons 1 & 2
    lesson_1_title: "Saludos Básicos",
    lesson_1_desc: "Aprende a saludar a la gente.",
    lesson_2_title: "Frases Comunes",
    lesson_2_desc: "Aprende frases sencillas y útiles para la vida diaria."
  },
  Japanese: {
    welcome: "こんにちは！ WeBotです！",
    what_learn: "何を学びたいですか？",
    how_much: "{lang}をどのくらい知っていますか？",
    why_learning: "なぜ{lang}を学んでいるのですか？",
    continue: "続行する",
    native_lang: "あなたの母国語は何ですか？",
    get_started: "始める",
    new_to: "{lang}は初めてです",
    common_words: "いくつかの一般的な単語を知っています",
    basic_conv: "基本的な会話ができます",
    talk_topics: "さまざまなトピックについて話すことができます",
    discuss_detail: "ほとんどのトピックについて詳しく議論できます",
    daily_goal: "1日の学習目標は何ですか？",
    committed: "頑張ります",
    streak: "{count}日間のストリーク",
    welcome_title: "WeTalkへようこそ！",
    welcome_subtitle: "今日、新しいことを学びましょう。",
    ai_tutor: "AIチューター",
    ai_tutor_desc: "あなたの個人学習アシスタント",
    chat_now: "今すぐチャット",
    your_lessons: "あなたのレッスン",
    view_all: "すべて表示",
    lesson: "レッスン",
    completed: "完了",
    // Tabs
    home: "ホーム",
    practice: "練習",
    achievements: "実績",
    profile: "プロフィール",
    // Lessons 1 & 2
    lesson_1_title: "基本的な挨拶",
    lesson_1_desc: "人々への挨拶の仕方を学びます。",
    lesson_2_title: "日常会話表現",
    lesson_2_desc: "日常生活に役立つシンプルで便利な表現を学びます。"
  },
  Chinese: {
    welcome: "你好！我是 WeBot！",
    what_learn: "你想学习什么？",
    how_much: "你懂多少 {lang}？",
    why_learning: "你为什么要学习 {lang}？",
    continue: "继续",
    native_lang: "你的母语是什么？",
    get_started: "开始使用",
    new_to: "我是 {lang} 新手",
    common_words: "我知道一些常用词",
    basic_conv: "我可以进行基本对话",
    talk_topics: "我可以谈论各种话题",
    discuss_detail: "我可以详细讨论大多数话题",
    daily_goal: "你每日的学习目标是什么？",
    committed: "我承诺",
    streak: "{count} 天连续打卡",
    welcome_title: "欢迎来到 WeTalk！",
    welcome_subtitle: "今天让我们学习一些新东西。",
    ai_tutor: "AI 导师",
    ai_tutor_desc: "您的个人学习助手",
    chat_now: "立即聊天",
    your_lessons: "您的课程",
    view_all: "查看全部",
    lesson: "课程",
    completed: "已完成",
    // Tabs
    home: "首页",
    practice: "练习",
    achievements: "成就",
    profile: "个人资料",
    // Lessons 1 & 2
    lesson_1_title: "基本问候",
    lesson_1_desc: "学习如何向人问候。",
    lesson_2_title: "常用短语",
    lesson_2_desc: "学习日常生活中的简单实用短语。"
  },
  Arabic: {
    welcome: "أهلاً! أنا WeBot!",
    what_learn: "ماذا تحب أن تتعلم؟",
    how_much: "كم تعرف من {lang}؟",
    why_learning: "لماذا تتعلم {lang}؟",
    continue: "متابعة",
    native_lang: "ما هي لغتك الأم؟",
    get_started: "ابدأ الآن",
    new_to: "أنا جديد في {lang}",
    common_words: "أعرف بعض الكلمات الشائعة",
    basic_conv: "يمكنني إجراء محادثات أساسية",
    talk_topics: "يمكنني التحدث في مواضيع مختلفة",
    discuss_detail: "يمكنني مناقشة معظم المواضيع بالتفصيل",
    daily_goal: "ما هو هدفك التعليمي اليومي؟",
    committed: "أنا ملتزم",
    streak: "سلسلة تفاعل {count} أيام",
    welcome_title: "مرحباً بك في WeTalk!",
    welcome_subtitle: "دعنا نتعلم شيئاً جديداً اليوم.",
    ai_tutor: "معلم الذكاء الاصطناعي",
    ai_tutor_desc: "مساعدك الشخصي للتعلم",
    chat_now: "تحدث الآن",
    your_lessons: "دروسك",
    view_all: "عرض الكل",
    lesson: "درس",
    completed: "مكتمل",
    // Tabs
    home: "الرئيسية",
    practice: "التدريب",
    achievements: "الإنجازات",
    profile: "الملف الشخصي",
    // Lessons 1 & 2
    lesson_1_title: "التحيات الأساسية",
    lesson_1_desc: "تعلم كيفية تحية الناس.",
    lesson_2_title: "العبارات الشائعة",
    lesson_2_desc: "تعلم عبارات بسيطة ومفيدة للحياة اليومية."
  }
};

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => Promise<void>;
  t: (key: string, params?: Record<string, string>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState('English');

  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem('app_language');
        if (savedLang) {
          setLanguageState(savedLang);
        }
      } catch (err) {
        console.log('Error loading saved language:', err);
      }
    };
    loadSavedLanguage();
  }, []);

  const setLanguage = async (lang: string) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem('app_language', lang);
    } catch (err) {
      console.log('Error saving language:', err);
    }
  };

  const t = (key: string, params?: Record<string, string>) => {
    const langData = translations[language] || translations['English'];
    let text = langData[key] || translations['English'][key] || key;
    
    if (params) {
      Object.keys(params).forEach((param) => {
        text = text.replace(`{${param}}`, params[param]);
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
