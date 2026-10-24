from typing import Annotated, List, Literal, Optional

from pydantic import BaseModel, Field, StringConstraints


def Text(min_len: int, max_len: int):
    return Annotated[str, StringConstraints(strip_whitespace=True, min_length=min_len, max_length=max_len)]


Priority = Literal["bassa", "media", "alta"]
NoticeTag = Literal["avviso", "urgente", "info"]
Role = Literal["admin", "member"]
ItemKind = Literal["decoration", "background"]


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
    today: str
    role: Role = "member"
    participating: bool = False


class MemberOut(BaseModel):
    member_id: str
    nickname: str
    joined_at: str
    role: Role = "member"
    participating: bool = False
    decoration: Optional[str] = None


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


class PollCreate(BaseModel):
    question: Text(3, 200)
    options: List[Text(1, 100)] = Field(min_length=2, max_length=8)
    anonymous: bool


class PollOption(BaseModel):
    id: str
    text: str
    votes: int
    voters: List[str]


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


class ShopItem(BaseModel):
    id: str
    kind: ItemKind
    name: str
    description: str
    price: int
    owned: bool
    equipped: bool
    available: bool
    window_label: Optional[str] = None


class ShopState(BaseModel):
    participating: bool
    role: Role
    total_points: int
    spent: int
    balance: int
    equipped_decoration: Optional[str] = None
    equipped_background: Optional[str] = None
    items: List[ShopItem]


class ParticipationRequest(BaseModel):
    participating: bool


class BuyRequest(BaseModel):
    item_id: str


class EquipRequest(BaseModel):
    kind: ItemKind
    item_id: Optional[str] = None


class LeaderboardEntry(BaseModel):
    rank: int
    member_id: str
    nickname: str
    role: Role
    total_points: int
    is_me: bool


class PointEvent(BaseModel):
    id: str
    member_id: str
    nickname: str
    kind: Literal["grade", "bonus"]
    subject: Optional[str] = None
    grade: Optional[float] = None
    points: int
    reason: Optional[str] = None
    created_by: str
    created_at: str


class GradeCreate(BaseModel):
    member_id: str
    subject: Text(1, 40)
    grade: float = Field(ge=1, le=10)


class BonusCreate(BaseModel):
    member_id: str
    points: int = Field(ge=-50, le=50)
    reason: Text(1, 80)


class RoleUpdate(BaseModel):
    role: Role
