from dataclasses import dataclass
from typing import Any, Dict, Protocol


@dataclass
class ChatReply:
    content: str
    metadata: Dict[str, Any]


class ChatResponder(Protocol):
    async def reply(self, *, prompt: str, case_title: str) -> ChatReply: ...
