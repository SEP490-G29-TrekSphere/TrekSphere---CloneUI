import type { LucideIcon } from 'lucide-react';

export type PreviewView = 'outsider-detail' | 'discovery' | 'applications' | 'workspace' | 'trip';
export type WorkspaceSubTab =
  | 'overview'
  | 'itinerary'
  | 'budget'
  | 'members'
  | 'equipment'
  | 'succession'
  | 'album';

export interface PreviewNavItem {
  id: PreviewView;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}

export interface LifecycleStep {
  label: string;
  desc: string;
  state: string;
  defaultView: PreviewView;
}

export interface GroupRecommendation {
  id: string;
  title: string;
  location: string;
  date: string;
  difficulty: string;
  members: string;
  match: number;
  reasons: string[];
  matchBreakdown: { label: string; score: number; detail: string }[];
  leader: { name: string; avatar: string; trustScore: number; trips: number };
  featured: boolean;
}

export interface ApplicationRow {
  id: string;
  group: string;
  applicantName: string;
  avatar: string;
  status: string;
  tone: 'offer' | 'pending' | 'waitlist';
  meta: string;
  action: string;
  experience: string;
  trustScore: number;
  tripsCount: number;
  answer: string;
}
