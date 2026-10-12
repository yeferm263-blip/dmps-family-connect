import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Calendar,
  CalendarCheck,
  Check,
  Clock,
  ExternalLink,
  Image as ImageIcon,
  KeyRound,
  LogOut,
  Mail,
  MapPin,
  Plus,
  School,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  fetchClubByAccessCode,
  fetchClubPosts,
  createClubPost,
  deleteClubPost,
  updateClub,
  type SchoolClub,
  type ClubPost,
} from "@/lib/clubs";

export const Route = createFileRoute("/admin/club-portal")({
  head: () => ({
    meta: [
      { title: "Portal de Líderes de Club — DMPS Family Info" },
      {
        name: "description",
        content: "Gestión restringida para líderes y coordinadores de clubs escolares DMPS.",
      },
    ],
  }),
  component: ClubLeaderPortalPage,
});

const AUTH_STORAGE_KEY = "dmps_club_leader_auth_code";

function ClubLeaderPortalPage() {
  const [accessCodeInput, setAccessCodeInput] = useState("");
  const [authenticatedClub, setAuthenticatedClub] = useState<SchoolClub | null>(null);
  const [posts, setPosts] = useState<ClubPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);

  // New Post Form
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postImageUrl, setPostImageUrl] = useState("");
  const [postVideoUrl, setPostVideoUrl] = useState("");
  const [keyDate1, setKeyDate1] = useState("");
  const [keyTitle1, setKeyTitle1] = useState("");
  const [publishing, setPublishing] = useState(false);

  // Edit Club Info Form
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editSchedule, setEditSchedule] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editJoinUrl, setEditJoinUrl] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [savingClub, setSavingClub] = useState(false);

  useEffect(() => {
    async function checkSavedSession() {
      if (typeof window === "undefined") return;
      const savedCode = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedCode) {
        const club = await fetchClubByAccessCode(savedCode);
        if (club) {
          setAuthenticatedClub(club);
          initEditForm(club);
          const clubPosts = await fetchClubPosts(club.id);
          setPosts(clubPosts);
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
      setLoading(false);
    }
    void checkSavedSession();
  }, []);

  const initEditForm = (c: SchoolClub) => {
    setEditSchedule(c.schedule || "");
    setEditLocation(c.location || "");
    setEditJoinUrl(c.joinUrl || "");
    setEditDescription(c.description || "");
    setEditImageUrl(c.imageUrl || "");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCodeInput.trim()) return;

    setLoggingIn(true);
    try {
      const club = await fetchClubByAccessCode(accessCodeInput.trim());
      if (!club) {
        toast.error("Código de club no válido o no encontrado", {
          description: "Verifica que el código coincida con el generado al aprobar tu club.",
        });
        return;
      }

      setAuthenticatedClub(club);
      initEditForm(club);
      localStorage.setItem(AUTH_STORAGE_KEY, club.accessCode);
      const clubPosts = await fetchClubPosts(club.id);
      setPosts(clubPosts);
      toast.success(`¡Bienvenido al panel de ${club.name}!`);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthenticatedClub(null);
    setAccessCodeInput("");
    setPosts([]);
    toast.info("Has cerrado sesión del portal de club");
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticatedClub || !postTitle.trim() || !postContent.trim()) {
      toast.error("Por favor ingresa al menos un título y contenido para la publicación");
      return;
    }

    setPublishing(true);
    try {
      const keyDates =
        keyDate1.trim() && keyTitle1.trim()
          ? [{ date: keyDate1.trim(), title: keyTitle1.trim() }]
          : undefined;

      const created = await createClubPost(authenticatedClub.id, {
        title: postTitle.trim(),
        content: postContent.trim(),
        imageUrl: postImageUrl.trim() || undefined,
        videoUrl: postVideoUrl.trim() || undefined,
        keyDates,
        author: authenticatedClub.leaderName,
      });

      setPosts([created, ...posts]);
      setPostTitle("");
      setPostContent("");
      setPostImageUrl("");
      setPostVideoUrl("");
      setKeyDate1("");
      setKeyTitle1("");

      toast.success("¡Publicación lanzada con éxito!", {
        description: "Tu comunidad escolar ya puede ver esta actualización en tu canal.",
      });
    } catch {
      toast.error("Error al publicar la actualización");
    } finally {
      setPublishing(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm("¿Estás seguro de eliminar esta publicación del canal?")) {
      await deleteClubPost(postId);
      setPosts(posts.filter((p) => p.id !== postId));
      toast.info("Publicación eliminada");
    }
  };

  const handleSaveClubInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticatedClub) return;

    setSavingClub(true);
    try {
      const updated = await updateClub(authenticatedClub.id, {
        schedule: editSchedule.trim(),
        location: editLocation.trim(),
        joinUrl: editJoinUrl.trim() || undefined,
        description: editDescription.trim(),
        imageUrl: editImageUrl.trim() || authenticatedClub.imageUrl,
      });
      setAuthenticatedClub(updated);
      setIsEditingInfo(false);
      toast.success("¡Datos del club actualizados con éxito!");
    } catch {
      toast.error("Error al actualizar la información del club");
    } finally {
      setSavingClub(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-4">
        <div className="flex items-center gap-3 text-muted-foreground font-semibold">
          <Sparkles className="size-5 text-primary animate-spin" />
          <span>Cargando portal de club...</span>
        </div>
      </div>
    );
  }

  // 1. Login view (Restricted access by club code)
  if (!authenticatedClub) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-primary/10 text-primary mb-2 shadow-xs">
              <KeyRound className="size-8" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              Portal de Líderes de Club
            </h1>
            <p className="text-sm text-muted-foreground">
              Acceso exclusivo para maestros coordinadores y estudiantes líderes de clubs DMPS.
            </p>
          </div>

          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-5">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Código de Acceso del Club
                </label>
                <Input
                  required
                  placeholder="Ej. CLUB-LINC-ROBOT-8201"
                  value={accessCodeInput}
                  onChange={(e) => setAccessCodeInput(e.target.value)}
                  className="rounded-xl font-mono text-center tracking-wider font-bold"
                />
                <p className="text-[11px] text-muted-foreground pt-1">
                  Ingresa el código proporcionado por el administrador tras la aprobación de tu club.
                </p>
              </div>

              <Button
                type="submit"
                disabled={loggingIn}
                className="w-full rounded-xl min-h-11 font-bold gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <KeyRound className="size-4" />
                <span>{loggingIn ? "Verificando..." : "Entrar a mi Club"}</span>
              </Button>
            </form>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs space-y-2">
              <span className="font-bold text-primary block">Códigos de prueba rápidos:</span>
              <div className="space-y-1 font-mono text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setAccessCodeInput("CLUB-LINC-ROBOT-8201")}
                  className="block text-start hover:text-primary hover:underline cursor-pointer"
                >
                  • Lincoln Robotics: <code>CLUB-LINC-ROBOT-8201</code>
                </button>
                <button
                  type="button"
                  onClick={() => setAccessCodeInput("CLUB-EAST-LSU-9043")}
                  className="block text-start hover:text-primary hover:underline cursor-pointer"
                >
                  • East High LSU: <code>CLUB-EAST-LSU-9043</code>
                </button>
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              to="/clubs"
              className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
            >
              ← Volver al portal público de clubs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Hyper-restricted Portal View (Strict isolation to authenticated club only)
  return (
    <div className="min-h-screen bg-background">
      {/* Isolated Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Portal de Club Escolar
              </span>
              <span className="rounded-full bg-emerald-500/10 text-emerald-600 px-2 py-0.5 text-[10px] font-bold">
                Activo
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-foreground leading-tight">
              {authenticatedClub.name}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/clubs/$slug"
            params={{ slug: authenticatedClub.slug }}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-background px-3 py-1.5 text-xs font-semibold hover:bg-secondary text-foreground"
          >
            <span>Ver canal público</span>
            <ExternalLink className="size-3" />
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="rounded-xl text-xs font-bold text-muted-foreground hover:text-destructive gap-1.5"
          >
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </Button>
        </div>
      </header>

      {/* Main restricted content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8">
        {/* Club Quick Summary Card */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
              <School className="size-3.5 text-primary" />
              <span>{authenticatedClub.schoolName}</span>
              <span>·</span>
              <span className="text-foreground">{authenticatedClub.category}</span>
            </div>
            <p className="text-sm text-foreground/80 font-normal">
              Líder: <strong>{authenticatedClub.leaderName}</strong> ({authenticatedClub.leaderEmail})
            </p>
            <p className="text-xs text-muted-foreground">
              📅 {authenticatedClub.schedule || "Horario por definir"} · 📍{" "}
              {authenticatedClub.location || "Lugar por definir"}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => setIsEditingInfo(!isEditingInfo)}
            className="rounded-xl text-xs font-bold shrink-0 self-start sm:self-auto"
          >
            {isEditingInfo ? "Cancelar Edición" : "Editar Datos del Club"}
          </Button>
        </div>

        {/* Edit Club Info Panel */}
        {isEditingInfo && (
          <form
            onSubmit={handleSaveClubInfo}
            className="rounded-3xl border border-primary/30 bg-primary/5 p-6 sm:p-8 space-y-4"
          >
            <h3 className="text-lg font-bold text-foreground">Editar Datos y Horarios del Club</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-muted-foreground">
                Descripción del Club
              </label>
              <Textarea
                rows={2}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="rounded-xl resize-none bg-background text-sm"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Horario de Reunión
                </label>
                <Input
                  value={editSchedule}
                  onChange={(e) => setEditSchedule(e.target.value)}
                  className="rounded-xl bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Lugar de Encuentro
                </label>
                <Input
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="rounded-xl bg-background"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Enlace para Unirse
                </label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={editJoinUrl}
                  onChange={(e) => setEditJoinUrl(e.target.value)}
                  className="rounded-xl bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  URL de Imagen de Portada
                </label>
                <Input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  className="rounded-xl bg-background"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button
                type="submit"
                disabled={savingClub}
                className="rounded-xl min-h-10 font-bold bg-primary text-primary-foreground"
              >
                {savingClub ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        )}

        {/* Create Post Section */}
        <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-border pb-4">
            <h3 className="text-xl font-extrabold tracking-tight text-foreground">
              Nueva Publicación en el Canal
            </h3>
            <p className="text-sm text-muted-foreground">
              Sube noticias, fotos de actividades, videos de proyectos y próximas fechas de reunión.
            </p>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-muted-foreground">
                Título del Comunicado o Actividad *
              </label>
              <Input
                required
                placeholder="Ej. ¡Preparando el torneo de otoño!"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="rounded-xl text-base font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-muted-foreground">
                Contenido / Mensaje para las Familias y Miembros *
              </label>
              <Textarea
                required
                rows={4}
                placeholder="Escribe los detalles de la actividad, logros de los estudiantes o avisos importantes..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="rounded-xl resize-none text-sm leading-relaxed"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                  <ImageIcon className="size-3.5 text-primary" />
                  <span>URL de Foto de Actividad</span>
                </label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={postImageUrl}
                  onChange={(e) => setPostImageUrl(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                  <Video className="size-3.5 text-primary" />
                  <span>Video Embebido (YouTube / Vimeo / MP4)</span>
                </label>
                <Input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={postVideoUrl}
                  onChange={(e) => setPostVideoUrl(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Optional Key Date attached */}
            <div className="rounded-2xl border border-border/80 bg-secondary/30 p-4 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <CalendarCheck className="size-3.5 text-primary" />
                <span>Fecha Clave o Evento Próximo (Opcional)</span>
              </span>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder="Fecha (Ej. Octubre 24 o Jueves 3:30 PM)"
                  value={keyDate1}
                  onChange={(e) => setKeyDate1(e.target.value)}
                  className="rounded-xl bg-background"
                />
                <Input
                  placeholder="Nombre del Evento (Ej. Torneo Regional)"
                  value={keyTitle1}
                  onChange={(e) => setKeyTitle1(e.target.value)}
                  className="rounded-xl bg-background"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                disabled={publishing}
                className="rounded-xl min-h-11 px-6 font-bold gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="size-4" />
                <span>{publishing ? "Publicando..." : "Publicar en el Canal"}</span>
              </Button>
            </div>
          </form>
        </section>

        {/* Existing Posts Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">
              Publicaciones Activas ({posts.length})
            </h3>
          </div>

          {posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {new Date(post.createdAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-foreground">{post.title}</h4>
                    <p className="text-sm text-foreground/80 line-clamp-2">{post.content}</p>
                    {post.imageUrl && (
                      <span className="inline-flex items-center gap-1 text-xs text-primary font-semibold">
                        <ImageIcon className="size-3.5" />
                        <span>Foto adjunta</span>
                      </span>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePost(post.id)}
                    className="rounded-xl text-destructive hover:bg-destructive/10 shrink-0 self-end sm:self-start"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground bg-card">
              No hay publicaciones todavía. ¡Usa el formulario arriba para compartir la primera noticia!
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
