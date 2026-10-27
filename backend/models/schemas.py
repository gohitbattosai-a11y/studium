from typing import Annotated, Any, Dict, List, Literal, Optional

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
    background: Optional[str] = None
    pet: Optional[str] = None


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
    kind: Literal["grade", "bonus", "game"]
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


GameTemplate = Literal["quiz", "sort", "abbina", "memory", "indovina", "ordina", "custom", "scratch"]
BlockKind = Literal["choice", "type", "number", "order", "match", "info"]
SceneId = Literal["none", "car", "rocket", "climb", "boss", "plant"]
GameStatus = Literal["draft", "pending", "published", "rejected"]


class QuizQuestion(BaseModel):
    prompt: Text(1, 160)
    options: List[Text(1, 80)] = Field(min_length=2, max_length=6)
    correct: int = Field(ge=0, le=5)


class PairItem(BaseModel):
    left: Text(1, 80)
    right: Text(1, 80)


class SortItem(BaseModel):
    text: Text(1, 80)
    category: int = Field(ge=0, le=5)


class Block(BaseModel):
    kind: BlockKind
    prompt: Text(0, 300) = ""
    value: int = Field(default=1, ge=0, le=10)
    explain: Text(0, 200) = ""
    options: List[Text(1, 80)] = Field(default_factory=list, max_length=6)
    correct: int = Field(default=0, ge=0, le=5)
    answer: Text(0, 80) = ""
    number: Optional[float] = None
    tolerance: float = Field(default=0, ge=0, le=1000)
    steps: List[Text(1, 80)] = Field(default_factory=list, max_length=8)
    pairs: List[PairItem] = Field(default_factory=list, max_length=6)


class Rules(BaseModel):
    lives: int = Field(default=0, ge=0, le=5)
    seconds: int = Field(default=0, ge=0, le=120)
    penalty: int = Field(default=0, ge=0, le=5)
    streak_bonus: bool = False
    shuffle: bool = True


class CustomContent(BaseModel):
    scene: SceneId = "none"
    rules: Rules = Field(default_factory=Rules)
    blocks: List[Block] = Field(default_factory=list, max_length=40)


class GameContent(BaseModel):
    questions: List[QuizQuestion] = Field(default_factory=list, max_length=30)
    pairs: List[PairItem] = Field(default_factory=list, max_length=30)
    categories: List[Text(1, 40)] = Field(default_factory=list, max_length=6)
    sort_items: List[SortItem] = Field(default_factory=list, max_length=30)
    steps: List[Text(1, 100)] = Field(default_factory=list, max_length=12)
    custom: Optional[CustomContent] = None
    scratch: Optional[Dict[str, Any]] = None


class GameInput(BaseModel):
    title: Text(2, 60)
    description: Text(0, 200) = ""
    template: GameTemplate
    content: GameContent


class GameSummary(BaseModel):
    id: str
    title: str
    description: str
    template: GameTemplate
    status: GameStatus
    author: str
    author_id: str
    plays: int
    item_count: int
    created_at: str
    review_note: Optional[str] = None
    is_mine: bool
    my_best: Optional[int] = None
    my_claimed: Optional[int] = None
    author_reward: Optional[int] = None


class GameOut(GameSummary):
    content: GameContent


class FinishRequest(BaseModel):
    score: int = Field(ge=0, le=100)


class FinishResult(BaseModel):
    round_percent: int
    best_percent: int
    points_available: int
    claimed_points: Optional[int] = None
    can_claim: bool
    reason: Optional[Literal["non_participating", "author", "too_low"]] = None
    next_percent: Optional[int] = None
    next_points: Optional[int] = None


class ReviewRequest(BaseModel):
    approve: bool
    note: Text(0, 200) = ""


class GradeRow(BaseModel):
    grade: int
    points: int


class TierRow(BaseModel):
    min_percent: int
    points: int


class RewardRow(BaseModel):
    template: str
    points: int


class PointsTable(BaseModel):
    grades: List[GradeRow]
    game_tiers: List[TierRow]
    author_rewards: List[RewardRow] = Field(default_factory=list)


Rarity = Literal["comune", "non_comune", "raro", "epico", "leggendario", "mitico"]


class SiteStatus(BaseModel):
    updating: bool
    update_type: str
    message: str
    features: dict[str, str]


class BoxOdd(BaseModel):
    rarity: Rarity
    percent: float


class BoxInfo(BaseModel):
    id: str
    name: str
    description: str
    price: int
    odds: List[BoxOdd]
    guaranteed_in: int


class PetInfo(BaseModel):
    id: str
    name: str
    rarity: Rarity
    owned: bool
    copies: int
    active: bool


class PetsState(BaseModel):
    participating: bool
    balance: int
    active_pet: Optional[str] = None
    boxes: List[BoxInfo]
    pets: List[PetInfo]


class RollRequest(BaseModel):
    box_id: str


class ActivePetRequest(BaseModel):
    pet_id: Optional[str] = None


class RollResult(BaseModel):
    box_id: str
    pet_id: str
    name: str
    rarity: Rarity
    is_new: bool
    copies: int
    refund: int
    cost: int
    balance: int
    guaranteed_in: int
