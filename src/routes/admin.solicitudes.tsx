/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Edit2,
  ExternalLink,
  Inbox,
  Mail,
  MapPin,
  School,
  Sparkles,
  Users,
  XCircle,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import { CrudManager } from "@/components/admin/crud-manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  fetchClubRequests,
  approveClubRequest,
  rejectClubRequest,
  type ClubRequest,
} from "@/lib/clubs";

export const Route = createFileRoute("/admin/solicitudes")({
  component: AdminSolicitudesPage,
});

function AdminSolicitudesPage() {
  const [activeTab, setActiveTab] = useState<"clubs" | "families">("clubs");
  const [clubRequests, setClubRequests] = useState<ClubRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Approval modal state
  const [approvalModal, setApprovalModal] = useState<{
    open: boolean;
    clubName: string;
    accessCode: string;
    leaderName: string;
    leaderEmail: string;
  }>({
    open: false,
    clubName: "",
    accessCode: "",
    leaderName: "",
    leaderEmail: "",
  });

  // Edit modal state
  const [editingRequest, setEditingRequest] = useState<ClubRequest | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await fetchClubRequests(statusFilter);
      setClubRequests(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
    const handleUpdate = () => void loadRequests();
    window.addEventListener("dmps_clubs_updated", handleUpdate);
    return () => window.removeEventListener("dmps_clubs_updated", handleUpdate);
  }, [statusFilter]);

  const handleQuickApprove = async (req: ClubRequest) => {
    try {
      const { club, accessCode } = await approveClubRequest(req.id);
      setApprovalModal({
        open: true,
        clubName: club.name,
        accessCode,
        leaderName: req.leaderName,
        leaderEmail: req.leaderEmail,
      });
      toast.success(`¡Club "${club.name}" aprobado y creado!`);
      void loadRequests();
    } catch {
      toast.error("Error al aprobar la solicitud");
    }
  };

  const handleSaveEditAndApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest) return;
    try {
      const { club, accessCode } = await approveClubRequest(editingRequest.id, {
        proposedClubName: editingRequest.proposedClubName,
        leaderName: editingRequest.leaderName,
        leaderEmail: editingRequest.leaderEmail,
        purpose: editingRequest.purpose,
        schedule: editingRequest.schedule,
        location: editingRequest.location,
        category: editingRequest.category,
        joinUrl: editingRequest.joinUrl,
      });
      setEditingRequest(null);
      setApprovalModal({
        open: true,
        clubName: club.name,
        accessCode,
        leaderName: editingRequest.leaderName,
        leaderEmail: editingRequest.leaderEmail,
      });
      toast.success(`¡Club "${club.name}" aprobado y creado con los cambios!`);
      void loadRequests();
    } catch {
      toast.error("Error al guardar y aprobar la solicitud");
    }
  };

  const handleReject = async (req: ClubRequest) => {
    if (confirm(`¿Estás seguro de rechazar la solicitud para "${req.proposedClubName}"?`)) {
      try {
        await rejectClubRequest(req.id, "Revisado y rechazado por el administrador.");
        toast.info("Solicitud marcada como rechazada");
        void loadRequests();
      } catch {
        toast.error("Error al rechazar");
      }
    }
  };

  const copyCode = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      toast.success("¡Código de acceso copiado al portapapeles!");
    }
  };

  const pendingCount = clubRequests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header and Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Bandeja de Solicitudes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona propuestas de clubs escolares y reportes recibidos desde el portal público.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-2xl bg-secondary p-1 border border-border/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("clubs")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "clubs"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="size-3.5 text-primary" />
            <span>Plazas de Clubs</span>
            {pendingCount > 0 && (
              <span className="rounded-full bg-amber-500 px-2 py-0.2 text-[10px] font-extrabold text-white">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("families")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "families"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Inbox className="size-3.5" />
            <span>Reportes de Familias</span>
          </button>
        </div>
      </div>

      {activeTab === "clubs" ? (
        <div className="space-y-6">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {[
                { id: "all", label: "Todas" },
                { id: "pending", label: "Pendientes", badge: pendingCount },
                { id: "approved", label: "Aprobadas" },
                { id: "rejected", label: "Rechazadas" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    statusFilter === tab.id
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {tab.label}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="ml-1.5 rounded-full bg-white/25 px-1.5 py-0.5 text-[10px]">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Mostrando {clubRequests.length}{" "}
              {clubRequests.length === 1 ? "solicitud" : "solicitudes"}
            </p>
          </div>

          {/* List of Club Requests */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-44 rounded-2xl bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : clubRequests.length > 0 ? (
            <div className="space-y-4">
              {clubRequests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-4 transition-all hover:border-primary/40"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                          <School className="size-3" />
                          <span>{req.schoolName}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-secondary-foreground">
                          {req.category || "General"}
                        </span>
                        {req.status === "pending" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                            <Clock className="size-3" />
                            <span>Pendiente de Aprobación</span>
                          </span>
                        )}
                        {req.status === "approved" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="size-3" />
                            <span>Aprobada</span>
                          </span>
                        )}
                        {req.status === "rejected" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 text-xs font-bold text-rose-700 dark:text-rose-400">
                            <XCircle className="size-3" />
                            <span>Rechazada</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-extrabold text-foreground tracking-tight pt-1">
                        {req.proposedClubName}
                      </h3>
                    </div>

                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      Recibido:{" "}
                      {new Date(req.createdAt).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Purpose / Activities Description */}
                  <div className="rounded-2xl bg-secondary/40 p-4 border border-border/40 text-sm leading-relaxed text-foreground/90">
                    <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1">
                      Propósito y actividades propuestas:
                    </p>
                    <p>{req.purpose}</p>
                  </div>

                  {/* Leader and meeting details grid */}
                  <div className="grid gap-3 sm:grid-cols-3 text-xs text-muted-foreground border-y border-border/60 py-3">
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-primary shrink-0" />
                      <span className="truncate">
                        Líder: <strong className="text-foreground">{req.leaderName}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="size-4 text-primary shrink-0" />
                      <a
                        href={`mailto:${req.leaderEmail}`}
                        className="truncate text-primary font-semibold hover:underline"
                      >
                        {req.leaderEmail}
                      </a>
                    </div>

                    {req.schedule && (
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-primary shrink-0" />
                        <span className="truncate">{req.schedule}</span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons & access code display */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    {req.status === "approved" && req.accessCode ? (
                      <div className="flex items-center gap-2 text-xs bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                        <KeyRound className="size-4 text-emerald-600" />
                        <span className="font-semibold text-foreground">Código de Líder:</span>
                        <code className="font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-background px-2 py-0.5 rounded border border-border">
                          {req.accessCode}
                        </code>
                        <button
                          type="button"
                          onClick={() => copyCode(req.accessCode!)}
                          className="text-muted-foreground hover:text-foreground cursor-pointer ml-1"
                          title="Copiar código"
                        >
                          <Copy className="size-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        {req.reviewNote || "Pendiente de revisión administrativa."}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      {req.joinUrl && (
                        <a
                          href={req.joinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-input px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
                        >
                          <span>Ver enlace</span>
                          <ExternalLink className="size-3" />
                        </a>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingRequest(req)}
                        className="rounded-xl text-xs font-bold gap-1.5"
                      >
                        <Edit2 className="size-3.5" />
                        <span>Editar datos</span>
                      </Button>

                      {req.status === "pending" && (
                        <>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleReject(req)}
                            className="rounded-xl text-xs font-bold"
                          >
                            Rechazar
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => handleQuickApprove(req)}
                            className="rounded-xl text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <Check className="size-4" />
                            <span>Aprobar y Crear Club</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center space-y-3 bg-card">
              <Sparkles className="mx-auto size-8 text-muted-foreground" />
              <h3 className="text-lg font-bold">No hay solicitudes en esta sección</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Cuando los estudiantes o maestros envíen una solicitud desde el sitio público,
                aparecerán listadas aquí para tu aprobación.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Original Update Requests CrudManager */
        <CrudManager
          table="update_requests"
          title="Solicitudes de las familias"
          description="Reportes de información desactualizada o enlaces rotos enviados desde el sitio público."
          orderBy="created_at"
          columns={[
            { name: "kind", label: "Tipo" },
            { name: "page_url", label: "Página" },
            { name: "status", label: "Estado" },
            { name: "created_at", label: "Recibido" },
          ]}
          defaults={{ kind: "update", message: "", status: "open" }}
          fields={[
            {
              name: "status",
              label: "Estado",
              type: "select",
              options: [
                { value: "open", label: "Pendiente" },
                { value: "in_progress", label: "En proceso" },
                { value: "resolved", label: "Resuelta" },
                { value: "dismissed", label: "Descartada" },
              ],
            },
            { name: "message", label: "Mensaje", type: "textarea" },
            { name: "resolution_note", label: "Nota de resolución", type: "textarea" },
          ]}
        />
      )}

      {/* Dialog after approving a club (Generates unique access code) */}
      <Dialog
        open={approvalModal.open}
        onChange={(isOpen: boolean) => setApprovalModal((prev) => ({ ...prev, open: isOpen }))}
      >
        <DialogContent className="max-w-md sm:rounded-3xl p-6 sm:p-8">
          <DialogHeader className="text-center space-y-2">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 mb-1">
              <CheckCircle2 className="size-8" />
            </div>
            <DialogTitle className="text-2xl font-extrabold tracking-tight">
              ¡Club Creado Exitosamente!
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              El club <strong>{approvalModal.clubName}</strong> ya está disponible en la
              biblioteca pública.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Código de Acceso Único para el Líder
              </span>
              <div className="flex items-center justify-center gap-2">
                <code className="font-mono text-lg font-extrabold text-foreground bg-background px-3 py-1.5 rounded-xl border border-border shadow-2xs tracking-wider">
                  {approvalModal.accessCode}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyCode(approvalModal.accessCode)}
                  className="rounded-xl"
                  title="Copiar código"
                >
                  <Copy className="size-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                Comparte este código con <strong>{approvalModal.leaderName}</strong> (
                {approvalModal.leaderEmail}) para que acceda a su portal de club.
              </p>
            </div>

            <div className="pt-2">
              <Button
                onClick={() => setApprovalModal((prev) => ({ ...prev, open: false }))}
                className="w-full rounded-xl min-h-11 font-bold"
              >
                Entendido
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit request modal before approving */}
      {editingRequest && (
        <Dialog
          open={Boolean(editingRequest)}
          onChange={(isOpen: boolean) => {
            if (!isOpen) setEditingRequest(null);
          }}
        >
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto sm:rounded-3xl p-6 sm:p-8">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-xl font-bold">
                Editar Datos de la Solicitud
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Afina los detalles del club antes de autorizar su publicación oficial.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveEditAndApprove} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Nombre Oficial del Club
                </label>
                <Input
                  required
                  value={editingRequest.proposedClubName}
                  onChange={(e) =>
                    setEditingRequest({ ...editingRequest, proposedClubName: e.target.value })
                  }
                  className="rounded-xl font-semibold"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    Nombre del Líder
                  </label>
                  <Input
                    required
                    value={editingRequest.leaderName}
                    onChange={(e) =>
                      setEditingRequest({ ...editingRequest, leaderName: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    Correo del Líder
                  </label>
                  <Input
                    required
                    type="email"
                    value={editingRequest.leaderEmail}
                    onChange={(e) =>
                      setEditingRequest({ ...editingRequest, leaderEmail: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Propósito y Actividades
                </label>
                <Textarea
                  required
                  rows={3}
                  value={editingRequest.purpose}
                  onChange={(e) =>
                    setEditingRequest({ ...editingRequest, purpose: e.target.value })
                  }
                  className="rounded-xl resize-none text-sm"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    Horario de Reunión
                  </label>
                  <Input
                    value={editingRequest.schedule || ""}
                    onChange={(e) =>
                      setEditingRequest({ ...editingRequest, schedule: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    Lugar de Reunión
                  </label>
                  <Input
                    value={editingRequest.location || ""}
                    onChange={(e) =>
                      setEditingRequest({ ...editingRequest, location: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Enlace para Unirse
                </label>
                <Input
                  type="url"
                  value={editingRequest.joinUrl || ""}
                  onChange={(e) =>
                    setEditingRequest({ ...editingRequest, joinUrl: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingRequest(null)}
                  className="rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Guardar y Aprobar Club
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
