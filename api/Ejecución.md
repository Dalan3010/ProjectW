# Especificación de Requisitos de Software
# App de Descubrimiento y Validación de Ideas de Negocio con n8n

## 1. Propósito
Definir los requisitos funcionales y no funcionales de una aplicación que ayuda a emprendedores a descubrir problemas, entenderlos, validar oportunidades y generar ideas de negocio, usando n8n como motor de orquestación del proceso.

## 2. Alcance
El sistema permitirá:
- Capturar ideas, problemas o molestias.
- Guiar al usuario para aterrizar el problema real.
- Analizar la oportunidad de negocio.
- Proponer soluciones e ideas de negocio.
- Recuperar contexto desde una base de conocimiento con RAG.
- Orquestar el proceso con n8n.
- Guardar casos, versiones, resultados y feedback.

No incluye:
- ERP.
- Contabilidad.
- Gestión avanzada de startups en fases de escalamiento.
- Marketplace de inversión.

## 3. Definiciones
- **IdeaCase**: caso principal que agrupa una idea, problema u oportunidad.
- **IdeaVersion**: versión refinada del caso.
- **OpportunityAssessment**: evaluación del problema y del potencial de negocio.
- **Recommendation**: resultado generado por el sistema.
- **KnowledgeSource**: fuente usada por RAG.
- **WorkflowRun**: ejecución del flujo en n8n.
- **Feedback**: valoración del usuario sobre la recomendación.

## 4. Descripción general del sistema
La aplicación funcionará como un asistente de validación inicial de negocios. El usuario enviará una idea o problema, el sistema lo analizará, recuperará contexto relevante, generará hipótesis y devolverá recomendaciones. n8n coordinará la secuencia de pasos entre entrada, IA, RAG, persistencia y notificación. [web:123][web:137][web:141]

## 5. Actores
- **Emprendedor**: ingresa el problema o idea y recibe recomendaciones.
- **Mentor / Analista**: revisa casos y aporta feedback.
- **Administrador**: configura flujos, fuentes y permisos.
- **Sistema n8n**: ejecuta y orquesta el proceso.

## 6. Requisitos funcionales

### 6.1 Captura de ideas y problemas
FR-001. El sistema debe permitir crear un caso nuevo a partir de una idea, problema, dolor u oportunidad observada.

FR-002. El sistema debe permitir guardar múltiples versiones de un mismo caso.

FR-003. El sistema debe guiar al usuario con preguntas para identificar problema, usuario afectado, frecuencia, urgencia, contexto y evidencia.

FR-004. El sistema debe clasificar el caso en categorías como dolor, ineficiencia, necesidad no cubierta, oportunidad, tendencia o hipótesis.

### 6.2 Validación de oportunidad
FR-005. El sistema debe evaluar frecuencia, severidad, urgencia y disposición a pagar.

FR-006. El sistema debe estimar el segmento de cliente más afectado.

FR-007. El sistema debe proponer un nivel preliminar de atracción de mercado.

FR-008. El sistema debe identificar los riesgos principales de la oportunidad.

FR-009. El sistema debe generar una recomendación preliminar de viabilidad: baja, media o alta.

### 6.3 Generación de ideas de negocio
FR-010. El sistema debe proponer al menos dos o tres enfoques de solución para el problema detectado.

FR-011. El sistema debe ordenar las ideas por viabilidad, costo de entrada, velocidad de implementación y potencial de negocio.

FR-012. El sistema debe sugerir el modelo de ingresos más probable o más adecuado.

FR-013. El sistema debe recomendar el siguiente experimento de validación.

### 6.4 Orquestación con n8n
FR-014. El sistema debe recibir solicitudes mediante webhook, formulario o API.

FR-015. El sistema debe enrutar el caso según su tipo y nivel de madurez.

FR-016. El sistema debe conectar nodos de limpieza, IA, reglas, RAG, persistencia y notificación.

FR-017. El sistema debe permitir reintentos y rutas alternativas si un nodo falla.

FR-018. El sistema debe permitir aprobación humana antes de emitir recomendaciones críticas.

FR-019. El sistema debe poder ejecutar flujos manualmente, por evento o por programación.

### 6.5 RAG y conocimiento
FR-020. El sistema debe recuperar documentos, casos históricos, plantillas y criterios relevantes para el caso actual.

FR-021. El sistema debe usar la evidencia recuperada para justificar recomendaciones.

FR-022. El sistema debe guardar el contexto recuperado para auditoría y trazabilidad.

FR-023. El sistema debe versionar las fuentes de conocimiento usadas.

### 6.6 Resultados y seguimiento
FR-024. El sistema debe generar un reporte estructurado con problema, hipótesis, solución, modelo de negocio, riesgos y siguientes pasos.

FR-025. El sistema debe permitir exportar el reporte en Markdown, PDF o formato web.

FR-026. El sistema debe notificar al usuario por correo, Telegram, WhatsApp o canal configurable.

FR-027. El sistema debe permitir seguimiento del caso y reanálisis posterior.

### 6.7 Aprendizaje y datos
FR-028. El sistema debe almacenar cada caso con sus respuestas, resultados y feedback.

FR-029. El sistema debe permitir registrar si una recomendación fue útil o no.

FR-030. El sistema debe usar esos datos para mejorar futuras validaciones y recomendaciones.

FR-031. El sistema debe permitir importar datos externos desde CSV, Excel, Sheets o bases de datos.

## 7. Requisitos no funcionales

### 7.1 Usabilidad
NF-001. La interfaz debe ser simple y guiada, orientada a usuarios no técnicos.

NF-002. El flujo debe hacer preguntas progresivas para evitar formularios largos en una sola pantalla.

NF-003. Las respuestas deben mostrarse en lenguaje claro, sin jerga técnica innecesaria.

### 7.2 Rendimiento
NF-004. El sistema debe responder en un tiempo razonable para el MVP, idealmente bajo 10 segundos para análisis complejos y bajo 3 segundos para consultas simples.

NF-005. Los flujos n8n deben minimizar pasos innecesarios y llamadas redundantes.

### 7.3 Confiabilidad
NF-006. Los flujos deben tener manejo de errores, reintentos y logs de ejecución.

NF-007. El sistema debe permitir recuperación ante fallos sin perder el caso ni su contexto.

NF-008. El resultado generado debe incluir nivel de confianza.

### 7.4 Seguridad
NF-009. El sistema debe autenticar usuarios y proteger webhooks y APIs.

NF-010. Los datos sensibles deben ser cifrados en tránsito y protegidos en almacenamiento.

NF-011. El acceso a flujos, logs y fuentes de conocimiento debe depender del rol.

NF-012. El sistema debe poder anonimizar datos antes de enviarlos a IA o RAG.

### 7.5 Escalabilidad
NF-013. La arquitectura debe permitir agregar nuevos flujos sin reescribir el sistema completo.

NF-014. El sistema debe soportar múltiples fuentes de entrada y múltiples salidas.

NF-015. El almacenamiento debe poder crecer con el número de casos y eventos.

### 7.6 Mantenibilidad
NF-016. Los flujos n8n deben estar documentados y nombrados de forma consistente.

NF-017. Las fuentes de conocimiento y prompts deben versionarse.

NF-018. Debe existir separación entre lógica de orquestación, lógica de IA y persistencia.

### 7.7 Trazabilidad
NF-019. Cada recomendación debe poder trazarse hasta los datos, reglas y documentos usados.

NF-020. Cada ejecución del flujo debe guardar una huella de auditoría.

NF-021. El sistema debe conservar versiones del caso a lo largo del tiempo.

### 7.8 Calidad del conocimiento
NF-022. El sistema debe evitar duplicados en la base de conocimiento.

NF-023. El sistema debe marcar fuentes con fecha, autor y confiabilidad.

NF-024. El sistema debe preferir evidencia reciente y pertinente cuando sea posible.

## 8. Requisitos de arquitectura
- n8n actuará como orquestador central.
- Un servicio de IA se encargará de clasificación, resumen y generación de hipótesis.
- Un repositorio de conocimiento servirá para RAG.
- Una base de datos guardará casos, respuestas y feedback.
- Un front simple permitirá capturar ideas, revisar resultados y continuar el caso.

## 9. Requisitos de datos
- Cada caso debe tener identificador único.
- Cada versión debe quedar asociada al caso principal.
- Cada evaluación debe guardar score, explicación y fecha.
- Cada fuente recuperada debe quedar registrada.
- Cada feedback del usuario debe almacenarse para mejora continua.

## 10. Entidades mínimas
- **User**
- **IdeaCase**
- **IdeaVersion**
- **OpportunityAssessment**
- **Recommendation**
- **KnowledgeSource**
- **WorkflowRun**
- **Feedback**

## 11. Criterio de éxito del MVP
- El usuario puede describir un problema en menos de 5 minutos.
- El sistema entrega una hipótesis clara de problema y solución.
- El sistema propone al menos una idea de negocio razonable.
- El usuario recibe recomendaciones accionables con evidencia.
- El sistema guarda el caso para reuso y mejora futura.

## 12. Riesgos del proyecto
- Entradas muy ambiguas de los usuarios.
- Respuestas de IA poco consistentes sin buen contexto.
- Flujos n8n demasiado complejos sin estandarización.
- Falta de datos reales para validar recomendaciones.
- Acumulación de conocimiento duplicado u obsoleto.

## 13. Criterios de verificación
- Verificar que cada requisito funcional tenga una prueba asociada.
- Verificar que las rutas de error estén cubiertas.
- Verificar que los flujos n8n sean reproducibles.
- Verificar que las recomendaciones incluyan evidencia.
- Verificar que las fuentes de conocimiento estén versionadas.

