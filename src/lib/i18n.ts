// Minimal in-house i18n. Spanish is the default; English is available via toggle.
// No external library — just a typed dictionary and a `t()` lookup with {var}
// interpolation.

export type Lang = "es" | "en";

export const LANGS: Lang[] = ["es", "en"];
export const DEFAULT_LANG: Lang = "es";

const dict = {
  es: {
    // generic
    "app.name": "Impostor Aula",
    "app.tagline": "Actividad interactiva para la clase",
    "common.loading": "Cargando…",
    "common.back": "Volver",
    "common.continue": "Continuar",
    "common.cancel": "Cancelar",
    "common.error": "Algo salió mal. Inténtalo de nuevo.",
    "lang.toggle": "EN",

    // landing
    "landing.createRoom": "Crear sala",
    "landing.createRoomDesc": "Para el profesor: crea una sala y proyecta el código.",
    "landing.joinRoom": "Unirse a una sala",
    "landing.joinRoomDesc": "Para estudiantes: ingresa el código de la sala.",
    "landing.codePlaceholder": "Código de sala",
    "landing.join": "Unirse",
    "landing.invalidCode": "El código debe tener 5 dígitos.",

    // create room
    "create.title": "Nueva sala",
    "create.creating": "Creando sala…",
    "create.create": "Crear sala",

    // teacher lobby
    "lobby.title": "Sala de espera",
    "lobby.scanToJoin": "Escanea para unirte",
    "lobby.roomCode": "Código de sala",
    "lobby.joinUrl": "Enlace para unirse",
    "lobby.participants": "Participantes",
    "lobby.noParticipants": "Aún no se ha unido nadie.",
    "lobby.concept": "Concepto educativo",
    "lobby.pickConcept": "Elige un concepto",
    "lobby.createConcept": "Crear concepto nuevo",
    "lobby.settings": "Configuración de la ronda",
    "lobby.start": "Comenzar ronda",
    "lobby.startNeedsConcept": "Elige un concepto primero.",
    "lobby.startNeedsParticipants": "Se necesitan al menos 2 participantes.",

    // settings labels
    "settings.impostorCount": "Cantidad de impostores",
    "settings.showCategoryToImpostor": "Mostrar categoría al impostor",
    "settings.showHintToImpostor": "Mostrar pista al impostor",
    "settings.requireVoteJustification": "Exigir justificación del voto",
    "settings.trackTabLeaving": "Avisar si salen de la pestaña",
    "settings.cardAutoHideSeconds": "Ocultar tarjeta tras (segundos, 0 = nunca)",

    // concept form
    "conceptForm.category": "Categoría",
    "conceptForm.titleField": "Título (concepto exacto)",
    "conceptForm.explanation": "Explicación",
    "conceptForm.impostorHint": "Pista para el impostor (opcional)",
    "conceptForm.teacherNotes": "Notas del profesor (opcional)",
    "conceptForm.difficulty": "Dificultad",
    "conceptForm.tags": "Etiquetas (separadas por comas)",
    "conceptForm.save": "Guardar concepto",
    "difficulty.basic": "Básico",
    "difficulty.intermediate": "Intermedio",
    "difficulty.advanced": "Avanzado",

    // teacher round control
    "round.cardRevealTitle": "Revelando tarjetas",
    "round.cardRevealDesc": "Los estudiantes están viendo su tarjeta en privado.",
    "round.seenCard": "Vieron su tarjeta",
    "round.discussionTitle": "Discusión",
    "round.discussionDesc": "Que la clase discuta. Cuando estén listos, pasa a la votación.",
    "round.toDiscussion": "Pasar a discusión",
    "round.toVoting": "Pasar a votación",
    "round.back": "Fase anterior",

    // away alerts
    "away.title": "Alertas de actividad",
    "away.none": "Sin alertas.",
    "away.left": "salió de la pestaña",
    "away.times": "veces",
    "away.reloaded": "recargó",

    // teacher voting
    "voting.title": "Votación",
    "voting.desc": "Los estudiantes están votando por el impostor.",
    "voting.votesIn": "Votos recibidos",
    "voting.reveal": "Revelar resultado",
    "voting.liveTally": "Conteo en vivo",

    // teacher results
    "results.title": "Resultados",
    "results.impostorWas": "El/los impostor(es) era(n)",
    "results.theConcept": "El concepto era",
    "results.explanation": "Explicación",
    "results.teacherNotes": "Notas del profesor",
    "results.voteCounts": "Conteo de votos",
    "results.caught": "¡La clase atrapó al impostor!",
    "results.notCaught": "El impostor se salvó.",
    "results.newRound": "Nueva ronda",

    // student join
    "join.title": "Unirse a la sala",
    "join.namePlaceholder": "Tu nombre o grupo",
    "join.join": "Unirse",
    "join.joining": "Uniéndose…",

    // student waiting
    "wait.title": "¡Estás dentro!",
    "wait.desc": "Espera a que el profesor comience la ronda.",
    "wait.joinedAs": "Te uniste como",

    // student card
    "card.tapToReveal": "Toca para ver tu tarjeta",
    "card.holdNote": "Mantenla privada. Se oculta si cambias de pestaña.",
    "card.youAre": "Eres",
    "card.role.student": "Estudiante",
    "card.role.impostor": "Impostor",
    "card.concept": "Tu concepto",
    "card.category": "Categoría",
    "card.hint": "Pista",
    "card.impostorMsg": "Eres el impostor. Disimula y descubre el concepto.",
    "card.hide": "Ocultar",
    "card.hiddenAuto": "Tarjeta oculta automáticamente.",
    "card.hiddenAway": "Tarjeta oculta porque saliste de la pestaña.",

    // student discussion
    "discuss.title": "Discusión",
    "discuss.desc": "Conversa con la clase. Toca para repasar tu tarjeta.",
    "discuss.peek": "Ver mi tarjeta",

    // student voting
    "svote.title": "¿Quién es el impostor?",
    "svote.pick": "Elige a una persona",
    "svote.justification": "Justificación",
    "svote.justificationPlaceholder": "¿Por qué crees que es el impostor?",
    "svote.submit": "Enviar voto",
    "svote.submitted": "¡Voto enviado!",
    "svote.changeVote": "Cambiar voto",

    // student results
    "sresults.title": "Resultados",
    "sresults.waiting": "Espera a que el profesor revele el resultado.",
  },
  en: {
    "app.name": "Impostor Aula",
    "app.tagline": "Interactive classroom activity",
    "common.loading": "Loading…",
    "common.back": "Back",
    "common.continue": "Continue",
    "common.cancel": "Cancel",
    "common.error": "Something went wrong. Try again.",
    "lang.toggle": "ES",

    "landing.createRoom": "Create room",
    "landing.createRoomDesc": "For the teacher: create a room and project the code.",
    "landing.joinRoom": "Join a room",
    "landing.joinRoomDesc": "For students: enter the room code.",
    "landing.codePlaceholder": "Room code",
    "landing.join": "Join",
    "landing.invalidCode": "The code must be 5 digits.",

    "create.title": "New room",
    "create.creating": "Creating room…",
    "create.create": "Create room",

    "lobby.title": "Lobby",
    "lobby.scanToJoin": "Scan to join",
    "lobby.roomCode": "Room code",
    "lobby.joinUrl": "Join link",
    "lobby.participants": "Participants",
    "lobby.noParticipants": "No one has joined yet.",
    "lobby.concept": "Educational concept",
    "lobby.pickConcept": "Pick a concept",
    "lobby.createConcept": "Create new concept",
    "lobby.settings": "Round settings",
    "lobby.start": "Start round",
    "lobby.startNeedsConcept": "Pick a concept first.",
    "lobby.startNeedsParticipants": "At least 2 participants are needed.",

    "settings.impostorCount": "Number of impostors",
    "settings.showCategoryToImpostor": "Show category to impostor",
    "settings.showHintToImpostor": "Show hint to impostor",
    "settings.requireVoteJustification": "Require vote justification",
    "settings.trackTabLeaving": "Alert when they leave the tab",
    "settings.cardAutoHideSeconds": "Auto-hide card after (seconds, 0 = never)",

    "conceptForm.category": "Category",
    "conceptForm.titleField": "Title (exact concept)",
    "conceptForm.explanation": "Explanation",
    "conceptForm.impostorHint": "Impostor hint (optional)",
    "conceptForm.teacherNotes": "Teacher notes (optional)",
    "conceptForm.difficulty": "Difficulty",
    "conceptForm.tags": "Tags (comma-separated)",
    "conceptForm.save": "Save concept",
    "difficulty.basic": "Basic",
    "difficulty.intermediate": "Intermediate",
    "difficulty.advanced": "Advanced",

    "round.cardRevealTitle": "Revealing cards",
    "round.cardRevealDesc": "Students are viewing their card privately.",
    "round.seenCard": "Seen their card",
    "round.discussionTitle": "Discussion",
    "round.discussionDesc": "Let the class discuss. When ready, move to voting.",
    "round.toDiscussion": "Move to discussion",
    "round.toVoting": "Move to voting",
    "round.back": "Previous phase",

    "away.title": "Activity alerts",
    "away.none": "No alerts.",
    "away.left": "left the tab",
    "away.times": "times",
    "away.reloaded": "reloaded",

    "voting.title": "Voting",
    "voting.desc": "Students are voting for the impostor.",
    "voting.votesIn": "Votes in",
    "voting.reveal": "Reveal result",
    "voting.liveTally": "Live tally",

    "results.title": "Results",
    "results.impostorWas": "The impostor(s) were",
    "results.theConcept": "The concept was",
    "results.explanation": "Explanation",
    "results.teacherNotes": "Teacher notes",
    "results.voteCounts": "Vote counts",
    "results.caught": "The class caught the impostor!",
    "results.notCaught": "The impostor got away.",
    "results.newRound": "New round",

    "join.title": "Join the room",
    "join.namePlaceholder": "Your name or group",
    "join.join": "Join",
    "join.joining": "Joining…",

    "wait.title": "You're in!",
    "wait.desc": "Wait for the teacher to start the round.",
    "wait.joinedAs": "You joined as",

    "card.tapToReveal": "Tap to see your card",
    "card.holdNote": "Keep it private. It hides if you switch tabs.",
    "card.youAre": "You are",
    "card.role.student": "Student",
    "card.role.impostor": "Impostor",
    "card.concept": "Your concept",
    "card.category": "Category",
    "card.hint": "Hint",
    "card.impostorMsg": "You are the impostor. Blend in and discover the concept.",
    "card.hide": "Hide",
    "card.hiddenAuto": "Card hidden automatically.",
    "card.hiddenAway": "Card hidden because you left the tab.",

    "discuss.title": "Discussion",
    "discuss.desc": "Talk with the class. Tap to review your card.",
    "discuss.peek": "View my card",

    "svote.title": "Who is the impostor?",
    "svote.pick": "Pick a person",
    "svote.justification": "Justification",
    "svote.justificationPlaceholder": "Why do you think they're the impostor?",
    "svote.submit": "Submit vote",
    "svote.submitted": "Vote submitted!",
    "svote.changeVote": "Change vote",

    "sresults.title": "Results",
    "sresults.waiting": "Wait for the teacher to reveal the result.",
  },
} as const;

export type MessageKey = keyof (typeof dict)["es"];

export function t(lang: Lang, key: MessageKey, vars?: Record<string, string | number>): string {
  const table = dict[lang] ?? dict[DEFAULT_LANG];
  let str: string = (table as Record<string, string>)[key] ?? (dict[DEFAULT_LANG] as Record<string, string>)[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return str;
}

export function isLang(value: string | null | undefined): value is Lang {
  return value === "es" || value === "en";
}
