import { useState } from "react";
import { Sparkles, Send, CheckCircle2, School, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitClubRequest } from "@/lib/clubs";
import { useSchool } from "@/lib/school";

const SCHOOL_OPTIONS = [
  { id: "lincoln", name: "Abraham Lincoln High School" },
  { id: "east", name: "Des Moines East High School" },
  { id: "roosevelt", name: "Theodore Roosevelt High School" },
  { id: "north", name: "North High School" },
  { id: "hoover", name: "Hoover High School" },
  { id: "all", name: "Todo el Distrito (DMPS / Central Academy)" },
];

const CATEGORY_OPTIONS = [
  "Tecnología",
  "Cultura",
  "Artes",
  "Liderazgo",
  "Ciencias",
  "Deportes / Recreación",
  "Servicio Comunitario",
  "Académico",
];

export function RequestClubModal({
  trigger,
  defaultSchoolId,
}: {
  trigger?: React.ReactNode;
  defaultSchoolId?: string;
}) {
  const { selectedSchool } = useSchool();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form fields
  const [leaderName, setLeaderName] = useState("");
  const [leaderEmail, setLeaderEmail] = useState("");
  const [schoolId, setSchoolId] = useState(
    defaultSchoolId || (selectedSchool.id !== "all" ? selectedSchool.id : "lincoln")
  );
  const [proposedClubName, setProposedClubName] = useState("");
  const [category, setCategory] = useState("Liderazgo");
  const [purpose, setPurpose] = useState("");
  const [schedule, setSchedule] = useState("");
  const [location, setLocation] = useState("");
  const [joinUrl, setJoinUrl] = useState("");

  const resetForm = () => {
    setLeaderName("");
    setLeaderEmail("");
    setProposedClubName("");
    setPurpose("");
    setSchedule("");
    setLocation("");
    setJoinUrl("");
    setSubmitted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaderName.trim() || !leaderEmail.trim() || !proposedClubName.trim() || !purpose.trim()) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    setSubmitting(true);
    try {
      await submitClubRequest({
        leaderName: leaderName.trim(),
        leaderEmail: leaderEmail.trim(),
        schoolId,
        proposedClubName: proposedClubName.trim(),
        category,
        purpose: purpose.trim(),
        schedule: schedule.trim() || undefined,
        location: location.trim() || undefined,
        joinUrl: joinUrl.trim() || undefined,
      });

      setSubmitted(true);
      toast.success("¡Solicitud enviada con éxito!", {
        description: "El equipo de administración revisará la propuesta de tu club.",
      });
    } catch {
      toast.error("Ocurrió un error al enviar la solicitud.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onChange={(isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) setTimeout(resetForm, 300);
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <button
            type="button"
            className="text-start text-xs font-semibold text-primary hover:underline cursor-pointer inline-flex items-center gap-1.5"
          >
            <Sparkles className="size-3.5" />
            <span>Solicitar plaza para tu club</span>
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto sm:rounded-3xl p-6 sm:p-8">
        <DialogHeader className="space-y-2 text-left">
          <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-1">
            <Sparkles className="size-5" />
          </div>
          <DialogTitle className="text-2xl font-extrabold tracking-tight">
            Solicitar Plaza para Club Escolar
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Propón un nuevo club o actividad estudiantil para tu escuela. Las propuestas son
            revisadas por la administración escolar antes de publicarse en la biblioteca oficial.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="size-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground">¡Solicitud recibida!</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Hemos registrado la propuesta para <strong>{proposedClubName}</strong>. El
              administrador escolar revisará los detalles y te otorgará el código de acceso como
              Líder de Club una vez aprobada.
            </p>
            <div className="pt-4">
              <Button
                onClick={() => setOpen(false)}
                className="rounded-xl px-6 min-h-11 font-bold"
              >
                Cerrar
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Nombre del líder / responsable *
                </label>
                <Input
                  required
                  placeholder="Ej. Prof. García o Ana Morales"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Correo electrónico institucional *
                </label>
                <Input
                  required
                  type="email"
                  placeholder="ejemplo@dmschools.org"
                  value={leaderEmail}
                  onChange={(e) => setLeaderEmail(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Escuela a la que pertenece *
                </label>
                <select
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-medium shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {SCHOOL_OPTIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Categoría del club *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-medium shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Nombre propuesto para el club *
              </label>
              <Input
                required
                placeholder="Ej. Club de Robótica Lincoln o Unión Estudiantil"
                value={proposedClubName}
                onChange={(e) => setProposedClubName(e.target.value)}
                className="rounded-xl font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Propósito, actividades o qué se hace *
              </label>
              <Textarea
                required
                rows={3}
                placeholder="Describe el objetivo del club, proyectos que realizarán y a qué estudiantes está dirigido..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="rounded-xl resize-none text-sm leading-relaxed"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Horario de reunión propuesto
                </label>
                <Input
                  placeholder="Ej. Jueves · 3:30 PM - 5:00 PM"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Lugar de reunión
                </label>
                <Input
                  placeholder="Ej. Salón 214 o Biblioteca"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Enlace para unirse, formulario o red social
              </label>
              <Input
                type="url"
                placeholder="https://forms.gle/... o sitio web"
                value={joinUrl}
                onChange={(e) => setJoinUrl(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="rounded-xl min-h-11"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-xl min-h-11 font-bold gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="size-4" />
                <span>{submitting ? "Enviando..." : "Enviar Solicitud"}</span>
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
