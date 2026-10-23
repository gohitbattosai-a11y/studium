// Hand-written mirrors of backend/models/schemas.py — keep in sync.

export type Priority = "bassa" | "media" | "alta";
export type NoticeTag = "avviso" | "urgente" | "info";

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
}

export interface MemberOut {
  nickname: string;
  joined_at: string;
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
