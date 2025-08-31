// Core data interfaces for the flashcard learning app

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface QuizQuestion {
  id: string;
  q: string;
  choices: string[];
  answer: number; // index of correct answer
}

export interface Lesson {
  id: string;
  title: string;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  code: string;
}

export interface Course {
  id: string;
  title: string;
  level: string;
  tags: string[];
  description: string;
  cover: string;
  lessons: Lesson[];
}

export interface Database {
  courses: Course[];
}

export interface AuthState {
  currentUser: User | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

export interface StudySession {
  courseId: string;
  lessonId: string;
  cardIndex: number;
  flipped: boolean;
  score: number;
  completed: boolean;
}

export type Role = 'learner' | 'dev';

export type SubTab = 'cards' | 'quiz' | 'code';

// Utility types
export type CreateCourseData = Omit<Course, 'id' | 'lessons'>;
export type CreateLessonData = Omit<Lesson, 'id' | 'flashcards' | 'quiz' | 'code'>;
export type CreateFlashcardData = Omit<Flashcard, 'id'>;
export type CreateQuizQuestionData = Omit<QuizQuestion, 'id'>;
