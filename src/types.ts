export type UserRole = 'student' | 'teacher';

export type QuestionType = 'multiple_choice' | 'true_false' | 'essay';

export type CognitiveLevel = 'biet' | 'hieu' | 'van_dung';

export type TopicId = 'topic_1' | 'topic_2' | 'topic_3' | 'topic_4';

export interface TopicInfo {
  id: TopicId;
  code: string;
  name: string;
  unit: string;
}

export interface TrueFalseStatement {
  id: 'a' | 'b' | 'c' | 'd';
  text: string;
  correctAnswer: boolean; // true = Đúng, false = Sai
}

export interface EssayRubricItem {
  id: string;
  description: string;
  maxScore: number;
}

export interface BaseQuestion {
  id: string;
  number: number;
  part: 1 | 2 | 3;
  type: QuestionType;
  topicId: TopicId;
  cognitiveLevel: CognitiveLevel;
  content: string;
  explanation?: string;
  maxScore: number;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice';
  options: {
    key: 'A' | 'B' | 'C' | 'D';
    text: string;
  }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true_false';
  statements: TrueFalseStatement[];
}

export interface EssayQuestion extends BaseQuestion {
  type: 'essay';
  rubric: EssayRubricItem[];
  sampleAnswer: string;
}

export type Question = MultipleChoiceQuestion | TrueFalseQuestion | EssayQuestion;

export interface ExamMatrixItem {
  topicId: TopicId;
  topicName: string;
  unit: string;
  mcq: { biet: number; hieu: number; vanDung: number };
  tf: { biet: number; hieu: number; vanDung: number };
  essay: { biet: number; hieu: number; vanDung: number };
  totalQuestions: number;
  totalScore: number;
}

export interface StudentAnswer {
  questionId: string;
  mcqAnswer?: 'A' | 'B' | 'C' | 'D';
  tfAnswers?: { [key in 'a' | 'b' | 'c' | 'd']?: boolean };
  essayAnswer?: string;
  essayScore?: number;
  essayFeedback?: string;
  isFlagged?: boolean;
}

export interface AntiCheatLog {
  id: string;
  timestamp: string;
  type: 'tab_switch' | 'fullscreen_exit' | 'copy_attempt' | 'window_blur';
  message: string;
}

export interface ExamSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  examId: string;
  startedAt: string;
  submittedAt: string;
  durationSeconds: number;
  answers: Record<string, StudentAnswer>;
  scorePart1: number; // Max 3.0
  scorePart2: number; // Max 4.0
  scorePart3: number; // Max 3.0
  totalScore: number; // Max 10.0
  status: 'submitted' | 'graded' | 'pending_essay';
  antiCheatLogs: AntiCheatLog[];
  violationCount: number;
}

export interface ExamInfo {
  id: string;
  title: string;
  subject: string;
  grade: string;
  curriculum: string;
  school: string;
  department: string;
  academicYear: string;
  durationMinutes: number;
  totalScore: number;
  documentRef: string;
}

export interface SavedExam {
  id: string;
  examInfo: ExamInfo;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
  isCurrent?: boolean;
  note?: string;
  tags?: string[];
}

export interface TeacherAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  roleTitle: string;
  school: string;
  createdAt?: string;
  updatedAt?: string;
  role?: 'admin' | 'teacher';
}

