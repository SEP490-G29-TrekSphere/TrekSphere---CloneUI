import type { LucideIcon } from 'lucide-react';

export type PreviewView = 'outsider-detail' | 'discovery' | 'applications' | 'workspace' | 'trip';

export type WorkspaceSubTab =
  | 'overview'
  | 'itinerary'
  | 'budget'
  | 'members'
  | 'equipment'
  | 'succession';

export type ReviewActor =
  | 'GUEST'
  | 'APPLICANT'
  | 'WAITLISTED_APPLICANT'
  | 'MEMBER'
  | 'TREASURER'
  | 'CO_LEADER'
  | 'LEADER';

export type ReviewNetwork = 'ONLINE' | 'OFFLINE' | 'UNSTABLE';

export type ReviewLocationPermission = 'PROMPT' | 'GRANTED' | 'DENIED' | 'UNAVAILABLE';

export type GroupLifecycleState =
  | 'DRAFT'
  | 'RECRUITING'
  | 'FULL'
  | 'READY'
  | 'IN_PROGRESS'
  | 'SETTLING'
  | 'COMPLETED'
  | 'ARCHIVED';

export type ApplicationState =
  | 'APPLIED'
  | 'WAITLISTED'
  | 'SLOT_OFFERED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'OFFER_DECLINED'
  | 'OFFER_EXPIRED';

export interface GroupMatchingReviewScenario {
  id: string;
  name: string;
  description: string;
  actor: ReviewActor;
  groupState: GroupLifecycleState;
  applicationState?: ApplicationState;
  network: ReviewNetwork;
  locationPermission: ReviewLocationPermission;
  activeView: PreviewView;
  activeWorkspaceTab?: WorkspaceSubTab;
}

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
  lifecycleKey: GroupLifecycleState;
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
  lifecycleState?: GroupLifecycleState;
}

export interface ApplicationRow {
  id: string;
  group: string;
  applicantName: string;
  avatar: string;
  status: string;
  appState: ApplicationState;
  tone: 'offer' | 'pending' | 'waitlist' | 'accepted' | 'rejected';
  meta: string;
  action: string;
  experience: string;
  trustScore: number;
  tripsCount: number;
  answer: string;
  /** Đánh dấu đơn này thuộc về actor đang review dưới góc nhìn Applicant/Waitlisted (self-service). */
  isSelf?: boolean;
}
