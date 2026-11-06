export type Difficulty = "Easy" | "Medium" | "Hard";
export type DifficultyFilter = Difficulty | "Mixed";
export type AnswerOption = "A" | "B" | "C" | "D";
export type SessionStatus = "in_progress" | "completed";

export const ANSWER_OPTIONS: AnswerOption[] = ["A", "B", "C", "D"];
export const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

export interface Health {
  status: "ok" | "degraded";
  database: string;
  environment: string;
}

export interface Subject {
  code: string;
  name: string;
  category: string;
  total_questions: number;
  difficulty_counts: Partial<Record<Difficulty, number>>;
}

export interface SubjectCategory {
  category: string;
  subjects: Subject[];
}

export interface SubjectList {
  total: number;
  categories: SubjectCategory[];
}

export interface QuestionPublic {
  id: number;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  question: string;
  options: string[];
}

export interface InterviewQuestion extends QuestionPublic {
  position: number;
  selected_answer: AnswerOption | null;
}

export interface InterviewCreate {
  student_name: string;
  subjects: string[];
  num_questions: number;
  difficulty: DifficultyFilter;
}

export interface InterviewSession {
  id: string;
  student_name: string;
  selected_subjects: string[];
  difficulty: DifficultyFilter;
  total_questions: number;
  status: SessionStatus;
  created_at: string;
  submitted_at: string | null;
  questions: InterviewQuestion[];
}

export interface AnswerIn {
  question_id: number;
  selected_answer: AnswerOption;
}

export interface SubjectBreakdown {
  subject: string;
  total: number;
  correct: number;
  percentage: number;
}

export interface InterviewResult {
  session_id: string;
  student_name: string;
  selected_subjects: string[];
  difficulty: DifficultyFilter;
  total_questions: number;
  attempted: number;
  correct_answers: number;
  incorrect_answers: number;
  score: number;
  score_display: string;
  percentage: number;
  performance_level: string;
  feedback: string;
  subject_breakdown: SubjectBreakdown[];
  submitted_at: string;
}

export interface ReviewItem {
  position: number;
  question_id: number;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  question: string;
  options: string[];
  selected_answer: AnswerOption | null;
  correct_answer: AnswerOption;
  is_correct: boolean;
  explanation: string;
}

export interface InterviewReview {
  session_id: string;
  student_name: string;
  total_questions: number;
  correct_answers: number;
  percentage: number;
  items: ReviewItem[];
}
