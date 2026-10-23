"""Pydantic models — mirrored by hand in frontend/src/lib/types.ts. Keep both in sync."""

from typing import Annotated, List, Literal, Optional

from pydantic import BaseModel, Field, StringConstraints


def Text(min_len: int, max_len: int):
    return Annotated[str, StringConstraints(strip_whitespace=True, min_length=min_len, max_length=max_len)]


Priority = Literal["bassa", "media", "alta"]
NoticeTag = Literal["avviso", "urgente", "info"]


# ---- auth ----
class JoinRequest(BaseModel):
    mode: Literal["join", "create"]
    group_name: Text(2, 60)
    group_password: Text(3, 100)
    nickname: Text(2, 30)
    pin: Annotated[str, StringConstraints(pattern=r"^\d{4,6}$")]


class Me(BaseModel):
    member_id: str
    nickname: str
    group_id: str
    group_name: str
    member_count: int
    today: str  # YYYY-MM-DD, Europe/Rome


class MemberOut(BaseModel):
    nickname: str
    joined_at: str


# ---- homework ----
class HomeworkCreate(BaseModel):
    subject: Text(1, 40)
    due_date: Annotated[str, StringConstraints(pattern=r"^\d{4}-\d{2}-\d{2}$")]
    description: Text(1, 1000)
    priority: Priority


class Homework(BaseModel):
    id: str
    subject: str
    due_date: str
    description: str
    priority: Priority
    author: str
    completed: bool
    completed_by: Optional[str] = None
    completed_at: Optional[str] = None
    created_at: str


# ---- polls ----
class PollCreate(BaseModel):
    question: Text(3, 200)
    options: List[Text(1, 100)] = Field(min_length=2, max_length=8)
    anonymous: bool


class PollOption(BaseModel):
    id: str
    text: str
    votes: int
    voters: List[str]  # empty when the poll is anonymous


class Poll(BaseModel):
    id: str
    question: str
    anonymous: bool
    author: str
    created_at: str
    options: List[PollOption]
    total_votes: int
    my_vote: Optional[str] = None


class VoteRequest(BaseModel):
    option_id: str


# ---- materials ----
class FolderCreate(BaseModel):
    name: Text(1, 40)


class Folder(BaseModel):
    id: str
    name: str
    created_by: str
    item_count: int


class MaterialCreate(BaseModel):
    folder_id: str
    title: Text(1, 120)
    kind: Literal["link", "note"]
    url: Optional[str] = None
    note: Optional[str] = None


class Material(BaseModel):
    id: str
    folder_id: str
    title: str
    kind: Literal["link", "note", "file"]
    url: Optional[str] = None
    note: Optional[str] = None
    file_id: Optional[str] = None
    file_name: Optional[str] = None
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    author: str
    created_at: str


# ---- notices ----
class NoticeCreate(BaseModel):
    title: Text(2, 120)
    body: Text(1, 2000)
    tag: NoticeTag


class Notice(BaseModel):
    id: str
    title: str
    body: str
    tag: NoticeTag
    author: str
    created_at: str
