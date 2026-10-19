from typing import Any, List

from pydantic import Field
from pydantic.fields import FieldInfo
from pydantic_settings import BaseSettings, DotEnvSettingsSource, EnvSettingsSource


class _CommaSeparatedListSource:
    """Mixin: convierte vars de entorno separadas por coma en list[str].

    pydantic-settings decodifica los campos complejos como JSON; sin este
    mixin, un valor tipo `CORS_ORIGINS=http://a,http://b` fallaría.
    """

    def prepare_field_value(
        self, field_name: str, field: FieldInfo, value: Any, value_is_complex: bool
    ) -> Any:
        if field_name == "CORS_ORIGINS" and isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return super().prepare_field_value(field_name, field, value, value_is_complex)


class _CommaEnvSource(_CommaSeparatedListSource, EnvSettingsSource):
    pass


class _CommaDotEnvSource(_CommaSeparatedListSource, DotEnvSettingsSource):
    pass


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://user:password@db:5432/jak_db"
    SECRET_KEY: str = "your-super-secret-key-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    N8N_WEBHOOK_URL: str = "http://n8n:5678/webhook/"
    # Lista de orígenes CORS; se admite coma-separado en la variable de entorno.
    CORS_ORIGINS: List[str] = Field(default=["*"])

    class Config:
        env_file = ".env"

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls,
        init_settings,
        env_settings,
        dotenv_settings,
        file_secret_settings,
    ):
        sources = [init_settings, _CommaEnvSource(settings_cls)]
        if dotenv_settings is not None:
            sources.append(
                _CommaDotEnvSource(
                    settings_cls,
                    env_file=dotenv_settings.env_file,
                    env_file_encoding=dotenv_settings.env_file_encoding,
                )
            )
        sources.append(file_secret_settings)
        return tuple(sources)

settings = Settings()
