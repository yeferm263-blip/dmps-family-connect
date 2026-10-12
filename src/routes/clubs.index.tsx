import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Sparkles, Users, Filter, School } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { ClubCard } from "@/components/club-card";
import { RequestClubModal } from "@/components/request-club-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchClubs, type SchoolClub } from "@/lib/clubs";
import { useSchool } from "@/lib/school";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/clubs/")({
  head: () => ({
    meta: [
      { title: "Clubs y Actividades Estudiantiles — DMPS Family Info" },
      {
        name: "description",
        content:
          "Explora los clubs escolares, liderazgo, tecnología, artes y grupos estudiantiles de Des Moines Public Schools.",
      },
    ],
  }),
  component: ClubsIndexPage,
});

const CATEGORIES = [
  "Todos",
  "Tecnología",
  "Cultura",
  "Artes",
  "Liderazgo",
  "Ciencias",
  "Deportes / Recreación",
];

function ClubsIndexPage() {
  const { t, lang } = useI18n();
  const { selectedSchool, setSelectedSchool, schools } = useSchool();
  const [clubs, setClubs] = useState<SchoolClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchClubs({
        schoolId: selectedSchool.id,
        search,
        category: selectedCategory,
      });
      setClubs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();

    const handleUpdate = () => void loadData();
    window.addEventListener("dmps_clubs_updated", handleUpdate);
    return () => window.removeEventListener("dmps_clubs_updated", handleUpdate);
  }, [selectedSchool.id, search, selectedCategory]);

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Header Hero */}
        <div className="rounded-3xl border border-primary/20 bg-linear-to-b from-primary/10 via-primary/5 to-transparent p-6 sm:p-10 text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary mb-4 shadow-2xs">
            <Users className="size-3.5" />
            <span>Comunidad Estudiantil · DMPS High Schools</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Clubs Escolares y Liderazgo
          </h1>

          <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Descubre las actividades extracurriculares, agrupaciones de robótica, colectivos culturales y espacios de liderazgo en{" "}
            <strong className="text-foreground">{selectedSchool.name}</strong> y en todo el distrito.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <RequestClubModal
              defaultSchoolId={selectedSchool.id}
              trigger={
                <Button className="rounded-xl min-h-11 px-5 font-bold gap-2 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90">
                  <Sparkles className="size-4" />
                  <span>Solicitar Plaza para un Club</span>
                </Button>
              }
            />
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="mt-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, tema o actividades..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-2xl min-h-11 bg-card"
              />
            </div>

            {/* School Switcher Pill Indicator */}
            <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-semibold text-muted-foreground bg-secondary/80 px-3 py-2 rounded-xl border border-border/60">
              <School className="size-4 text-primary shrink-0" />
              <span>Escuela:</span>
              <span className="font-bold text-foreground">{selectedSchool.shortName}</span>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="-mx-4 px-4 overflow-x-auto pb-2 scrollbar-none sm:mx-0 sm:px-0">
            <div className="flex gap-2 min-w-max">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Clubs Grid */}
        <main className="mt-8">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 rounded-2xl bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : clubs.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {clubs.map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center space-y-4 bg-card">
              <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
                <Users className="size-7" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                No encontramos clubs con estos filtros
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Prueba buscando otro término o proponiendo un nuevo club para{" "}
                {selectedSchool.name}.
              </p>
              <div className="pt-2">
                <RequestClubModal
                  defaultSchoolId={selectedSchool.id}
                  trigger={
                    <Button variant="outline" className="rounded-xl min-h-10 text-xs font-bold">
                      <Sparkles className="size-3.5 mr-1.5" />
                      Proponer nuevo club
                    </Button>
                  }
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </PublicShell>
  );
}
