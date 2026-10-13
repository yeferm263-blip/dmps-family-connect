/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  CornerDownLeft,
  ExternalLink,
  Eye,
  FileEdit,
  FileText,
  History,
  Loader2,
  Mail,
  MapPin,
  Megaphone,
  Mic,
  MicOff,
  Phone,
  Radio,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trash2,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CommandCenterOverview,
  CommandParsedResult,
  executeCommandAction,
  getCommandCenterOverview,
  processCommandIntent,
} from "@/lib/command-center.functions";
import { useVoiceAssistant } from "@/hooks/use-voice-assistant";
import { useSchool } from "@/lib/school";

export const Route = createFileRoute("/admin/comando")({
  head: () => ({
    meta: [
      { title: "Centro Inteligente de Mando con Voz — DMPS Admin" },
      {
        name: "description",
        content: "Consola de control, búsqueda y comando por voz para DMPS Family Connect.",
      },
    ],
  }),
  component: CommandCenterPage,
});

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  timestamp: string;
  text?: string;
  isVoiceInput?: boolean;
  parsedResult?: CommandParsedResult;
}

export function CommandCenterPage() {
  const qc = useQueryClient();
  const { selectedSchool } = useSchool();
  const overviewFn = useServerFn(getCommandCenterOverview);
  const processIntentFn = useServerFn(processCommandIntent);
  const executeActionFn = useServerFn(executeCommandAction);

  const [inputQuery, setInputQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [executingCardId, setExecutingCardId] = useState<string | null>(null);
  const [schoolScope, setSchoolScope] = useState<"all" | "lincoln" | "east">("all");
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [actionHistory, setActionHistory] = useState<
    Array<{
      id: string;
      title: string;
      time: string;
      intent: string;
      type: string;
    }>
  >([]);

  // Local card edit states for human-in-the-loop preview editing
  const [editingCardPayloads, setEditingCardPayloads] = useState<Record<string, any>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load dashboard overview statistics
  const {
    data: overview,
    isLoading: overviewLoading,
    refetch: refetchOverview,
  } = useQuery<CommandCenterOverview>({
    queryKey: ["command-center-overview"],
    queryFn: async () => {
      return await overviewFn();
    },
    staleTime: 1000 * 15,
  });

  // Voice Assistant Hook
  const voice = useVoiceAssistant({
    lang: "es-US",
    continuous: false,
    onTranscript: (text, isFinal) => {
      setInputQuery(text);
      if (isFinal && text.trim().length > 3) {
        handleSendCommand(text, true);
      }
    },
    onError: (err) => {
      toast.error(err);
    },
  });

  // Conversation history state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "assistant",
      timestamp: "En vivo",
      text: '¡Hola! Bienvenido al Centro Inteligente de Mando con Voz de DMPS Family Connect.\n\nPuedes hablar o escribir en lenguaje natural para:\n• Buscar información oficial en las 29 guías escolares (ej: "¿Cómo entro a Infinite Campus?")\n• Buscar partidos y deportes en Bound (ej: "Busca partidos de baloncesto de East High")\n• Crear artículos y eventos (ej: "Crea un artículo sobre los exámenes finales")\n• Hacer cambios reales (ej: "Cancela el partido de baloncesto del viernes por clima", "Publica el borrador")',
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  // Main Command Processor
  const handleSendCommand = async (textToSend?: string, isVoice = false) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isProcessing) return;

    setInputQuery("");
    const userMsgId = `usr-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      timestamp: new Date().toLocaleTimeString("es-US", { hour: "2-digit", minute: "2-digit" }),
      text: query,
      isVoiceInput: isVoice || voice.isListening,
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsProcessing(true);

    try {
      const result = await processIntentFn({
        data: {
          query,
          schoolScope,
        },
      });

      const assistantMsgId = `asst-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          sender: "assistant",
          timestamp: new Date().toLocaleTimeString("es-US", { hour: "2-digit", minute: "2-digit" }),
          text: result.aiExplanation,
          parsedResult: result,
        },
      ]);

      // If action was executed immediately
      if (result.executed && result.payload && "title" in result.payload) {
        setActionHistory((prev) => [
          {
            id: `act-${Date.now()}`,
            title: (result.payload as any).title,
            time: new Date().toLocaleTimeString("es-US", { hour: "2-digit", minute: "2-digit" }),
            intent: result.intent,
            type: "Ejecución inmediata",
          },
          ...prev,
        ]);
        void refetchOverview();
        void qc.invalidateQueries();
      }

      // Voice read-out confirmation through speech synthesis
      if (result.spokenResponse && !voice.isMuted) {
        voice.speak(result.spokenResponse);
      }
    } catch (error) {
      toast.error((error as Error).message || "No se pudo interpretar el comando.");
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "assistant",
          timestamp: new Date().toLocaleTimeString("es-US", { hour: "2-digit", minute: "2-digit" }),
          text: "Hubo un inconveniente al procesar tu instrucción. Por favor reformula o intenta de nuevo.",
        },
      ]);
    } finally {
      setIsProcessing(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Human-In-The-Loop Action Confirmation
  const handleConfirmAction = async (msgId: string, result: CommandParsedResult) => {
    if (!result.payload || executingCardId) return;
    setExecutingCardId(msgId);

    // Merge any edits made in the card
    const payloadToExecute = editingCardPayloads[msgId] || result.payload;

    try {
      const res = await executeActionFn({
        data: {
          intent: result.intent as
            "CREATE_ARTICLE" | "CREATE_EVENT" | "CREATE_ANNOUNCEMENT" | "MODIFY_CONTENT",
          payload: payloadToExecute,
        },
      });

      if (res.success) {
        toast.success(res.message);

        // Update message state to show confirmed
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id === msgId && m.parsedResult) {
              return {
                ...m,
                parsedResult: {
                  ...m.parsedResult,
                  executed: true,
                  executionResult: {
                    success: true,
                    message: res.message,
                  },
                },
              };
            }
            return m;
          }),
        );

        // Voice Readout
        if (res.spokenResponse && !voice.isMuted) {
          voice.speak(res.spokenResponse);
        }

        // Add to history
        const histTitle =
          (payloadToExecute as any).title ||
          (payloadToExecute as any).targetTitle ||
          "Acción confirmada";
        setActionHistory((prev) => [
          {
            id: `act-${Date.now()}`,
            title: histTitle,
            time: new Date().toLocaleTimeString("es-US", { hour: "2-digit", minute: "2-digit" }),
            intent: result.intent,
            type: "Confirmado manualmente",
          },
          ...prev,
        ]);

        void refetchOverview();
        void qc.invalidateQueries();
      } else {
        toast.error(res.message || "Error al ejecutar la acción.");
      }
    } catch (err) {
      toast.error((err as Error).message || "Fallo en la publicación.");
    } finally {
      setExecutingCardId(null);
    }
  };

  // Discard action card
  const handleDiscardAction = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId) {
          return {
            ...m,
            parsedResult: undefined,
            text: "Acción descartada por el administrador.",
          };
        }
        return m;
      }),
    );
    toast.info("Acción cancelada.");
    if (!voice.isMuted) {
      voice.speak("Acción cancelada.");
    }
  };

  const samplePrompts = [
    {
      label: "📝 Exámenes finales Lincoln High",
      query:
        "Crea un artículo sobre los exámenes finales de Lincoln High para la categoría Académico",
    },
    {
      label: "🏀 Baloncesto East High viernes 6pm",
      query:
        "Agrega el partido de baloncesto masculino de East High este viernes a las 6pm en el gimnasio principal",
    },
    {
      label: "⚠️ Retraso de 2 horas por clima",
      query: "Publica una alerta distrital de retraso de 2 horas en el transporte por clima",
    },
    {
      label: "🔍 ¿Cómo entrar a Infinite Campus?",
      query: "Busca cómo entrar a Infinite Campus y ver calificaciones",
    },
    {
      label: "🏀 Buscar partidos de baloncesto",
      query: "Busca partidos de baloncesto de Lincoln y East High",
    },
    {
      label: "❌ Cancelar partido por clima",
      query: "Cancela el partido de baloncesto de este viernes por clima",
    },
    {
      label: "📊 Auditar portal y eventos",
      query: "Audita la web y dime qué contenido falta o qué eventos ya vencieron",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* 1. Header with Controls & Voice status */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex size-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Inteligencia Artificial · Web Speech API
            </span>
            <Badge
              variant="outline"
              className="gap-1 border-primary/30 bg-primary/5 text-primary text-xs"
            >
              <Sparkles className="size-3" />
              <span>DMPS Voice Engine V2</span>
            </Badge>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Centro de Control y Mando con Voz
          </h1>
          <p className="text-sm text-muted-foreground">
            Búsqueda de información en guías oficiales, calendario de partidos de Bound, creación de
            artículos y cambios reales en la base de datos mediante órdenes en español.
          </p>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Audio Feedback Speaker Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={voice.toggleMute}
            className={`gap-1.5 rounded-xl font-semibold transition-all ${
              voice.isMuted
                ? "text-muted-foreground"
                : "border-primary/40 bg-primary/5 text-primary"
            }`}
            title={voice.isMuted ? "Activar respuestas habladas" : "Silenciar voz"}
          >
            {voice.isMuted ? (
              <>
                <VolumeX className="size-4" />
                <span className="text-xs">Voz Desactivada</span>
              </>
            ) : (
              <>
                <Volume2 className="size-4 text-primary animate-pulse" />
                <span className="text-xs">Voz Activa</span>
              </>
            )}
          </Button>

          {/* School Scope Filter */}
          <div className="flex rounded-xl border border-border bg-secondary/50 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSchoolScope("all")}
              className={`rounded-lg px-2.5 py-1 transition-colors ${
                schoolScope === "all"
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Distrito
            </button>
            <button
              type="button"
              onClick={() => setSchoolScope("lincoln")}
              className={`rounded-lg px-2.5 py-1 transition-colors ${
                schoolScope === "lincoln"
                  ? "bg-background text-primary shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Lincoln
            </button>
            <button
              type="button"
              onClick={() => setSchoolScope("east")}
              className={`rounded-lg px-2.5 py-1 transition-colors ${
                schoolScope === "east"
                  ? "bg-background text-rose-600 shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              East
            </button>
          </div>

          {/* Action History Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistoryPanel(!showHistoryPanel)}
            className="gap-1.5 rounded-xl text-xs font-semibold"
          >
            <History className="size-4" />
            <span>Historial ({actionHistory.length})</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Live Metrics Overview Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Articles */}
        <Card className="rounded-2xl border-border bg-card shadow-soft transition-all hover:border-primary/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground">
              Artículos y Guías
            </CardTitle>
            <div className="grid size-9 place-items-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <BookOpen className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">
              {overview?.articles.total ?? 29}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {overview?.articles.published ?? 29} publicados
              </span>
              <span>•</span>
              <span>{overview?.articles.drafts ?? 0} borradores</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Events & Sports */}
        <Card className="rounded-2xl border-border bg-card shadow-soft transition-all hover:border-primary/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground">
              Eventos y Deportes
            </CardTitle>
            <div className="grid size-9 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Trophy className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{overview?.events.total ?? 5}</div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {overview?.events.upcoming ?? 5} próximos
              </span>
              <span>•</span>
              <span className={overview?.events.cancelled ? "text-rose-600 font-bold" : ""}>
                {overview?.events.cancelled ?? 0} cancelados
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Announcements & Alerts */}
        <Card className="rounded-2xl border-border bg-card shadow-soft transition-all hover:border-primary/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground">
              Avisos y Alertas
            </CardTitle>
            <div className="grid size-9 place-items-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Megaphone className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">
              {overview?.announcements.total ?? 1}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                {overview?.announcements.urgent ?? 0} urgente
              </span>
              <span>•</span>
              <span>{overview?.announcements.tickerCount ?? 1} en marquesina</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: System Audit Status */}
        <Card className="rounded-2xl border-border bg-card shadow-soft transition-all hover:border-primary/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground">
              Salud del Portal
            </CardTitle>
            <div className="grid size-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-2xl font-black text-foreground">
              <span>99.2%</span>
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 text-[10px] font-bold"
              >
                ÓPTIMO
              </Badge>
            </div>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              Auditoría: {overview?.systemHealth.lastAuditAt || "En vivo"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Main Command Console & Chat Interface */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left/Center: Conversation & Action Cards (8 or 12 cols) */}
        <div className={showHistoryPanel ? "lg:col-span-8" : "lg:col-span-12"}>
          <div className="flex min-h-[580px] flex-col rounded-3xl border border-border bg-card shadow-soft">
            {/* Terminal Header */}
            <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-5 py-3">
              <div className="flex items-center gap-2">
                <Terminal className="size-4 text-primary" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                  DMPS Command Stream :: Consola de Mando
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="hidden sm:inline">Idioma: Español (es-US)</span>
                <span>•</span>
                <span className="font-mono text-emerald-600 font-semibold">Listo para órdenes</span>
              </div>
            </div>

            {/* Stream Messages Container */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6 max-h-[660px]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  {/* Message Bubble */}
                  <div
                    className={`max-w-[90%] rounded-2xl p-4 text-sm sm:max-w-[80%] leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground font-medium shadow-xs"
                        : "border border-border bg-secondary/50 text-foreground"
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-3 text-[11px] opacity-70">
                      <span className="font-bold flex items-center gap-1">
                        {msg.sender === "user" ? (
                          <>
                            {msg.isVoiceInput && <Mic className="size-3 text-gold" />}
                            <span>Administrador</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="size-3 text-primary" />
                            <span>DMPS AI Assistant</span>
                          </>
                        )}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>
                    {msg.text && <p className="whitespace-pre-line">{msg.text}</p>}
                  </div>

                  {/* ACTION CARDS BY INTENT */}
                  {msg.parsedResult && msg.parsedResult.payload && (
                    <div className="mt-3 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {/* ============================================================== */}
                      {/* CARD 1: SEARCH_INFO (Grounded Knowledge & Guides) */}
                      {/* ============================================================== */}
                      {msg.parsedResult.intent === "SEARCH_INFO" && (
                        <Card className="overflow-hidden rounded-2xl border-2 border-blue-500/30 bg-background shadow-lift">
                          <div className="flex items-center justify-between border-b border-border bg-blue-500/10 px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <Compass className="size-4 text-blue-600" />
                              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                                Búsqueda Oficial de Información
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs bg-background">
                              {(msg.parsedResult.payload as any).articles?.length || 0} Guías
                              Encontradas
                            </Badge>
                          </div>
                          <CardContent className="space-y-4 p-5">
                            {/* Synthesized Answer */}
                            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5 text-xs text-foreground leading-relaxed">
                              <div className="font-bold text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-1.5">
                                <Sparkles className="size-3.5" />
                                <span>Respuesta Oficial Verificada:</span>
                              </div>
                              <p className="whitespace-pre-line">
                                {(msg.parsedResult.payload as any).answer}
                              </p>
                            </div>

                            {/* Articles Grid */}
                            {(msg.parsedResult.payload as any).articles?.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase text-muted-foreground">
                                  Guías y Artículos Oficiales Relacionados:
                                </h4>
                                <div className="space-y-2">
                                  {(msg.parsedResult.payload as any).articles.map(
                                    (art: any, i: number) => (
                                      <div
                                        key={i}
                                        className="rounded-xl border border-border bg-secondary/30 p-3 text-xs space-y-1.5 transition-colors hover:border-primary/40"
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <span className="font-bold text-foreground">
                                            {art.title}
                                          </span>
                                          <div className="flex gap-1 shrink-0">
                                            {art.category_name && (
                                              <Badge variant="secondary" className="text-[10px]">
                                                {art.category_name}
                                              </Badge>
                                            )}
                                            {art.school_id && (
                                              <Badge
                                                variant="outline"
                                                className="text-[10px] uppercase"
                                              >
                                                {art.school_id}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                        <p className="text-muted-foreground line-clamp-2">
                                          {art.summary}
                                        </p>
                                        <div className="pt-1 flex items-center gap-2">
                                          <Link
                                            to="/guia/$slug"
                                            params={{ slug: art.slug }}
                                            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                                          >
                                            <span>Leer Guía Completa</span>
                                            <ArrowRight className="size-3" />
                                          </Link>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Contacts */}
                            {(msg.parsedResult.payload as any).contacts?.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase text-muted-foreground">
                                  Contactos y Enlaces BFL de DMPS:
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {(msg.parsedResult.payload as any).contacts.map(
                                    (c: any, i: number) => (
                                      <div
                                        key={i}
                                        className="rounded-xl border border-border bg-secondary/30 p-2.5 text-xs space-y-1"
                                      >
                                        <div className="font-bold text-foreground">{c.name}</div>
                                        <div className="text-muted-foreground text-[11px]">
                                          {c.role}
                                        </div>
                                        <div className="flex items-center gap-3 pt-1 text-[11px]">
                                          <a
                                            href={`tel:${c.phone}`}
                                            className="flex items-center gap-1 text-primary hover:underline font-semibold"
                                          >
                                            <Phone className="size-3" />
                                            <span>{c.phone}</span>
                                          </a>
                                          {c.email && (
                                            <a
                                              href={`mailto:${c.email}`}
                                              className="flex items-center gap-1 text-muted-foreground hover:underline"
                                            >
                                              <Mail className="size-3" />
                                              <span>Correo</span>
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* ============================================================== */}
                      {/* CARD 2: SEARCH_SPORTS_EVENTS (Bound & Calendar) */}
                      {/* ============================================================== */}
                      {msg.parsedResult.intent === "SEARCH_SPORTS_EVENTS" && (
                        <Card className="overflow-hidden rounded-2xl border-2 border-amber-500/30 bg-background shadow-lift">
                          <div className="flex items-center justify-between border-b border-border bg-amber-500/10 px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <Trophy className="size-4 text-amber-600" />
                              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                                Calendario Deportivo & Bound
                              </span>
                            </div>
                            <Badge className="bg-amber-600 text-white text-xs">
                              {(msg.parsedResult.payload as any).events?.length || 0} Eventos
                            </Badge>
                          </div>
                          <CardContent className="space-y-4 p-5">
                            <p className="text-xs font-semibold text-foreground">
                              {(msg.parsedResult.payload as any).summary}
                            </p>

                            {/* Events List */}
                            {(msg.parsedResult.payload as any).events?.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase text-muted-foreground">
                                  Partidos y Encuentros en Calendario:
                                </h4>
                                <div className="space-y-2">
                                  {(msg.parsedResult.payload as any).events.map(
                                    (ev: any, i: number) => (
                                      <div
                                        key={i}
                                        className={`rounded-xl border p-3 text-xs space-y-2 ${
                                          ev.is_cancelled
                                            ? "border-rose-500/30 bg-rose-500/5"
                                            : "border-border bg-secondary/30"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <span className="font-bold text-foreground">
                                            {ev.title}
                                          </span>
                                          {ev.is_cancelled ? (
                                            <Badge
                                              variant="destructive"
                                              className="text-[10px] font-bold"
                                            >
                                              CANCELADO
                                            </Badge>
                                          ) : (
                                            <Badge
                                              variant="outline"
                                              className="border-emerald-500/40 text-emerald-600 text-[10px] font-bold bg-emerald-500/10"
                                            >
                                              PROGRAMADO
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-muted-foreground">
                                          <div className="flex items-center gap-1">
                                            <Calendar className="size-3 text-amber-600" />
                                            <span>{ev.start_date}</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Clock className="size-3 text-amber-600" />
                                            <span>{ev.start_time || "18:00"}</span>
                                          </div>
                                          <div className="flex items-center gap-1 truncate">
                                            <MapPin className="size-3 text-amber-600" />
                                            <span className="truncate">{ev.location}</span>
                                          </div>
                                        </div>

                                        {/* Action buttons on event item */}
                                        <div className="pt-1 flex items-center justify-between gap-2">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                              handleSendCommand(
                                                ev.is_cancelled
                                                  ? `Reactiva el partido ${ev.title}`
                                                  : `Cancela el evento ${ev.title} por clima`,
                                              )
                                            }
                                            className={`h-7 px-2.5 text-[11px] rounded-lg font-semibold ${
                                              ev.is_cancelled
                                                ? "text-emerald-600 hover:bg-emerald-500/10"
                                                : "text-rose-600 hover:bg-rose-500/10"
                                            }`}
                                          >
                                            {ev.is_cancelled ? (
                                              <>
                                                <RefreshCw className="size-3 mr-1" />
                                                <span>Reactivar este partido</span>
                                              </>
                                            ) : (
                                              <>
                                                <Trash2 className="size-3 mr-1" />
                                                <span>Cancelar por clima</span>
                                              </>
                                            )}
                                          </Button>
                                          <Link
                                            to="/admin/eventos"
                                            className="text-[11px] text-primary hover:underline font-semibold inline-flex items-center gap-1"
                                          >
                                            <span>Ver en Calendario</span>
                                            <ExternalLink className="size-3" />
                                          </Link>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Bound Activities */}
                            {(msg.parsedResult.payload as any).activities?.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase text-muted-foreground">
                                  Programas Deportivos en Plataforma Bound:
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {(msg.parsedResult.payload as any).activities.map(
                                    (act: any, i: number) => (
                                      <div
                                        key={i}
                                        className="rounded-xl border border-border bg-secondary/20 p-2.5 text-xs space-y-1"
                                      >
                                        <div className="font-bold text-foreground">{act.name}</div>
                                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                          <span>Temporada: {act.season}</span>
                                          <span className="uppercase font-semibold">
                                            {act.school_id}
                                          </span>
                                        </div>
                                        <div className="pt-1">
                                          <a
                                            href={act.official_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold"
                                          >
                                            <span>Registro en Bound</span>
                                            <ExternalLink className="size-3" />
                                          </a>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* ============================================================== */}
                      {/* CARD 3: MODIFY_CONTENT (Real Database Changes) */}
                      {/* ============================================================== */}
                      {msg.parsedResult.intent === "MODIFY_CONTENT" && (
                        <Card className="overflow-hidden rounded-2xl border-2 border-indigo-500/40 bg-background shadow-lift">
                          <div className="flex items-center justify-between border-b border-border bg-indigo-500/10 px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <FileEdit className="size-4 text-indigo-600" />
                              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                                Cambio Real en Base de Datos
                              </span>
                            </div>
                            <Badge className="bg-indigo-600 text-white text-xs uppercase font-bold">
                              {(msg.parsedResult.payload as any).targetType}
                            </Badge>
                          </div>
                          <CardContent className="space-y-4 p-5">
                            <div>
                              <h3 className="text-base font-bold text-foreground">
                                {(msg.parsedResult.payload as any).targetTitle}
                              </h3>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {(msg.parsedResult.payload as any).changeDescription}
                              </p>
                            </div>

                            {/* Diff Table */}
                            {(msg.parsedResult.payload as any).diff && (
                              <div className="rounded-xl border border-border bg-secondary/30 p-3 text-xs space-y-2">
                                <div className="font-bold text-muted-foreground uppercase text-[10px]">
                                  Modificaciones que se aplicarán al registro:
                                </div>
                                <div className="space-y-1.5 font-mono text-[11px]">
                                  {(msg.parsedResult.payload as any).diff.map(
                                    (d: any, idx: number) => (
                                      <div
                                        key={idx}
                                        className="flex items-center justify-between rounded-lg bg-background p-2 border border-border/60"
                                      >
                                        <span className="font-bold text-foreground">
                                          {d.label}:
                                        </span>
                                        <div className="flex items-center gap-2">
                                          <span className="text-rose-500 line-through">
                                            {String(d.from)}
                                          </span>
                                          <ArrowRight className="size-3 text-muted-foreground" />
                                          <span className="text-emerald-600 font-bold">
                                            {String(d.to)}
                                          </span>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Human In The Loop Action Buttons */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                              {msg.parsedResult.executed ? (
                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                                  <CheckCircle2 className="size-4" />
                                  <span>Cambio persistido con éxito en la Base de Datos</span>
                                  <Link
                                    to={
                                      (msg.parsedResult.payload as any).targetType === "event"
                                        ? "/admin/eventos"
                                        : (msg.parsedResult.payload as any).targetType === "article"
                                          ? "/admin/articulos"
                                          : "/admin/anuncios"
                                    }
                                    className="ml-2 inline-flex items-center gap-1 text-primary hover:underline"
                                  >
                                    <span>Ver registro</span>
                                    <ExternalLink className="size-3" />
                                  </Link>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleConfirmAction(msg.id, msg.parsedResult!)}
                                      disabled={executingCardId === msg.id}
                                      className="gap-1.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-soft"
                                    >
                                      {executingCardId === msg.id ? (
                                        <Loader2 className="size-3.5 animate-spin" />
                                      ) : (
                                        <Check className="size-3.5" />
                                      )}
                                      <span>Confirmar y Aplicar Cambio</span>
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDiscardAction(msg.id)}
                                      className="rounded-xl text-xs text-muted-foreground hover:text-destructive"
                                    >
                                      <Trash2 className="size-3.5 mr-1" />
                                      <span>Descartar</span>
                                    </Button>
                                  </div>
                                  <span className="text-[11px] text-muted-foreground italic">
                                    Supervisión de cambio
                                  </span>
                                </>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* ============================================================== */}
                      {/* CARD 4: CREATE_ARTICLE */}
                      {/* ============================================================== */}
                      {msg.parsedResult.intent === "CREATE_ARTICLE" && (
                        <Card className="overflow-hidden rounded-2xl border-2 border-primary/30 bg-background shadow-lift">
                          <div className="flex items-center justify-between border-b border-border bg-primary/10 px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <FileText className="size-4 text-primary" />
                              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                                Propuesta de Nuevo Artículo
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="text-xs font-semibold bg-background"
                              >
                                {(msg.parsedResult.payload as any).category_name}
                              </Badge>
                              <Badge className="bg-primary text-primary-foreground text-xs uppercase">
                                {(msg.parsedResult.payload as any).school_scope === "all"
                                  ? "Distrito"
                                  : (msg.parsedResult.payload as any).school_scope}
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="space-y-3 p-5">
                            <div>
                              <h3 className="text-base font-bold text-foreground">
                                {(msg.parsedResult.payload as any).title}
                              </h3>
                              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                {(msg.parsedResult.payload as any).summary}
                              </p>
                            </div>
                            <div className="rounded-xl border border-border/80 bg-secondary/30 p-3 text-xs text-foreground/80 font-mono">
                              <p className="line-clamp-3">
                                {(msg.parsedResult.payload as any).content}
                              </p>
                            </div>

                            {/* Human In The Loop Action Buttons */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                              {msg.parsedResult.executed ? (
                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                                  <CheckCircle2 className="size-4" />
                                  <span>Publicado en Base de Datos Oficial</span>
                                  <Link
                                    to="/admin/articulos"
                                    className="ml-2 inline-flex items-center gap-1 text-primary hover:underline"
                                  >
                                    <span>Ver en Artículos</span>
                                    <ExternalLink className="size-3" />
                                  </Link>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleConfirmAction(msg.id, msg.parsedResult!)}
                                      disabled={executingCardId === msg.id}
                                      className="gap-1.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                                    >
                                      {executingCardId === msg.id ? (
                                        <Loader2 className="size-3.5 animate-spin" />
                                      ) : (
                                        <Check className="size-3.5" />
                                      )}
                                      <span>Confirmar y Publicar</span>
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDiscardAction(msg.id)}
                                      className="rounded-xl text-xs text-muted-foreground hover:text-destructive"
                                    >
                                      <Trash2 className="size-3.5 mr-1" />
                                      <span>Descartar</span>
                                    </Button>
                                  </div>
                                  <span className="text-[11px] text-muted-foreground italic">
                                    Supervisión requerida
                                  </span>
                                </>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* ============================================================== */}
                      {/* CARD 5: CREATE_EVENT */}
                      {/* ============================================================== */}
                      {msg.parsedResult.intent === "CREATE_EVENT" && (
                        <Card className="overflow-hidden rounded-2xl border-2 border-amber-500/30 bg-background shadow-lift">
                          <div className="flex items-center justify-between border-b border-border bg-amber-500/10 px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <Trophy className="size-4 text-amber-600" />
                              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                                Nuevo Partido / Evento
                              </span>
                            </div>
                            <Badge className="bg-amber-600 text-white text-xs uppercase font-bold">
                              {(msg.parsedResult.payload as any).school_scope === "all"
                                ? "Distrito"
                                : (msg.parsedResult.payload as any).school_scope}
                            </Badge>
                          </div>
                          <CardContent className="space-y-3 p-5">
                            <div>
                              <h3 className="text-base font-bold text-foreground">
                                {(msg.parsedResult.payload as any).title}
                              </h3>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {(msg.parsedResult.payload as any).description}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center gap-2 rounded-xl bg-secondary/50 p-2.5 text-muted-foreground">
                                <Calendar className="size-3.5 text-amber-600" />
                                <span className="font-semibold text-foreground">
                                  {(msg.parsedResult.payload as any).start_date}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 rounded-xl bg-secondary/50 p-2.5 text-muted-foreground">
                                <Clock className="size-3.5 text-amber-600" />
                                <span className="font-semibold text-foreground">
                                  {(msg.parsedResult.payload as any).start_time}
                                </span>
                              </div>
                              <div className="col-span-full flex items-center gap-2 rounded-xl bg-secondary/50 p-2.5 text-muted-foreground">
                                <MapPin className="size-3.5 text-amber-600" />
                                <span className="font-semibold text-foreground">
                                  {(msg.parsedResult.payload as any).location}
                                </span>
                              </div>
                            </div>

                            {/* Human In The Loop Action Buttons */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                              {msg.parsedResult.executed ? (
                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                                  <CheckCircle2 className="size-4" />
                                  <span>Agregado al Calendario Oficial de DMPS</span>
                                  <Link
                                    to="/admin/eventos"
                                    className="ml-2 inline-flex items-center gap-1 text-primary hover:underline"
                                  >
                                    <span>Ver en Eventos</span>
                                    <ExternalLink className="size-3" />
                                  </Link>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleConfirmAction(msg.id, msg.parsedResult!)}
                                      disabled={executingCardId === msg.id}
                                      className="gap-1.5 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700"
                                    >
                                      {executingCardId === msg.id ? (
                                        <Loader2 className="size-3.5 animate-spin" />
                                      ) : (
                                        <Check className="size-3.5" />
                                      )}
                                      <span>Confirmar y Programar</span>
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDiscardAction(msg.id)}
                                      className="rounded-xl text-xs text-muted-foreground hover:text-destructive"
                                    >
                                      <Trash2 className="size-3.5 mr-1" />
                                      <span>Descartar</span>
                                    </Button>
                                  </div>
                                  <span className="text-[11px] text-muted-foreground italic">
                                    Requiere confirmación
                                  </span>
                                </>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* ============================================================== */}
                      {/* CARD 6: CREATE_ANNOUNCEMENT */}
                      {/* ============================================================== */}
                      {msg.parsedResult.intent === "CREATE_ANNOUNCEMENT" && (
                        <Card className="overflow-hidden rounded-2xl border-2 border-rose-500/40 bg-background shadow-lift">
                          <div className="flex items-center justify-between border-b border-border bg-rose-500/10 px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="size-4 text-rose-600 animate-pulse" />
                              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                                Alerta Institucional de Transporte / Clima
                              </span>
                            </div>
                            <Badge className="bg-rose-600 text-white text-xs uppercase font-bold">
                              {(msg.parsedResult.payload as any).level}
                            </Badge>
                          </div>
                          <CardContent className="space-y-3 p-5">
                            <div>
                              <h3 className="text-base font-bold text-foreground">
                                {(msg.parsedResult.payload as any).title}
                              </h3>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {(msg.parsedResult.payload as any).message}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2 text-xs">
                              <Badge variant="secondary" className="gap-1">
                                <Radio className="size-3 text-rose-600" />
                                <span>Marquesina Superior Activa (Ticker)</span>
                              </Badge>
                              <Badge variant="secondary" className="gap-1">
                                <Compass className="size-3 text-primary" />
                                <span>Visible en Página de Inicio</span>
                              </Badge>
                            </div>

                            {/* Human In The Loop Action Buttons */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                              {msg.parsedResult.executed ? (
                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                                  <CheckCircle2 className="size-4" />
                                  <span>Alerta Activa en la Marquesina Pública</span>
                                  <Link
                                    to="/admin/anuncios"
                                    className="ml-2 inline-flex items-center gap-1 text-primary hover:underline"
                                  >
                                    <span>Ver en Anuncios</span>
                                    <ExternalLink className="size-3" />
                                  </Link>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleConfirmAction(msg.id, msg.parsedResult!)}
                                      disabled={executingCardId === msg.id}
                                      className="gap-1.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700"
                                    >
                                      {executingCardId === msg.id ? (
                                        <Loader2 className="size-3.5 animate-spin" />
                                      ) : (
                                        <Check className="size-3.5" />
                                      )}
                                      <span>Confirmar y Emitir Alerta</span>
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDiscardAction(msg.id)}
                                      className="rounded-xl text-xs text-muted-foreground hover:text-destructive"
                                    >
                                      <Trash2 className="size-3.5 mr-1" />
                                      <span>Descartar</span>
                                    </Button>
                                  </div>
                                  <span className="text-[11px] text-muted-foreground italic">
                                    Confirmación humana
                                  </span>
                                </>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* ============================================================== */}
                      {/* CARD 7: AUDIT_SITE */}
                      {/* ============================================================== */}
                      {msg.parsedResult.intent === "AUDIT_SITE" && (
                        <Card className="overflow-hidden rounded-2xl border-2 border-emerald-500/30 bg-background shadow-lift">
                          <div className="flex items-center justify-between border-b border-border bg-emerald-500/10 px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="size-4 text-emerald-600" />
                              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                Auditoría Integral del Portal
                              </span>
                            </div>
                            <Badge className="bg-emerald-600 text-white text-xs font-bold">
                              Completada
                            </Badge>
                          </div>
                          <CardContent className="space-y-4 p-5">
                            <p className="text-xs font-medium text-foreground">
                              {(msg.parsedResult.payload as any).summary}
                            </p>

                            {/* Findings */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-bold uppercase text-muted-foreground">
                                Hallazgos Detectados:
                              </h4>
                              {(msg.parsedResult.payload as any).findings?.map(
                                (f: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-2.5 rounded-xl border border-border bg-secondary/30 p-2.5 text-xs"
                                  >
                                    {f.type === "warning" ? (
                                      <AlertTriangle className="size-4 shrink-0 text-amber-500 mt-0.5" />
                                    ) : f.type === "success" ? (
                                      <CheckCircle2 className="size-4 shrink-0 text-emerald-500 mt-0.5" />
                                    ) : (
                                      <Compass className="size-4 shrink-0 text-blue-500 mt-0.5" />
                                    )}
                                    <div>
                                      <div className="font-bold text-foreground">{f.title}</div>
                                      <div className="text-muted-foreground">{f.description}</div>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>

                            {/* Recommendations */}
                            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs space-y-1.5">
                              <span className="font-bold text-primary flex items-center gap-1.5">
                                <Sparkles className="size-3" />
                                <span>Recomendaciones sugeridas:</span>
                              </span>
                              <ul className="list-disc list-inside space-y-1 text-foreground/90 pl-1">
                                {(msg.parsedResult.payload as any).recommendations?.map(
                                  (r: string, idx: number) => (
                                    <li key={idx}>{r}</li>
                                  ),
                                )}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isProcessing && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse p-2">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  <span>Analizando orden y consultando base de datos en tiempo real...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Suggestion Chips */}
            <div className="border-t border-border/60 bg-secondary/20 p-3">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Comandos de Voz Rápidos:
              </p>
              <div className="flex flex-wrap gap-2">
                {samplePrompts.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendCommand(p.query)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground/90 transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary active:scale-95"
                  >
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Dock: Voice Waves & Input Bar */}
            <div className="border-t border-border bg-card p-4 rounded-b-3xl space-y-3">
              {/* Dynamic Sound Wave visualizer if listening or speaking */}
              {(voice.isListening || voice.isSpeaking) && (
                <div className="flex items-center justify-center gap-1.5 py-1 animate-in fade-in">
                  <span className="text-xs font-bold text-primary flex items-center gap-1 mr-2">
                    <Radio className="size-3.5 text-primary animate-pulse" />
                    <span>
                      {voice.isListening ? "Escuchando tu voz..." : "Sintetizando respuesta..."}
                    </span>
                  </span>
                  {voice.waveBars.map((height, i) => (
                    <div
                      key={i}
                      className="w-1.5 rounded-full bg-primary transition-all duration-75"
                      style={{ height: `${height * 0.35}px` }}
                    />
                  ))}
                </div>
              )}

              {/* Interim voice transcript preview */}
              {voice.interimTranscript && (
                <div className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs text-primary font-medium animate-pulse">
                  Transcripción en vivo: "{voice.interimTranscript}"
                </div>
              )}

              <div className="flex items-center gap-2">
                {/* Large Voice Action Button */}
                <button
                  type="button"
                  onClick={() => voice.toggleListening((txt) => handleSendCommand(txt, true))}
                  className={`group relative grid size-12 shrink-0 place-items-center rounded-2xl transition-all duration-200 active:scale-95 ${
                    voice.isListening
                      ? "bg-rose-600 text-white shadow-lift ring-4 ring-rose-500/30 animate-pulse"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft"
                  }`}
                  title={voice.isListening ? "Pausar micrófono" : "Hablar con el asistente"}
                >
                  {voice.isListening ? (
                    <MicOff className="size-5" />
                  ) : (
                    <Mic className="size-5 transition-transform group-hover:scale-110" />
                  )}
                </button>

                {/* Text Command Input */}
                <div className="relative flex-1">
                  <Input
                    ref={inputRef}
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendCommand();
                      }
                    }}
                    placeholder={
                      voice.isListening
                        ? "Habla ahora... o escribe tu comando..."
                        : 'Escribe o presiona el micrófono (Ej: "Busca cómo entrar a Infinite Campus" o "Cancela el partido...")'
                    }
                    className="h-12 rounded-2xl border-border bg-secondary/40 pr-12 text-sm focus-visible:ring-primary"
                    disabled={isProcessing}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleSendCommand()}
                    disabled={!inputQuery.trim() || isProcessing}
                    className="absolute right-1.5 top-1.5 size-9 rounded-xl text-primary hover:bg-primary/10 disabled:opacity-40"
                  >
                    <Send className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Drawer: Recent Execution History Panel (Optional Toggle) */}
        {showHistoryPanel && (
          <div className="lg:col-span-4">
            <Card className="rounded-3xl border-border bg-card shadow-soft h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
                <div className="space-y-0.5">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <History className="size-4 text-primary" />
                    <span>Historial de Mando</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Acciones ejecutadas en esta sesión
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowHistoryPanel(false)}
                  className="size-8 rounded-xl"
                >
                  <X className="size-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 flex-1 overflow-y-auto space-y-3">
                {actionHistory.length === 0 ? (
                  <div className="grid place-items-center py-12 text-center text-muted-foreground">
                    <Clock className="size-8 stroke-1 mb-2 opacity-50" />
                    <p className="text-xs">Aún no se han ejecutado acciones en esta sesión.</p>
                  </div>
                ) : (
                  actionHistory.map((act) => (
                    <div
                      key={act.id}
                      className="rounded-2xl border border-border bg-secondary/30 p-3 space-y-1.5 transition-colors hover:border-primary/30"
                    >
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] font-semibold">
                          {act.type}
                        </Badge>
                        <span>{act.time}</span>
                      </div>
                      <p className="text-xs font-bold text-foreground line-clamp-2">{act.title}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
