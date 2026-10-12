import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  School,
  Share2,
  Sparkles,
  Users,
  KeyRound,
  Play,
  CalendarCheck,
} from "lucide-react";
import { toast } from "sonner";
import { PublicShell } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchClubBySlug,
  fetchClubPosts,
  type SchoolClub,
  type ClubPost,
} from "@/lib/clubs";

export const Route = createFileRoute("/clubs/$slug")({
  head: () => ({
    meta: [
      { title: "Canal Oficial del Club — DMPS Family Info" },
      {
        name: "description",
        content: "Publicaciones, actividades, fechas clave e información de líderes del club.",
      },
    ],
  }),
  component: ClubDetailPage,
});

function ClubDetailPage() {
  const { slug } = Route.useParams();
  const [club, setClub] = useState<SchoolClub | null>(null);
  const [posts, setPosts] = useState<ClubPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const found = await fetchClubBySlug(slug);
        if (!active) return;
        setClub(found);
        if (found) {
          const clubPosts = await fetchClubPosts(found.id);
          if (!active) return;
          setPosts(clubPosts);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 space-y-6">
          <Skeleton className="h-8 w-40 rounded-xl" />
          <Skeleton className="h-72 w-full rounded-3xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </PublicShell>
    );
  }

  if (!club) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
          <h2 className="text-2xl font-bold">Club no encontrado</h2>
          <p className="text-sm text-muted-foreground">
            El club que buscas no existe o ha sido modificado.
          </p>
          <Link to="/clubs">
            <Button className="rounded-xl font-bold">Volver a Clubs</Button>
          </Link>
        </div>
      </PublicShell>
    );
  }

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: club.name,
        text: `Conoce el canal oficial del club ${club.name} en DMPS.`,
        url: window.location.href,
      }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  return (
    <PublicShell>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Back navigation */}
        <Link
          to="/clubs"
          className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline mb-6 text-sm"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" />
          <span>Volver al Directorio de Clubs</span>
        </Link>

        {/* Club Hero Banner */}
        <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm">
          {club.imageUrl && (
            <div className="relative aspect-21/9 sm:aspect-3/1 w-full overflow-hidden bg-muted">
              <img
                src={club.imageUrl}
                alt={club.name}
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 flex flex-wrap items-end justify-between gap-4">
                <div className="space-y-1.5 text-white">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-xs px-2.5 py-0.5 text-xs font-bold text-white">
                      <School className="size-3" />
                      <span>{club.schoolName}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-white">
                      <Sparkles className="size-3" />
                      <span>{club.category}</span>
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
                    {club.name}
                  </h1>
                </div>
              </div>
            </div>
          )}

          {/* Quick Details Bar */}
          <div className="p-6 sm:p-8 space-y-6">
            <p className="text-base sm:text-lg text-foreground/90 leading-relaxed font-normal">
              {club.description}
            </p>

            <div className="grid gap-4 sm:grid-cols-2 rounded-2xl border border-border/60 bg-secondary/30 p-4 sm:p-5">
              <div className="space-y-2">
                <div className="flex items-start gap-2.5 text-sm text-foreground">
                  <Clock className="size-4.5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-xs uppercase tracking-wider text-muted-foreground">
                      Horario de reunión
                    </span>
                    <span className="font-semibold">{club.schedule || "Por confirmar"}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-sm text-foreground pt-1">
                  <MapPin className="size-4.5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-xs uppercase tracking-wider text-muted-foreground">
                      Lugar de encuentro
                    </span>
                    <span className="font-semibold">{club.location || "Por confirmar"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 sm:border-l sm:border-border/60 sm:pl-4">
                <div className="flex items-start gap-2.5 text-sm text-foreground">
                  <Users className="size-4.5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-xs uppercase tracking-wider text-muted-foreground">
                      Líder / Responsable
                    </span>
                    <span className="font-semibold">{club.leaderName}</span>
                  </div>
                </div>

                {club.leaderEmail && (
                  <div className="flex items-start gap-2.5 text-sm text-foreground pt-1">
                    <Mail className="size-4.5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-xs uppercase tracking-wider text-muted-foreground">
                        Contacto directo
                      </span>
                      <a
                        href={`mailto:${club.leaderEmail}`}
                        className="font-semibold text-primary hover:underline truncate block"
                      >
                        {club.leaderEmail}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-3">
                {club.joinUrl ? (
                  <a
                    href={club.joinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
                  >
                    <span>Unirse a este Club</span>
                    <ExternalLink className="size-4" />
                  </a>
                ) : (
                  <Button
                    onClick={() => {
                      if (club.leaderEmail) {
                        window.location.href = `mailto:${club.leaderEmail}?subject=Interés en unirme a ${encodeURIComponent(club.name)}`;
                      } else {
                        toast.info("Comunícate con la dirección de actividades de tu escuela.");
                      }
                    }}
                    className="rounded-xl min-h-11 px-6 font-bold"
                  >
                    Contactar para unirse
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="rounded-xl min-h-11 gap-2 text-xs font-bold"
                >
                  <Share2 className="size-4" />
                  <span>Compartir</span>
                </Button>
              </div>

              {/* Portal link for the leader */}
              <Link
                to="/admin/club-portal"
                className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5"
              >
                <KeyRound className="size-3.5" />
                <span>¿Eres líder? Gestionar club</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Club Feed: Publicaciones exclusivas */}
        <section className="mt-12 space-y-6" aria-labelledby="club-feed-heading">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 id="club-feed-heading" className="text-2xl font-extrabold tracking-tight text-foreground">
                Canal y Avisos del Club
              </h2>
              <p className="text-sm text-muted-foreground">
                Fotos de actividades, proyectos recientes, comunicados y fechas importantes.
              </p>
            </div>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
              {posts.length} {posts.length === 1 ? "publicación" : "publicaciones"}
            </span>
          </div>

          {posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs space-y-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                        {post.title}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium">
                        Publicado por <strong className="text-foreground">{post.author}</strong> ·{" "}
                        {new Date(post.createdAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {post.imageUrl && (
                    <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted/20">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        loading="lazy"
                        className="w-full h-auto max-h-[480px] object-cover"
                      />
                    </div>
                  )}

                  {post.videoUrl && (
                    <div className="aspect-video overflow-hidden rounded-2xl border border-border shadow-soft bg-black">
                      <iframe
                        src={
                          post.videoUrl.includes("youtube.com") || post.videoUrl.includes("youtu.be")
                            ? `https://www.youtube-nocookie.com/embed/${post.videoUrl.match(/(?:watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] || ""}`
                            : post.videoUrl
                        }
                        title="Video del club"
                        allowFullScreen
                        className="size-full"
                      />
                    </div>
                  )}

                  <p className="text-base text-foreground/90 leading-relaxed whitespace-pre-line font-normal">
                    {post.content}
                  </p>

                  {/* Fechas clave adjuntas a la publicación */}
                  {post.keyDates && post.keyDates.length > 0 && (
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                        <CalendarCheck className="size-4" />
                        <span>Fechas importantes del club</span>
                      </div>
                      <div className="divide-y divide-border/40">
                        {post.keyDates.map((kd, idx) => (
                          <div key={idx} className="py-2 first:pt-1 last:pb-0 flex items-center justify-between text-sm">
                            <span className="font-bold text-foreground">{kd.title}</span>
                            <span className="rounded-md bg-card px-2.5 py-1 text-xs font-extrabold text-primary border border-border shadow-2xs">
                              {kd.date}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border p-10 text-center space-y-3 bg-card">
              <Sparkles className="mx-auto size-8 text-muted-foreground" />
              <h4 className="font-bold text-foreground">Aún no hay publicaciones recientes</h4>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                El líder del club publicará fotos de actividades y comunicados en este espacio muy pronto.
              </p>
            </div>
          )}
        </section>
      </div>
    </PublicShell>
  );
}
