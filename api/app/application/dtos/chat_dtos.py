from pydantic import BaseModel, Field


class SendMessageDTO(BaseModel):
    # El caso y el propietario salen de la ruta y del token, no del body.
    content: str = Field(..., min_length=1, max_length=4000)
