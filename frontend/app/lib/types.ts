export type SessionStatus = "DISCONNECTED" | "CONNECTING" | "CONNECTED";

export interface LoggedEvent {
  id: number;
  direction: "client" | "server";
  expanded: boolean;
  timestamp: string;
  eventName: string;
  eventData: Record<string, any>; // can have arbitrary objects logged
}

export interface TranscriptItem {
  itemId: string;
  type: "MESSAGE" | "BREADCRUMB";
  role?: "user" | "assistant";
  title?: string;
  data?: Record<string, any>;
  expanded: boolean;
  timestamp: string;
  createdAtMs: number;
  status: "IN_PROGRESS" | "DONE";
  isHidden: boolean;
}

export interface Topic {
  topicName: string;
  subTopics: Subtopic[];
}

export interface Subtopic {
  subtopicName: string;
  subtopicStatus: 'not_started' | 'in_progress' | 'completed';
  subtopicEstimatedGrade: 'A*' | 'A' | 'B' | 'C' | 'D' | 'E' | 'U';
  topicName: string; // Add this line
}