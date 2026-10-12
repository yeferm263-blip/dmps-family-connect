import { Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, Clock, MapPin, School, Sparkles, Users } from "lucide-react";
import type { SchoolClub } from "@/lib/clubs";

export function ClubCard({ club }: { club: SchoolClub }) {
  return (
    <Link
      to="/clubs/$slug"
      params={{ slug: club.slug }}
      className="surface-card category-card-animated group flex h-full flex-col justify-between overflow-hidden p-0 rounded-2xl border border-border/80 bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-md"
    >
      {/* Portada visual */}
      {club.imageUrl && (
        <div className="relative w-full overflow-hidden border-b border-border/50 bg-muted/20 aspect-16/9">
          <img
            src={club.imageUrl}
            alt={club.name}
            className="size-full object-cover rounded-t-2xl transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-xs px-2.5 py-1 text-[11px] font-bold text-white shadow-xs">
              <School className="size-3 text-primary-soft" />
              <span>{club.schoolName}</span>
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/90 backdrop-blur-xs px-2.5 py-1 text-[11px] font-bold text-primary-foreground shadow-xs">
              <Sparkles className="size-3" />
              <span>{club.category}</span>
            </span>
          </div>
        </div>
      )}

      {/* Contenido del club */}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div className="space-y-3">
          <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {club.name}
          </h3>

          <p className="text-sm leading-relaxed text-foreground/80 font-normal line-clamp-3">
            {club.description}
          </p>

          {/* Horario y Lugar */}
          <div className="pt-2 space-y-1.5 text-xs text-muted-foreground border-t border-border/40">
            {club.schedule && (
              <div className="flex items-center gap-2">
                <Clock className="size-3.5 text-primary shrink-0" />
                <span className="truncate font-medium">{club.schedule}</span>
              </div>
            )}
            {club.location && (
              <div className="flex items-center gap-2">
                <MapPin className="size-3.5 text-primary shrink-0" />
                <span className="truncate font-medium">{club.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer enlace al canal */}
        <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-sm font-bold text-primary">
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">
            Ver canal del club
          </span>
          <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md group-hover:shadow-primary/20 group-hover:translate-x-1.5">
            <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
