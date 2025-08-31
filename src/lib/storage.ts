import { Database, User, Course, Lesson, Flashcard, QuizQuestion } from '@/types';

// Storage keys
const STORAGE_KEY = 'flashr-yna-v2';
const USER_KEY = 'flashrUser';
const USERS_KEY = 'flashrUsers';
export const ADMIN_EMAIL = 'yassenhassouna39@gmail.com';

// Utility functions
export const generateId = (): string => 
  Math.random().toString(36).slice(2) + Date.now().toString(36);

export const nowISO = (): string => new Date().toISOString();

// Sample data initialization
const createSampleData = (): Database => ({
  courses: [
    {
      id: generateId(),
      title: 'مقدمة JavaScript',
      level: 'مبتدئ',
      tags: ['JS', 'Web', 'Basics'],
      description: 'تعرّف على أساسيات جافاسكربت عبر بطاقات سريعة وتمارين قصيرة.',
      cover: '',
      lessons: [
        {
          id: generateId(),
          title: 'المتغيرات والقيم',
          flashcards: [
            {
              id: generateId(),
              front: 'ما هو المتغير؟',
              back: 'مكان في الذاكرة نخزن فيه قيمة يمكن تغييرها لاحقًا.'
            },
            {
              id: generateId(),
              front: 'أنواع التعريف في JS؟',
              back: 'let (متغير قابل للتغيير)، const (ثابت)، var (نطاق دالة/أقدم).'
            }
          ],
          quiz: [
            {
              id: generateId(),
              q: 'أي كلمة لتعريف ثابت؟',
              choices: ['var', 'let', 'const'],
              answer: 2
            }
          ],
          code: "// جرّب\nconst name='YNA';\nconsole.log('Hello '+name);"
        },
        {
          id: generateId(),
          title: 'الدوال',
          flashcards: [
            {
              id: generateId(),
              front: 'ما هي الدالة؟',
              back: 'كتلة كود قابلة لإعادة الاستخدام تُستدعى باسمها.'
            }
          ],
          quiz: [
            {
              id: generateId(),
              q: 'أي صيغة صحيحة لتعريف دالة سهمية؟',
              choices: ['function f(){}', 'const f=()=>{}', 'def f(): pass'],
              answer: 1
            }
          ],
          code: "const add=(a,b)=>a+b;\nconsole.log(add(2,3));"
        }
      ]
    },
    {
      id: generateId(),
      title: 'React Fundamentals',
      level: 'متوسط',
      tags: ['React', 'Components', 'Hooks'],
      description: 'Learn React basics through interactive flashcards and practical examples.',
      cover: '',
      lessons: [
        {
          id: generateId(),
          title: 'Components & JSX',
          flashcards: [
            {
              id: generateId(),
              front: 'What is JSX?',
              back: 'A syntax extension for JavaScript that allows you to write HTML-like code in React.'
            },
            {
              id: generateId(),
              front: 'What is a React component?',
              back: 'A reusable piece of UI that can accept props and return JSX elements.'
            }
          ],
          quiz: [
            {
              id: generateId(),
              q: 'Which is the correct way to create a functional component?',
              choices: ['function MyComponent() {}', 'const MyComponent = () => {}', 'Both are correct'],
              answer: 2
            }
          ],
          code: "function Welcome(props) {\n  return <h1>Hello, {props.name}!</h1>;\n}\n\n// Usage\n<Welcome name=\"Sara\" />"
        }
      ]
    }
  ]
});

// Database operations
export const loadDatabase = (): Database => {
  if (typeof window === 'undefined') return createSampleData();
  
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSampleData();
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error loading database:', error);
    return createSampleData();
  }
};

export const saveDatabase = (db: Database): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (error) {
    console.error('Error saving database:', error);
  }
};

// User operations
export const loadCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Error loading current user:', error);
    return null;
  }
};

export const saveCurrentUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving current user:', error);
  }
};

export const removeCurrentUser = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error removing current user:', error);
  }
};

export const getUsers = (): User[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
};

export const saveUsers = (users: User[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

// Course operations
export const getCourse = (db: Database, courseId: string): Course | undefined => {
  return db.courses.find(c => c.id === courseId);
};

export const getLesson = (db: Database, courseId: string, lessonId: string): Lesson | undefined => {
  const course = getCourse(db, courseId);
  return course?.lessons.find(l => l.id === lessonId);
};

export const addCourse = (db: Database, courseData: Partial<Course>): Course => {
  const newCourse: Course = {
    id: generateId(),
    title: courseData.title || 'كورس جديد',
    level: courseData.level || 'مبتدئ',
    tags: courseData.tags || [],
    description: courseData.description || '',
    cover: courseData.cover || '',
    lessons: courseData.lessons || []
  };
  
  db.courses.unshift(newCourse);
  return newCourse;
};

export const removeCourse = (db: Database, courseId: string): void => {
  db.courses = db.courses.filter(c => c.id !== courseId);
};

export const updateCourse = (db: Database, courseId: string, updates: Partial<Course>): void => {
  const course = getCourse(db, courseId);
  if (course) {
    Object.assign(course, updates);
  }
};

// Lesson operations
export const addLesson = (db: Database, courseId: string, lessonData: Partial<Lesson>): Lesson => {
  const course = getCourse(db, courseId);
  if (!course) throw new Error('Course not found');
  
  const newLesson: Lesson = {
    id: generateId(),
    title: lessonData.title || 'درس جديد',
    flashcards: lessonData.flashcards || [],
    quiz: lessonData.quiz || [],
    code: lessonData.code || "// اكتب كودك هنا\nconsole.log('Ready!');"
  };
  
  course.lessons.unshift(newLesson);
  return newLesson;
};

export const removeLesson = (db: Database, courseId: string, lessonId: string): void => {
  const course = getCourse(db, courseId);
  if (course) {
    course.lessons = course.lessons.filter(l => l.id !== lessonId);
  }
};

// Flashcard operations
export const addFlashcard = (db: Database, courseId: string, lessonId: string, cardData: Partial<Flashcard>): Flashcard => {
  const lesson = getLesson(db, courseId, lessonId);
  if (!lesson) throw new Error('Lesson not found');
  
  const newCard: Flashcard = {
    id: generateId(),
    front: cardData.front || 'سؤال جديد',
    back: cardData.back || 'الإجابة'
  };
  
  lesson.flashcards.unshift(newCard);
  return newCard;
};

export const updateFlashcard = (db: Database, courseId: string, lessonId: string, cardId: string, updates: Partial<Flashcard>): void => {
  const lesson = getLesson(db, courseId, lessonId);
  if (lesson) {
    const card = lesson.flashcards.find(c => c.id === cardId);
    if (card) {
      Object.assign(card, updates);
    }
  }
};

export const removeFlashcard = (db: Database, courseId: string, lessonId: string, cardId: string): void => {
  const lesson = getLesson(db, courseId, lessonId);
  if (lesson) {
    lesson.flashcards = lesson.flashcards.filter(c => c.id !== cardId);
  }
};

// Quiz operations
export const addQuizQuestion = (db: Database, courseId: string, lessonId: string, questionData: Partial<QuizQuestion>): QuizQuestion => {
  const lesson = getLesson(db, courseId, lessonId);
  if (!lesson) throw new Error('Lesson not found');
  
  const newQuestion: QuizQuestion = {
    id: generateId(),
    q: questionData.q || 'سؤال اختيار من متعدد',
    choices: questionData.choices || ['A', 'B', 'C', ''],
    answer: questionData.answer || 0
  };
  
  lesson.quiz.unshift(newQuestion);
  return newQuestion;
};

export const updateQuizQuestion = (db: Database, courseId: string, lessonId: string, questionId: string, updates: Partial<QuizQuestion>): void => {
  const lesson = getLesson(db, courseId, lessonId);
  if (lesson) {
    const question = lesson.quiz.find(q => q.id === questionId);
    if (question) {
      Object.assign(question, updates);
    }
  }
};

export const removeQuizQuestion = (db: Database, courseId: string, lessonId: string, questionId: string): void => {
  const lesson = getLesson(db, courseId, lessonId);
  if (lesson) {
    lesson.quiz = lesson.quiz.filter(q => q.id !== questionId);
  }
};

// Import/Export operations
export const exportDatabase = (db: Database): void => {
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'flashr-cards-yna.json';
  a.click();
  URL.revokeObjectURL(url);
};

export const importDatabase = async (file: File): Promise<Database> => {
  const text = await file.text();
  const parsed = JSON.parse(text);
  
  if (!Array.isArray(parsed.courses)) {
    throw new Error('صيغة غير صالحة');
  }
  
  return parsed as Database;
};
