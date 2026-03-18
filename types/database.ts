export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Additional tables will be added as we build them
    };
  };
}

export type GoalCategory =
  | "financial"
  | "career"
  | "health"
  | "education"
  | "personal"
  | "travel"
  | "relationships"
  | "environment";

export type GoalStatus = "active" | "completed" | "paused" | "archived";

export type GoalPriority = "low" | "medium" | "high";

export type HabitFrequency = "daily" | "weekly";
