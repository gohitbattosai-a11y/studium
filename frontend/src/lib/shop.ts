
export type Priority = "bassa" | "media" | "alta";
export type NoticeTag = "avviso" | "urgente" | "info";
export type Role = "admin" | "member";
export type ItemKind = "decoration" | "background";

export interface JoinRequest {
  mode: "join" | "create";
  group_name: string;
  group_password: string;
  nickname: string;
  pin: string;
}

export interface Me {
  member_id: string;
  nickname: string;
  group_id: string;
  group_name: string;
  member_count: number;
  today: string;
  role: Role;
  participating: boolean;
}

export interface MemberOut {
  member_id: string;
  nickname: string;
  joined_at: string;
  role: Role;
  participating: boolean;
  decoration: string | null;
}

export interface HomeworkCreate {
  subject: string;
  due_date: string;
  description: string;
  priority: Priority;
}

export interface Homework {
  id: string;
  subject: string;
  due_date: string;
  description: string;
  priority: Priority;
  author: string;
  completed: boolean;
  completed_by: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface PollCreate {
  question: string;
  options: string[];
  anonymous: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[];
}

export interface Poll {
  id: string;
  question: string;
  anonymous: boolean;
  author: string;
  created_at: string;
  options: PollOption[];
  total_votes: number;
  my_vote: string | null;
}

export interface VoteRequest {
  option_id: string;
}

export interface FolderCreate {
  name: string;
}

export interface Folder {
  id: string;
  name: string;
  created_by: string;
  item_count: number;
}

export interface MaterialCreate {
  folder_id: string;
  title: string;
  kind: "link" | "note";
  url?: string | null;
  note?: string | null;
}

export interface Material {
  id: string;
  folder_id: string;
  title: string;
  kind: "link" | "note" | "file";
  url: string | null;
  note: string | null;
  file_id: string | null;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  author: string;
  created_at: string;
}

export interface NoticeCreate {
  title: string;
  body: string;
  tag: NoticeTag;
}

export interface Notice {
  id: string;
  title: string;
  body: string;
  tag: NoticeTag;
  author: string;
  created_at: string;
}

export interface ShopItem {
  id: string;
  kind: ItemKind;
  name: string;
  description: string;
  price: number;
  owned: boolean;
  equipped: boolean;
  available: boolean;
  window_label: string | null;
}

export interface ShopState {
  participating: boolean;
  role: Role;
  total_points: number;
  spent: number;
  balance: number;
  equipped_decoration: string | null;
  equipped_background: string | null;
  items: ShopItem[];
}

export interface LeaderboardEntry {
  rank: number;
  member_id: string;
  nickname: string;
  role: Role;
  total_points: number;
  is_me: boolean;
}

export interface PointEvent {
  id: string;
  member_id: string;
  nickname: string;
  kind: "grade" | "bonus";
  subject: string | null;
  grade: number | null;
  points: number;
  reason: string | null;
  created_by: string;
  created_at: string;
}

export interface GradeCreate {
  member_id: string;
  subject: string;
  grade: number;
}

export interface BonusCreate {
  member_id: string;
  points: number;
  reason: string;
}
