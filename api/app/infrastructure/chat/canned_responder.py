"""Respuesta automática del chat, sin red ni estado.

Implementación provisional del puerto `ChatResponder`. Cuando n8n exista,
`N8nResponder` reemplazará esta clase detrás del mismo puerto: el contrato HTTP
y la forma del `metadata` no cambian.
"""
import hashlib
from typing import List

from app.application.ports.chat_responder import ChatReply, ChatResponder

_SEGMENTS = (
    "PYMES",
    "startups tempranas",
    "comercios locales",
    "profesionales independientes",
    "cooperativas",
)

_RISKS = (
    "Logística inversa",
    "Costo de adquisición alto",
    "Regulación pendiente",
    "Competencia consolidada",
    "Dependencia de un único canal",
)

_NEXT_STEPS = (
    "Validar con 10 clientes potenciales",
    "Entrevistar a clientes actuales del nicho",
    "Construir un prototipo mínimo",
    "Estimar el costo de adquisición",
    "Definir una métrica de éxito",
)


def _scale(value: int) -> int:
    """Lleva un byte (0-255) a la escala 1-5."""
    return 1 + (value * 4) // 255


def _pick(options: tuple[str, ...], seed_byte: int, count: int) -> List[str]:
    """Elige `count` opciones sin repetir, de forma estable entre procesos."""
    start = seed_byte % len(options)
    step = 1 + (seed_byte % (len(options) - 1))
    return [options[(start + i * step) % len(options)] for i in range(count)]


class CannedResponder(ChatResponder):
    """Genera una respuesta determinista a partir del prompt y el título."""

    async def reply(self, *, prompt: str, case_title: str) -> ChatReply:
        # sha256 y no `hash()`: el hash de Python cambia entre procesos y la
        # respuesta dejaría de ser reproducible.
        seed = hashlib.sha256(f"{case_title}\n{prompt}".encode("utf-8")).digest()

        urgency = _scale(seed[0])
        frequency = _scale(seed[1])
        severity = _scale(seed[2])
        willingness_to_pay = _scale(seed[3])
        total = urgency + frequency + severity + willingness_to_pay  # 4..20
        overall_score = int(round(total / 20 * 100))  # 20..100

        risks = _pick(_RISKS, seed[4], 2)
        next_steps = _pick(_NEXT_STEPS, seed[5], 3)
        segment = _SEGMENTS[seed[6] % len(_SEGMENTS)]
        confidence = round(0.5 + (seed[7] / 255) * 0.5, 2)

        content = (
            f'Analicé "{case_title}". Puntaje preliminar de oportunidad: '
            f"{overall_score}/100 (urgencia {urgency}, frecuencia {frequency}, "
            f"severidad {severity}). Antes de invertir, valida los riesgos "
            f"principales con clientes reales."
        )

        metadata = {
            "analysis": {
                "targetSegment": segment,
                "urgency": urgency,
                "frequency": frequency,
                "severity": severity,
                "willingnessToPay": willingness_to_pay,
                "mainRisks": risks,
                "overallScore": overall_score,
            },
            "ideas": [],
            "nextSteps": next_steps,
            "confidence": confidence,
        }

        return ChatReply(content=content, metadata=metadata)
