export interface BiometricSession {
  id: string;
  title: string;
  description: string;
  mode: "guided" | "async"; // presencial vs asíncrono
  duration: number; // en minutos
  questions: Question[];
  participants: string[]; // Firebase IDs
  created_by: string;
  created_at: string;
  status: "draft" | "active" | "completed";
  project_id?: string;
}

export interface QuestionResponse {
  question_id: string;
  question_text: string;
  response_type: "open" | "scale" | "multiple_choice";
  response_value: string | number;
  response_text?: string;
  timestamp: string;
  biometric_data?: {
    baseline_before: any;
    active_reading: any;
    baseline_after: any;
  };
}

export interface SessionParticipant {
  firebase_id: string;
  name: string;
  avatar_url: string;
  status: "pending" | "in_progress" | "completed";
  joined_at?: string;
  completed_at?: string;
  responses: QuestionResponse[];
}