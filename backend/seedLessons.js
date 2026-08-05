const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Lesson = require('./src/models/Lesson');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const mongoURI = process.env.MONGO_URI || 'mongodb+srv://hanzalaahmed024_db_user:Hanzala123@cluster0.yt9ptue.mongodb.net/wetalk_db?retryWrites=true&w=majority&appName=Cluster0';

const lessons = [
  // Lesson 1: Basic Greetings
  {
    lessonNumber: 1,
    title: 'Basic Greetings',
    description: 'Learn how to greet people in English and start simple conversations.',
    learn: [
      {
        word: 'Hello',
        urduMeaning: 'ہیلو / السلام علیکم',
        audioUrl: 'https://assets.wetalkapp.com/audio/hello.mp3',
        exampleSentence: 'Hello! How are you today?'
      },
      {
        word: 'Hi',
        urduMeaning: 'ہائے',
        audioUrl: 'https://assets.wetalkapp.com/audio/hi.mp3',
        exampleSentence: 'Hi, nice to meet you.'
      },
      {
        word: 'Good morning',
        urduMeaning: 'صبح بخیر',
        audioUrl: 'https://assets.wetalkapp.com/audio/good_morning.mp3',
        exampleSentence: 'Good morning, hope you slept well.'
      },
      {
        word: 'How are you?',
        urduMeaning: 'آپ کیسے ہیں؟',
        audioUrl: 'https://assets.wetalkapp.com/audio/how_are_you.mp3',
        exampleSentence: 'How are you doing this afternoon?'
      },
      {
        word: 'I am fine, thank you',
        urduMeaning: 'میں ٹھیک ہوں، آپ کا شکریہ',
        audioUrl: 'https://assets.wetalkapp.com/audio/fine_thank_you.mp3',
        exampleSentence: 'I am fine, thank you, how about you?'
      },
      {
        word: 'Goodbye',
        urduMeaning: 'خدا حافظ / اللہ حافظ',
        audioUrl: 'https://assets.wetalkapp.com/audio/goodbye.mp3',
        exampleSentence: 'Goodbye, see you again tomorrow.'
      }
    ],
    practice: {
      listenAndRepeat: [
        'Hello, how are you today?',
        'Good morning, nice to meet you.',
        'Goodbye, see you soon.'
      ],
      fillInTheBlanks: [
        {
          question: 'Hello! How ___ you?',
          choices: ['is', 'are', 'am'],
          correctAnswer: 'are'
        },
        {
          question: 'I am fine, ___ you.',
          choices: ['thank', 'welcome', 'please'],
          correctAnswer: 'thank'
        },
        {
          question: 'Good ___! Hope you slept well.',
          choices: ['night', 'evening', 'morning'],
          correctAnswer: 'morning'
        }
      ],
      speakYourself: [
        'Nice to meet you, hope to see you soon.',
        'Hi, my name is Hanzala.',
        'Good afternoon, everyone!'
      ]
    },
    quiz: [
      {
        question: "What is a common response to 'How are you?'",
        options: ['I am fine, thank you.', 'Goodbye.', 'Good morning.'],
        correctAnswer: 'I am fine, thank you.'
      },
      {
        question: 'Which greeting is used in the morning?',
        options: ['Good afternoon', 'Good morning', 'Good evening'],
        correctAnswer: 'Good morning'
      },
      {
        question: 'What do you say when you leave someone?',
        options: ['Hello', 'Nice to meet you', 'Goodbye'],
        correctAnswer: 'Goodbye'
      },
      {
        question: "Which is a casual form of 'Hello'?",
        options: ['Good morning', 'Hi', 'Goodbye'],
        correctAnswer: 'Hi'
      },
      {
        question: "Complete the phrase: 'Nice to ___ you.'",
        options: ['meet', 'see', 'hear'],
        correctAnswer: 'meet'
      }
    ]
  },
  // Lesson 2: Introducing Yourself
  {
    lessonNumber: 2,
    title: 'Introducing Yourself',
    description: 'Learn how to state your name, origin, and make new connections.',
    learn: [
      {
        word: 'My',
        urduMeaning: 'میرا / میری',
        audioUrl: 'https://assets.wetalkapp.com/audio/my.mp3',
        exampleSentence: 'My name is Sarah.'
      },
      {
        word: 'Name',
        urduMeaning: 'نام',
        audioUrl: 'https://assets.wetalkapp.com/audio/name.mp3',
        exampleSentence: 'What is your name?'
      },
      {
        word: 'Introduce',
        urduMeaning: 'تعارف کروانا',
        audioUrl: 'https://assets.wetalkapp.com/audio/introduce.mp3',
        exampleSentence: 'Let me introduce myself.'
      },
      {
        word: 'Meet',
        urduMeaning: 'ملنا',
        audioUrl: 'https://assets.wetalkapp.com/audio/meet.mp3',
        exampleSentence: 'It is nice to meet you.'
      },
      {
        word: 'Live',
        urduMeaning: 'رہنا',
        audioUrl: 'https://assets.wetalkapp.com/audio/live.mp3',
        exampleSentence: 'I live in Karachi.'
      },
      {
        word: 'From',
        urduMeaning: 'سے',
        audioUrl: 'https://assets.wetalkapp.com/audio/from.mp3',
        exampleSentence: 'Where are you from?'
      }
    ],
    practice: {
      listenAndRepeat: [
        'My name is Sarah.',
        'I am from Pakistan.',
        'Nice to meet you.'
      ],
      fillInTheBlanks: [
        {
          question: 'My ___ is John.',
          choices: ['name', 'friend', 'from'],
          correctAnswer: 'name'
        },
        {
          question: 'Where are you ___?',
          choices: ['from', 'live', 'name'],
          correctAnswer: 'from'
        },
        {
          question: 'I ___ in Lahore.',
          choices: ['live', 'from', 'meet'],
          correctAnswer: 'live'
        }
      ],
      speakYourself: [
        'Hello, I want to introduce myself.',
        'I live in Karachi with my family.',
        'This is my best friend, Ali.'
      ]
    },
    quiz: [
      {
        question: 'How do you ask someone their name?',
        options: ['What is your name?', 'Where do you live?', 'How old are you?'],
        correctAnswer: 'What is your name?'
      },
      {
        question: "Complete the sentence: 'I am ___ Pakistan.'",
        options: ['from', 'live', 'at'],
        correctAnswer: 'from'
      },
      {
        question: 'Which word means to tell others about yourself?',
        options: ['Introduce', 'Goodbye', 'Greet'],
        correctAnswer: 'Introduce'
      },
      {
        question: 'What do you say after meeting someone for the first time?',
        options: ['Nice to meet you.', 'See you tomorrow.', 'Good night.'],
        correctAnswer: 'Nice to meet you.'
      },
      {
        question: "Complete the sentence: 'This is ___ friend, Ali.'",
        options: ['my', 'I', 'me'],
        correctAnswer: 'my'
      }
    ]
  },
  // Lesson 3: Family & Relationships
  {
    lessonNumber: 3,
    title: 'Family & Relationships',
    description: 'Learn terms for family members and how to describe family trees.',
    learn: [
      {
        word: 'Father',
        urduMeaning: 'والد / ابا',
        audioUrl: 'https://assets.wetalkapp.com/audio/father.mp3',
        exampleSentence: 'My father is a kind man.'
      },
      {
        word: 'Mother',
        urduMeaning: 'والدہ / امی',
        audioUrl: 'https://assets.wetalkapp.com/audio/mother.mp3',
        exampleSentence: 'My mother cooks delicious food.'
      },
      {
        word: 'Brother',
        urduMeaning: 'بھائی',
        audioUrl: 'https://assets.wetalkapp.com/audio/brother.mp3',
        exampleSentence: 'He is my elder brother.'
      },
      {
        word: 'Sister',
        urduMeaning: 'بہن',
        audioUrl: 'https://assets.wetalkapp.com/audio/sister.mp3',
        exampleSentence: 'My younger sister is studying.'
      },
      {
        word: 'Family',
        urduMeaning: 'خاندان / گھر والے',
        audioUrl: 'https://assets.wetalkapp.com/audio/family.mp3',
        exampleSentence: 'I have a large family.'
      },
      {
        word: 'Son',
        urduMeaning: 'بیٹا',
        audioUrl: 'https://assets.wetalkapp.com/audio/son.mp3',
        exampleSentence: 'He is their eldest son.'
      }
    ],
    practice: {
      listenAndRepeat: [
        'I love my family.',
        'How many siblings do you have?',
        'She is my younger sister.'
      ],
      fillInTheBlanks: [
        {
          question: 'My father and ___ are my parents.',
          choices: ['mother', 'brother', 'sister'],
          correctAnswer: 'mother'
        },
        {
          question: 'I have a brother and a ___.',
          choices: ['sister', 'father', 'son'],
          correctAnswer: 'sister'
        },
        {
          question: "He is my uncle's ___.",
          choices: ['son', 'parents', 'mother'],
          correctAnswer: 'son'
        }
      ],
      speakYourself: [
        'My mother is a school teacher.',
        'We are a happy family of five.',
        'I have two elder brothers.'
      ]
    },
    quiz: [
      {
        question: 'Who are your parents?',
        options: ['Father and Mother', 'Brother and Sister', 'Uncle and Aunt'],
        correctAnswer: 'Father and Mother'
      },
      {
        question: 'What is a female sibling called?',
        options: ['Sister', 'Brother', 'Mother'],
        correctAnswer: 'Sister'
      },
      {
        question: 'What is the son of your brother called?',
        options: ['Nephew', 'Niece', 'Uncle'],
        correctAnswer: 'Nephew'
      },
      {
        question: "Complete the sentence: 'I love ___ family.'",
        options: ['my', 'me', 'I'],
        correctAnswer: 'my'
      },
      {
        question: 'What is a male sibling called?',
        options: ['Brother', 'Sister', 'Daughter'],
        correctAnswer: 'Brother'
      }
    ]
  },
  // Lesson 4: Numbers & Telling Time
  {
    lessonNumber: 4,
    title: 'Numbers & Telling Time',
    description: 'Learn to read clocks, tell the time, and count accurately in English.',
    learn: [
      {
        word: 'Clock',
        urduMeaning: 'دیوار گھڑی',
        audioUrl: 'https://assets.wetalkapp.com/audio/clock.mp3',
        exampleSentence: 'Look at the round wall clock.'
      },
      {
        word: 'Time',
        urduMeaning: 'وقت',
        audioUrl: 'https://assets.wetalkapp.com/audio/time.mp3',
        exampleSentence: 'What time is it?'
      },
      {
        word: 'Hour',
        urduMeaning: 'گھنٹہ',
        audioUrl: 'https://assets.wetalkapp.com/audio/hour.mp3',
        exampleSentence: 'There are sixty minutes in one hour.'
      },
      {
        word: 'Minute',
        urduMeaning: 'منٹ',
        audioUrl: 'https://assets.wetalkapp.com/audio/minute.mp3',
        exampleSentence: 'Wait for a minute, please.'
      },
      {
        word: 'O\'clock',
        urduMeaning: 'بجے',
        audioUrl: 'https://assets.wetalkapp.com/audio/oclock.mp3',
        exampleSentence: 'It is exactly three o\'clock.'
      },
      {
        word: 'Half',
        urduMeaning: 'آدھا',
        audioUrl: 'https://assets.wetalkapp.com/audio/half.mp3',
        exampleSentence: 'We will meet at half past four.'
      }
    ],
    practice: {
      listenAndRepeat: [
        'What time is it?',
        'It is five o\'clock.',
        'Class starts at half past nine.'
      ],
      fillInTheBlanks: [
        {
          question: 'It is 8 ___.',
          choices: ["o'clock", 'time', 'hour'],
          correctAnswer: "o'clock"
        },
        {
          question: 'There are sixty minutes in one ___.',
          choices: ['hour', 'minute', 'day'],
          correctAnswer: 'hour'
        },
        {
          question: 'Quarter ___ ten means 9:45.',
          choices: ['to', 'past', 'at'],
          correctAnswer: 'to'
        }
      ],
      speakYourself: [
        'I wake up at six in the morning.',
        'The meeting is at a quarter past two.',
        'We have ten minutes left.'
      ]
    },
    quiz: [
      {
        question: 'How do you ask for the time?',
        options: ['What time is it?', 'Where is the clock?', 'How many hours?'],
        correctAnswer: 'What time is it?'
      },
      {
        question: "What does 'half past seven' mean?",
        options: ['7:30', '7:15', '8:30'],
        correctAnswer: '7:30'
      },
      {
        question: 'How many minutes are in an hour?',
        options: ['60', '50', '100'],
        correctAnswer: '60'
      },
      {
        question: "What does 'quarter to four' mean?",
        options: ['3:45', '4:15', '4:45'],
        correctAnswer: '3:45'
      },
      {
        question: 'Which word represents the circular device that tells time?',
        options: ['Clock', 'Time', 'Hour'],
        correctAnswer: 'Clock'
      }
    ]
  },
  // Lesson 5: Daily Routine
  {
    lessonNumber: 5,
    title: 'Daily Routine',
    description: 'Learn how to describe your typical day, chores, and schedules.',
    learn: [
      {
        word: 'Wake up',
        urduMeaning: 'جاگنا / اٹھنا',
        audioUrl: 'https://assets.wetalkapp.com/audio/wake_up.mp3',
        exampleSentence: 'I wake up at 6:00 AM.'
      },
      {
        word: 'Eat',
        urduMeaning: 'کھانا',
        audioUrl: 'https://assets.wetalkapp.com/audio/eat.mp3',
        exampleSentence: 'I eat breakfast at seven.'
      },
      {
        word: 'Sleep',
        urduMeaning: 'سونا',
        audioUrl: 'https://assets.wetalkapp.com/audio/sleep.mp3',
        exampleSentence: 'It is important to sleep 8 hours.'
      },
      {
        word: 'Work',
        urduMeaning: 'کام کرنا',
        audioUrl: 'https://assets.wetalkapp.com/audio/work.mp3',
        exampleSentence: 'I work at a software company.'
      },
      {
        word: 'Wash',
        urduMeaning: 'دھونا',
        audioUrl: 'https://assets.wetalkapp.com/audio/wash.mp3',
        exampleSentence: 'I wash my hands with soap.'
      },
      {
        word: 'Study',
        urduMeaning: 'مطالعہ کرنا / پڑھنا',
        audioUrl: 'https://assets.wetalkapp.com/audio/study.mp3',
        exampleSentence: 'I study English lessons daily.'
      }
    ],
    practice: {
      listenAndRepeat: [
        'I wake up early in the morning.',
        'I eat breakfast at seven.',
        'I study for exams at night.'
      ],
      fillInTheBlanks: [
        {
          question: 'I ___ my teeth every morning.',
          choices: ['brush', 'eat', 'sleep'],
          correctAnswer: 'brush'
        },
        {
          question: 'I go to ___ at ten o\'clock.',
          choices: ['sleep', 'work', 'wash'],
          correctAnswer: 'sleep'
        },
        {
          question: 'I like to ___ books before sleeping.',
          choices: ['read', 'clean', 'study'],
          correctAnswer: 'read'
        }
      ],
      speakYourself: [
        'I wash my face and hands before eating.',
        'I help clean the house on weekends.',
        'I go to work by bus.'
      ]
    },
    quiz: [
      {
        question: 'What do you do first in the morning?',
        options: ['Wake up', 'Sleep', 'Study'],
        correctAnswer: 'Wake up'
      },
      {
        question: 'Which meal is eaten in the morning?',
        options: ['Breakfast', 'Lunch', 'Dinner'],
        correctAnswer: 'Breakfast'
      },
      {
        question: 'What is the opposite of waking up?',
        options: ['Sleeping', 'Working', 'Eating'],
        correctAnswer: 'Sleeping'
      },
      {
        question: "Complete the sentence: 'I ___ my face with water.'",
        options: ['wash', 'read', 'clean'],
        correctAnswer: 'wash'
      },
      {
        question: 'Where do you go to study and learn from teachers?',
        options: ['School', 'Office', 'Park'],
        correctAnswer: 'School'
      }
    ]
  },
  // Lesson 6: Asking for Help & Directions
  {
    lessonNumber: 6,
    title: 'Asking for Help & Directions',
    description: 'Learn to ask for navigation directions and request assistance politely.',
    learn: [
      {
        word: 'Help',
        urduMeaning: 'مدد',
        audioUrl: 'https://assets.wetalkapp.com/audio/help.mp3',
        exampleSentence: 'Can you please help me?'
      },
      {
        word: 'Excuse me',
        urduMeaning: 'معاف کیجیے گا',
        audioUrl: 'https://assets.wetalkapp.com/audio/excuse_me.mp3',
        exampleSentence: 'Excuse me, where is the station?'
      },
      {
        word: 'Please',
        urduMeaning: 'براہ کرم / مہربانی فرما کر',
        audioUrl: 'https://assets.wetalkapp.com/audio/please.mp3',
        exampleSentence: 'Help me with these bags, please.'
      },
      {
        word: 'Where',
        urduMeaning: 'کہاں',
        audioUrl: 'https://assets.wetalkapp.com/audio/where.mp3',
        exampleSentence: 'Where is the nearest hospital?'
      },
      {
        word: 'Left',
        urduMeaning: 'بائیں طرف',
        audioUrl: 'https://assets.wetalkapp.com/audio/left.mp3',
        exampleSentence: 'Turn left at the next signal.'
      },
      {
        word: 'Right',
        urduMeaning: 'دائیں طرف',
        audioUrl: 'https://assets.wetalkapp.com/audio/right.mp3',
        exampleSentence: 'The bank is on your right.'
      }
    ],
    practice: {
      listenAndRepeat: [
        'Excuse me, can you help me?',
        'Go straight and turn left.',
        'Where is the nearest hospital?'
      ],
      fillInTheBlanks: [
        {
          question: 'Please turn ___ at the corner.',
          choices: ['right', 'help', 'straight'],
          correctAnswer: 'right'
        },
        {
          question: '___ is the train station?',
          choices: ['Where', 'What', 'How'],
          correctAnswer: 'Where'
        },
        {
          question: 'Excuse ___, where is the library?',
          choices: ['me', 'I', 'my'],
          correctAnswer: 'me'
        }
      ],
      speakYourself: [
        'Can you please show me the way on the map?',
        'Is the market near or far?',
        'Thank you so much for your help.'
      ]
    },
    quiz: [
      {
        question: 'What do you say to get someone\'s attention politely?',
        options: ['Excuse me', 'Hey you', 'Help me'],
        correctAnswer: 'Excuse me'
      },
      {
        question: 'Which direction is the opposite of \'left\'?',
        options: ['Right', 'Straight', 'Behind'],
        correctAnswer: 'Right'
      },
      {
        question: 'What word means \'close by\'?',
        options: ['Near', 'Far', 'Straight'],
        correctAnswer: 'Near'
      },
      {
        question: "Complete the sentence: 'Can you ___ me, please?'",
        options: ['help', 'turn', 'where'],
        correctAnswer: 'help'
      },
      {
        question: 'If you walk in a line without turning, you are going ___.',
        options: ['straight', 'left', 'right'],
        correctAnswer: 'straight'
      }
    ]
  },
  // Lesson 7: Shopping & Prices
  {
    lessonNumber: 7,
    title: 'Shopping & Prices',
    description: 'Learn terms for transactions, prices, and shopping items.',
    learn: [
      {
        word: 'Buy',
        urduMeaning: 'خریدنا',
        audioUrl: 'https://assets.wetalkapp.com/audio/buy.mp3',
        exampleSentence: 'I want to buy some apples.'
      },
      {
        word: 'Sell',
        urduMeaning: 'بیچنا',
        audioUrl: 'https://assets.wetalkapp.com/audio/sell.mp3',
        exampleSentence: 'They sell high quality clothes.'
      },
      {
        word: 'Price',
        urduMeaning: 'قیمت',
        audioUrl: 'https://assets.wetalkapp.com/audio/price.mp3',
        exampleSentence: 'What is the price of this dress?'
      },
      {
        word: 'Money',
        urduMeaning: 'رقم / پیسے',
        audioUrl: 'https://assets.wetalkapp.com/audio/money.mp3',
        exampleSentence: 'Do you have enough money?'
      },
      {
        word: 'Cheap',
        urduMeaning: 'سستا',
        audioUrl: 'https://assets.wetalkapp.com/audio/cheap.mp3',
        exampleSentence: 'This small bag is very cheap.'
      },
      {
        word: 'Expensive',
        urduMeaning: 'مہنگا',
        audioUrl: 'https://assets.wetalkapp.com/audio/expensive.mp3',
        exampleSentence: 'Luxury cars are very expensive.'
      }
    ],
    practice: {
      listenAndRepeat: [
        'How much does this cost?',
        'This shirt is very expensive.',
        'I want to buy some fruits.'
      ],
      fillInTheBlanks: [
        {
          question: 'This shop has ___ items at low prices.',
          choices: ['cheap', 'expensive', 'cost'],
          correctAnswer: 'cheap'
        },
        {
          question: 'How much ___ do you have?',
          choices: ['money', 'cost', 'buy'],
          correctAnswer: 'money'
        },
        {
          question: 'I want to ___ a new phone.',
          choices: ['buy', 'sell', 'price'],
          correctAnswer: 'buy'
        }
      ],
      speakYourself: [
        'Is there a discount on these clothes?',
        'The price of this bag is too high.',
        'I paid with cash at the counter.'
      ]
    },
    quiz: [
      {
        question: 'How do you ask for the price of something?',
        options: ['How much is this?', 'What is this?', 'Where is the shop?'],
        correctAnswer: 'How much is this?'
      },
      {
        question: 'What is the opposite of \'cheap\'?',
        options: ['Expensive', 'Cost', 'Price'],
        correctAnswer: 'Expensive'
      },
      {
        question: 'What do you need to pay for goods?',
        options: ['Money', 'Words', 'Time'],
        correctAnswer: 'Money'
      },
      {
        question: 'What is a place where you go to buy things?',
        options: ['Shop / Store', 'School', 'Hospital'],
        correctAnswer: 'Shop / Store'
      },
      {
        question: "Complete the sentence: 'I want to ___ my old car.'",
        options: ['sell', 'buy', 'cost'],
        correctAnswer: 'sell'
      }
    ]
  },
  // Lesson 8: Food & Ordering at a Restaurant
  {
    lessonNumber: 8,
    title: 'Food & Ordering at a Restaurant',
    description: 'Learn terms for foods, menus, and ordering meals at cafes.',
    learn: [
      {
        word: 'Food',
        urduMeaning: 'کھانا / غذا',
        audioUrl: 'https://assets.wetalkapp.com/audio/food.mp3',
        exampleSentence: 'I like Italian food.'
      },
      {
        word: 'Water',
        urduMeaning: 'پانی',
        audioUrl: 'https://assets.wetalkapp.com/audio/water.mp3',
        exampleSentence: 'Please bring me glass of water.'
      },
      {
        word: 'Menu',
        urduMeaning: 'کھانے کی فہرست',
        audioUrl: 'https://assets.wetalkapp.com/audio/menu.mp3',
        exampleSentence: 'Can I see the food menu?'
      },
      {
        word: 'Order',
        urduMeaning: 'آرڈر دینا',
        audioUrl: 'https://assets.wetalkapp.com/audio/order.mp3',
        exampleSentence: 'Are you ready to order?'
      },
      {
        word: 'Delicious',
        urduMeaning: 'مزیدار / لذیذ',
        audioUrl: 'https://assets.wetalkapp.com/audio/delicious.mp3',
        exampleSentence: 'This sweet cake is delicious.'
      },
      {
        word: 'Bill',
        urduMeaning: 'بل',
        audioUrl: 'https://assets.wetalkapp.com/audio/bill.mp3',
        exampleSentence: 'Ask the waiter for the bill.'
      }
    ],
    practice: {
      listenAndRepeat: [
        'Can we have the menu, please?',
        'I would like to order a chicken burger.',
        'This soup is delicious.'
      ],
      fillInTheBlanks: [
        {
          question: 'Excuse me, can I have the ___?',
          choices: ['bill', 'water', 'food'],
          correctAnswer: 'bill'
        },
        {
          question: 'I want to drink cold ___.',
          choices: ['water', 'food', 'menu'],
          correctAnswer: 'water'
        },
        {
          question: 'Let\'s eat at a nice ___.',
          choices: ['restaurant', 'menu', 'order'],
          correctAnswer: 'restaurant'
        }
      ],
      speakYourself: [
        'What is the special dish of today?',
        'I would like to order a fresh salad, please.',
        'Thank you, the food was great.'
      ]
    },
    quiz: [
      {
        question: 'What paper shows the list of food at a restaurant?',
        options: ['Menu', 'Bill', 'Book'],
        correctAnswer: 'Menu'
      },
      {
        question: 'What do you ask for when you want to pay at the end?',
        options: ['The Bill', 'The Menu', 'The Order'],
        correctAnswer: 'The Bill'
      },
      {
        question: 'What word means \'tasty\' or \'very good to eat\'?',
        options: ['Delicious', 'Expensive', 'Cheap'],
        correctAnswer: 'Delicious'
      },
      {
        question: 'Which verb means to consume food?',
        options: ['Eat', 'Drink', 'Order'],
        correctAnswer: 'Eat'
      },
      {
        question: "Complete the sentence: 'I am ready to ___ my food.'",
        options: ['order', 'menu', 'bill'],
        correctAnswer: 'order'
      }
    ]
  },
  // Lesson 9: Expressing Feelings & Emotions
  {
    lessonNumber: 9,
    title: 'Expressing Feelings & Emotions',
    description: 'Learn vocabulary to clearly articulate your emotions and states of mind.',
    learn: [
      {
        word: 'Happy',
        urduMeaning: 'خوش',
        audioUrl: 'https://assets.wetalkapp.com/audio/happy.mp3',
        exampleSentence: 'I am happy because I passed.'
      },
      {
        word: 'Sad',
        urduMeaning: 'اداس',
        audioUrl: 'https://assets.wetalkapp.com/audio/sad.mp3',
        exampleSentence: 'He is sad about leaving.'
      },
      {
        word: 'Angry',
        urduMeaning: 'غصہ / ناراض',
        audioUrl: 'https://assets.wetalkapp.com/audio/angry.mp3',
        exampleSentence: 'Please do not get angry.'
      },
      {
        word: 'Tired',
        urduMeaning: 'تھکا ہوا',
        audioUrl: 'https://assets.wetalkapp.com/audio/tired.mp3',
        exampleSentence: 'I am tired after the work.'
      },
      {
        word: 'Afraid',
        urduMeaning: 'خوفزدہ / ڈرا ہوا',
        audioUrl: 'https://assets.wetalkapp.com/audio/afraid.mp3',
        exampleSentence: 'I am afraid of dark rooms.'
      },
      {
        word: 'Calm',
        urduMeaning: 'سکون / پرسکون',
        audioUrl: 'https://assets.wetalkapp.com/audio/calm.mp3',
        exampleSentence: 'Deep breaths make me feel calm.'
      }
    ],
    practice: {
      listenAndRepeat: [
        'I am so happy to see you!',
        'He looks very tired after work.',
        'Don\'t be afraid, I am here.'
      ],
      fillInTheBlanks: [
        {
          question: 'She is ___ because she lost her keys.',
          choices: ['sad', 'happy', 'calm'],
          correctAnswer: 'sad'
        },
        {
          question: 'I am ___ about the test tomorrow.',
          choices: ['worried', 'excited', 'tired'],
          correctAnswer: 'worried'
        },
        {
          question: 'Please stay ___ and do not panic.',
          choices: ['calm', 'angry', 'afraid'],
          correctAnswer: 'calm'
        }
      ],
      speakYourself: [
        'I am excited about our trip next week.',
        'He gets angry when people lie.',
        'I feel calm when listening to music.'
      ]
    },
    quiz: [
      {
        question: 'How do you feel when you receive a nice gift?',
        options: ['Happy', 'Sad', 'Angry'],
        correctAnswer: 'Happy'
      },
      {
        question: 'How do you feel after running a long marathon?',
        options: ['Tired', 'Afraid', 'Excited'],
        correctAnswer: 'Tired'
      },
      {
        question: 'What is the opposite of \'sad\'?',
        options: ['Happy', 'Angry', 'Calm'],
        correctAnswer: 'Happy'
      },
      {
        question: 'What word describes feeling fear?',
        options: ['Afraid', 'Excited', 'Tired'],
        correctAnswer: 'Afraid'
      },
      {
        question: "Complete the sentence: 'I am ___ about the bad news.'",
        options: ['sad', 'excited', 'calm'],
        correctAnswer: 'sad'
      }
    ]
  },
  // Lesson 10: Weather & Seasons
  {
    lessonNumber: 10,
    title: 'Weather & Seasons',
    description: 'Learn to describe climate patterns, rainfall, heat, and seasons.',
    learn: [
      {
        word: 'Sun',
        urduMeaning: 'سورج',
        audioUrl: 'https://assets.wetalkapp.com/audio/sun.mp3',
        exampleSentence: 'The sun shines bright today.'
      },
      {
        word: 'Rain',
        urduMeaning: 'بارش',
        audioUrl: 'https://assets.wetalkapp.com/audio/rain.mp3',
        exampleSentence: 'I like walking in the rain.'
      },
      {
        word: 'Wind',
        urduMeaning: 'ہوا',
        audioUrl: 'https://assets.wetalkapp.com/audio/wind.mp3',
        exampleSentence: 'The wind is blowing strongly.'
      },
      {
        word: 'Cold',
        urduMeaning: 'ٹھنڈا',
        audioUrl: 'https://assets.wetalkapp.com/audio/cold.mp3',
        exampleSentence: 'Winter brings cold weather.'
      },
      {
        word: 'Hot',
        urduMeaning: 'گرم',
        audioUrl: 'https://assets.wetalkapp.com/audio/hot.mp3',
        exampleSentence: 'Summer is very hot here.'
      },
      {
        word: 'Season',
        urduMeaning: 'موسم',
        audioUrl: 'https://assets.wetalkapp.com/audio/season.mp3',
        exampleSentence: 'Spring is my favorite season.'
      }
    ],
    practice: {
      listenAndRepeat: [
        'Today is very hot and sunny.',
        'I love the sound of rain in spring.',
        'It is freezing cold in winter.'
      ],
      fillInTheBlanks: [
        {
          question: 'We go to the beach in ___.',
          choices: ['summer', 'winter', 'rain'],
          correctAnswer: 'summer'
        },
        {
          question: 'There is heavy ___ outside, take an umbrella.',
          choices: ['rain', 'sun', 'wind'],
          correctAnswer: 'rain'
        },
        {
          question: 'Spring is my favorite ___.',
          choices: ['season', 'sun', 'wind'],
          correctAnswer: 'season'
        }
      ],
      speakYourself: [
        'The wind is blowing strongly today.',
        'It is very cold during the winter season.',
        'The sun shines brightly in the afternoon.'
      ]
    },
    quiz: [
      {
        question: 'What do you carry when it is raining?',
        options: ['Umbrella', 'Book', 'Clock'],
        correctAnswer: 'Umbrella'
      },
      {
        question: 'Which season is the coldest of the year?',
        options: ['Winter', 'Summer', 'Spring'],
        correctAnswer: 'Winter'
      },
      {
        question: 'What body in the sky gives us heat and light?',
        options: ['Sun', 'Rain', 'Wind'],
        correctAnswer: 'Sun'
      },
      {
        question: "Complete the sentence: 'It is very ___ in summer.'",
        options: ['hot', 'cold', 'freezing'],
        correctAnswer: 'hot'
      },
      {
        question: 'How many seasons are there typically in a year?',
        options: ['4', '3', '5'],
        correctAnswer: '4'
      }
    ]
  }
];

const seedDB = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(mongoURI);
    console.log('Database connected successfully!');

    // Clear existing lessons
    console.log('Clearing existing lessons...');
    await Lesson.deleteMany({});
    console.log('Existing lessons cleared.');

    // Seed lessons
    console.log('Inserting 10 foundational lessons...');
    await Lesson.insertMany(lessons);
    console.log('Database seeded successfully with 10 foundational lessons!');

    mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
};

seedDB();
