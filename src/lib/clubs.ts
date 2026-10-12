/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Clubs Domain Module
 * Manages school clubs, filtered by school, club public feeds,
 * requests for new clubs, and club leader access codes.
 */

export interface SchoolClub {
  id: string;
  slug: string;
  name: string;
  description: string;
  schoolId: string; // "lincoln", "east", "roosevelt", "north", "hoover", "all"
  schoolName: string;
  imageUrl: string;
  schedule: string;
  location: string;
  leaderName: string;
  leaderEmail: string;
  joinUrl?: string;
  accessCode: string;
  category: string;
  status: "active" | "archived";
  createdAt: string;
}

export interface ClubPost {
  id: string;
  clubId: string;
  title: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  keyDates?: Array<{ date: string; title: string }>;
  createdAt: string;
  author: string;
}

export interface ClubRequest {
  id: string;
  leaderName: string;
  leaderEmail: string;
  schoolId: string;
  schoolName: string;
  proposedClubName: string;
  purpose: string;
  joinUrl?: string;
  schedule?: string;
  location?: string;
  category?: string;
  status: "pending" | "approved" | "rejected";
  accessCode?: string;
  createdAt: string;
  reviewNote?: string;
}

const STORAGE_CLUBS_KEY = "dmps_school_clubs_data_v1";
const STORAGE_POSTS_KEY = "dmps_school_club_posts_v1";
const STORAGE_REQUESTS_KEY = "dmps_school_club_requests_v1";

export const INITIAL_CLUBS: SchoolClub[] = [
  {
    id: "club-lincoln-robotics",
    slug: "lincoln-robotics-team",
    name: "Lincoln Robotics & Tech Builders",
    description:
      "Diseño, programación de sensores y construcción de robots competitivos para FIRST Tech Challenge y torneos regionales de Iowa.",
    schoolId: "lincoln",
    schoolName: "Abraham Lincoln High School",
    imageUrl:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
    schedule: "Martes y Jueves · 3:30 PM - 5:15 PM",
    location: "Laboratorio de Ingeniería 214",
    leaderName: "Prof. Marcos Sterling",
    leaderEmail: "m.sterling@dmschools.org",
    joinUrl: "https://lincoln.dmschools.org/activities/robotics",
    accessCode: "CLUB-LINC-ROBOT-8201",
    category: "Tecnología",
    status: "active",
    createdAt: "2026-08-15T10:00:00.000Z",
  },
  {
    id: "club-lincoln-environmental",
    slug: "lincoln-green-earth-society",
    name: "Rails Green Earth & Huerto Escolar",
    description:
      "Iniciativas de reciclaje en el campus, cultivo de hortalizas frescas en el invernadero escolar y proyectos ecológicos para la comunidad del sur de Des Moines.",
    schoolId: "lincoln",
    schoolName: "Abraham Lincoln High School",
    imageUrl:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
    schedule: "Miércoles · 3:45 PM - 4:45 PM",
    location: "Invernadero Escolar y Salón 108",
    leaderName: "Dra. Elena Vasquez",
    leaderEmail: "elena.vasquez@dmschools.org",
    joinUrl: "https://lincoln.dmschools.org/activities/environment",
    accessCode: "CLUB-LINC-GREEN-4192",
    category: "Ciencias",
    status: "active",
    createdAt: "2026-08-20T10:00:00.000Z",
  },
  {
    id: "club-east-latino-union",
    slug: "east-latino-student-union",
    name: "East High Latino Student Union (LSU)",
    description:
      "Espacio de orgullo cultural, liderazgo juvenil, preparación universitaria, tutorías comunitarias y celebración de tradiciones hispanas en East High.",
    schoolId: "east",
    schoolName: "Des Moines East High School",
    imageUrl:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
    schedule: "Lunes y Miércoles · 3:45 PM - 5:00 PM",
    location: "Auditorio Auxiliar B",
    leaderName: "Ana Sofia Morales & Kevin Gomez",
    leaderEmail: "east.lsu@dmschools.org",
    joinUrl: "https://east.dmschools.org/clubs/latino-student-union",
    accessCode: "CLUB-EAST-LSU-9043",
    category: "Cultura",
    status: "active",
    createdAt: "2026-08-18T10:00:00.000Z",
  },
  {
    id: "club-east-drama-arts",
    slug: "east-scarlet-drama-troupe",
    name: "Scarlet Drama & Teatro Musical",
    description:
      "Actuación, escenografía, iluminación teatral y preparación para las grandes producciones de otoño y primavera de East High.",
    schoolId: "east",
    schoolName: "Des Moines East High School",
    imageUrl:
      "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=1200&q=80",
    schedule: "Martes y Jueves · 4:00 PM - 5:30 PM",
    location: "Teatro Principal East High",
    leaderName: "David Thornton",
    leaderEmail: "d.thornton@dmschools.org",
    joinUrl: "https://east.dmschools.org/theatre",
    accessCode: "CLUB-EAST-DRAMA-5182",
    category: "Artes",
    status: "active",
    createdAt: "2026-08-22T10:00:00.000Z",
  },
  {
    id: "club-roosevelt-mock-trial",
    slug: "roosevelt-mock-trial-society",
    name: "Roosevelt Mock Trial & Juicios Simulados",
    description:
      "Formación en argumentación legal, retórica, análisis constitucional y competencia en el torneo estatal de juicios de Iowa.",
    schoolId: "roosevelt",
    schoolName: "Theodore Roosevelt High School",
    imageUrl:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
    schedule: "Martes · 3:30 PM - 5:00 PM",
    location: "Sala de Debates 112",
    leaderName: "Prof. Catherine Myers",
    leaderEmail: "c.myers@dmschools.org",
    joinUrl: "https://roosevelt.dmschools.org/mocktrial",
    accessCode: "CLUB-ROOS-MOCK-3719",
    category: "Liderazgo",
    status: "active",
    createdAt: "2026-08-25T10:00:00.000Z",
  },
  {
    id: "club-north-coding-gaming",
    slug: "north-high-stem-game-dev",
    name: "North High Game Dev & Coding Guild",
    description:
      "Programación en Python y Unity, diseño de videojuegos, ciberseguridad y creación de aplicaciones útiles para los estudiantes del norte de la ciudad.",
    schoolId: "north",
    schoolName: "North High School",
    imageUrl:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
    schedule: "Miércoles · 3:30 PM - 5:00 PM",
    location: "Centro de Cómputo N-3",
    leaderName: "Julian Patel",
    leaderEmail: "julian.patel@dmschools.org",
    joinUrl: "https://north.dmschools.org/stem",
    accessCode: "CLUB-NORT-STEM-7281",
    category: "Tecnología",
    status: "active",
    createdAt: "2026-08-28T10:00:00.000Z",
  },
  {
    id: "club-hoover-world-cultures",
    slug: "hoover-global-ambassadors",
    name: "Hoover Global Ambassadors & Idiomas",
    description:
      "Celebración de las más de 30 lenguas y orígenes culturales representados en Hoover High School: festivales gastronómicos, intercambio y bienvenida a nuevas familias.",
    schoolId: "hoover",
    schoolName: "Hoover High School",
    imageUrl:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80",
    schedule: "Viernes · 3:30 PM - 4:45 PM",
    location: "Salón Internacional 305",
    leaderName: "Mtra. Fátima Al-Husseini",
    leaderEmail: "fatima.husseini@dmschools.org",
    joinUrl: "https://hoover.dmschools.org/global",
    accessCode: "CLUB-HOOV-CULT-1940",
    category: "Cultura",
    status: "active",
    createdAt: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "club-district-student-voice",
    slug: "dmps-district-student-council",
    name: "Consejo de Liderazgo Estudiantil DMPS",
    description:
      "Representantes estudiantiles de todas las escuelas secundarias de Des Moines que colaboran con la junta escolar para mejorar el bienestar de las familias y estudiantes.",
    schoolId: "all",
    schoolName: "Todo el Distrito (DMPS)",
    imageUrl:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    schedule: "Sábados quincenales · 10:00 AM - 12:00 PM",
    location: "Central Academy & Sesiones Híbridas",
    leaderName: "Coordinación de Equidad DMPS",
    leaderEmail: "student.voice@dmschools.org",
    joinUrl: "https://www.dmschools.org/student-voice",
    accessCode: "CLUB-DIST-VOICE-6624",
    category: "Liderazgo",
    status: "active",
    createdAt: "2026-09-05T10:00:00.000Z",
  },
];

export const INITIAL_POSTS: ClubPost[] = [
  {
    id: "post-1",
    clubId: "club-lincoln-robotics",
    title: "¡Primer prototipo listo para el torneo de otoño!",
    content:
      "Esta semana terminamos de calibrar los brazos hidráulicos y el sensor de proximidad en el robot 'SplitterBot V2'. Gracias a todos los miembros por su gran esfuerzo en el taller.",
    imageUrl:
      "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=1200&q=80",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    keyDates: [
      { date: "Octubre 24", title: "Torneo Regional en Grand View University" },
      { date: "Noviembre 07", title: "Presentación abierta a las familias en el gimnasio" },
    ],
    createdAt: "2026-10-08T14:30:00.000Z",
    author: "Prof. Marcos Sterling",
  },
  {
    id: "post-2",
    clubId: "club-lincoln-environmental",
    title: "Cosecha otoñal y preparación de abono ecológico",
    content:
      "Recolectamos más de 40 libras de tomates cherry y acelgas de nuestro huerto escolar, las cuales fueron entregadas al comedor comunitario. Los invitamos este miércoles a sembrar bulbos para la primavera.",
    imageUrl:
      "https://images.unsplash.com/photo-1592417817098-8f3d6eb2252a?auto=format&fit=crop&w=1200&q=80",
    keyDates: [
      { date: "Octubre 18", title: "Jornada de limpieza del campus escolar (Silver Cord)" },
    ],
    createdAt: "2026-10-09T16:00:00.000Z",
    author: "Dra. Elena Vasquez",
  },
  {
    id: "post-3",
    clubId: "club-east-latino-union",
    title: "Gran Noche Cultural y preparación para becas universitarias",
    content:
      "Tuvimos más de 120 asistentes en nuestra noche de bienvenida. Próximamente iniciaremos talleres sabatinos bilingües con la ayuda de exalumnos universitarios para llenar solicitudes FAFSA y becas locales.",
    imageUrl:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    keyDates: [
      { date: "Octubre 29", title: "Taller de Becas Universitarias y FAFSA (Bilingüe)" },
      { date: "Noviembre 15", title: "Festival de Tradiciones en el Auditorio de East" },
    ],
    createdAt: "2026-10-10T11:15:00.000Z",
    author: "Ana Sofia Morales",
  },
  {
    id: "post-4",
    clubId: "club-roosevelt-mock-trial",
    title: "Publicación del caso estatal y asignación de roles",
    content:
      "La Iowa State Bar Association ha publicado el caso oficial de este año (caso civil de responsabilidad ambiental). Las audiciones para roles de testigos y abogados principales continúan este martes.",
    createdAt: "2026-10-11T13:45:00.000Z",
    author: "Catherine Myers",
  },
];

export const INITIAL_REQUESTS: ClubRequest[] = [
  {
    id: "req-1",
    leaderName: "Javier Mendoza",
    leaderEmail: "javier.mendoza@dmschools.org",
    schoolId: "lincoln",
    schoolName: "Abraham Lincoln High School",
    proposedClubName: "Club de Ajedrez y Estrategia Rails",
    purpose:
      "Promover la concentración, táctica y competencia sana a través del ajedrez para estudiantes de todos los niveles, desde principiantes hasta nivel de torneo.",
    schedule: "Viernes · 3:30 PM - 5:00 PM",
    location: "Biblioteca Lincoln",
    category: "Liderazgo",
    joinUrl: "https://forms.gle/chess-lincoln-example",
    status: "pending",
    createdAt: "2026-10-09T09:12:00.000Z",
  },
  {
    id: "req-2",
    leaderName: "Samantha Miller",
    leaderEmail: "s.miller@dmschools.org",
    schoolId: "east",
    schoolName: "Des Moines East High School",
    proposedClubName: "Club de Fotografía y Periodismo Comunitario",
    purpose:
      "Capacitar a los estudiantes en fotografía digital, edición y narración de historias de la comunidad estudiantil de East High.",
    schedule: "Jueves · 3:45 PM - 4:45 PM",
    location: "Laboratorio de Arte 102",
    category: "Artes",
    joinUrl: "https://east.dmschools.org/photo-club",
    status: "approved",
    accessCode: "CLUB-EAST-FOTO-3391",
    createdAt: "2026-10-05T14:20:00.000Z",
    reviewNote: "Aprobado por el Director de Actividades de East High.",
  },
];

function getStored<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("dmps_clubs_updated", { detail: { key } }));
  } catch {
    // Quota or disabled
  }
}

export function getSchoolName(schoolId: string): string {
  switch (schoolId?.toLowerCase()) {
    case "lincoln":
      return "Abraham Lincoln High School";
    case "east":
      return "Des Moines East High School";
    case "roosevelt":
      return "Theodore Roosevelt High School";
    case "north":
      return "North High School";
    case "hoover":
      return "Hoover High School";
    case "all":
    case "district":
      return "Todo el Distrito (DMPS)";
    default:
      return schoolId ? schoolId.charAt(0).toUpperCase() + schoolId.slice(1) : "DMPS";
  }
}

export function generateAccessCode(schoolId: string, clubName: string): string {
  const schoolPrefix = (schoolId || "DMPS").slice(0, 4).toUpperCase();
  const cleanName = clubName
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 5)
    .toUpperCase();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `CLUB-${schoolPrefix}-${cleanName}-${randomSuffix}`;
}

export async function fetchClubs(filters?: {
  schoolId?: string;
  search?: string;
  category?: string;
}): Promise<SchoolClub[]> {
  const allClubs = getStored<SchoolClub[]>(STORAGE_CLUBS_KEY, INITIAL_CLUBS);

  let filtered = allClubs.filter((c) => c.status !== "archived");

  if (filters?.schoolId && filters.schoolId !== "all") {
    filtered = filtered.filter(
      (c) => c.schoolId === filters.schoolId || c.schoolId === "all" || c.schoolId === "district"
    );
  }

  if (filters?.category && filters.category !== "all" && filters.category !== "Todos") {
    filtered = filtered.filter(
      (c) => c.category.toLowerCase() === filters.category!.toLowerCase()
    );
  }

  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.schoolName.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }

  return filtered;
}

export async function fetchClubBySlug(slug: string): Promise<SchoolClub | null> {
  const allClubs = getStored<SchoolClub[]>(STORAGE_CLUBS_KEY, INITIAL_CLUBS);
  return allClubs.find((c) => c.slug === slug || c.id === slug) || null;
}

export async function fetchClubByAccessCode(accessCode: string): Promise<SchoolClub | null> {
  if (!accessCode || !accessCode.trim()) return null;
  const cleanCode = accessCode.trim().toUpperCase();
  const allClubs = getStored<SchoolClub[]>(STORAGE_CLUBS_KEY, INITIAL_CLUBS);
  return allClubs.find((c) => c.accessCode.trim().toUpperCase() === cleanCode) || null;
}

export async function updateClub(
  clubId: string,
  updates: Partial<SchoolClub>
): Promise<SchoolClub> {
  const allClubs = getStored<SchoolClub[]>(STORAGE_CLUBS_KEY, INITIAL_CLUBS);
  const idx = allClubs.findIndex((c) => c.id === clubId);
  if (idx < 0) throw new Error("Club no encontrado");

  const updated: SchoolClub = {
    ...allClubs[idx],
    ...updates,
  };
  allClubs[idx] = updated;
  setStored(STORAGE_CLUBS_KEY, allClubs);
  return updated;
}

export async function fetchClubPosts(clubId: string): Promise<ClubPost[]> {
  const allPosts = getStored<ClubPost[]>(STORAGE_POSTS_KEY, INITIAL_POSTS);
  return allPosts
    .filter((p) => p.clubId === clubId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createClubPost(
  clubId: string,
  postData: Omit<ClubPost, "id" | "clubId" | "createdAt">
): Promise<ClubPost> {
  const allPosts = getStored<ClubPost[]>(STORAGE_POSTS_KEY, INITIAL_POSTS);
  const newPost: ClubPost = {
    id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    clubId,
    title: postData.title,
    content: postData.content,
    imageUrl: postData.imageUrl,
    videoUrl: postData.videoUrl,
    keyDates: postData.keyDates,
    author: postData.author || "Líder de Club",
    createdAt: new Date().toISOString(),
  };

  allPosts.unshift(newPost);
  setStored(STORAGE_POSTS_KEY, allPosts);
  return newPost;
}

export async function deleteClubPost(postId: string): Promise<boolean> {
  const allPosts = getStored<ClubPost[]>(STORAGE_POSTS_KEY, INITIAL_POSTS);
  const filtered = allPosts.filter((p) => p.id !== postId);
  setStored(STORAGE_POSTS_KEY, filtered);
  return true;
}

export async function submitClubRequest(
  data: Omit<ClubRequest, "id" | "status" | "createdAt" | "schoolName">
): Promise<ClubRequest> {
  const allRequests = getStored<ClubRequest[]>(STORAGE_REQUESTS_KEY, INITIAL_REQUESTS);
  const newReq: ClubRequest = {
    id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    leaderName: data.leaderName,
    leaderEmail: data.leaderEmail,
    schoolId: data.schoolId,
    schoolName: getSchoolName(data.schoolId),
    proposedClubName: data.proposedClubName,
    purpose: data.purpose,
    joinUrl: data.joinUrl,
    schedule: data.schedule,
    location: data.location,
    category: data.category || "General",
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  allRequests.unshift(newReq);
  setStored(STORAGE_REQUESTS_KEY, allRequests);
  return newReq;
}

export async function fetchClubRequests(statusFilter?: string): Promise<ClubRequest[]> {
  const allRequests = getStored<ClubRequest[]>(STORAGE_REQUESTS_KEY, INITIAL_REQUESTS);
  if (!statusFilter || statusFilter === "all") return allRequests;
  return allRequests.filter((r) => r.status === statusFilter);
}

export async function approveClubRequest(
  requestId: string,
  overrides?: Partial<ClubRequest>
): Promise<{ club: SchoolClub; accessCode: string }> {
  const allRequests = getStored<ClubRequest[]>(STORAGE_REQUESTS_KEY, INITIAL_REQUESTS);
  const allClubs = getStored<SchoolClub[]>(STORAGE_CLUBS_KEY, INITIAL_CLUBS);

  const reqIndex = allRequests.findIndex((r) => r.id === requestId);
  if (reqIndex < 0) throw new Error("Solicitud no encontrada");

  const req = { ...allRequests[reqIndex], ...(overrides || {}) };
  const accessCode = generateAccessCode(req.schoolId, req.proposedClubName);

  const slug = req.proposedClubName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const newClub: SchoolClub = {
    id: `club-${Date.now()}`,
    slug: `${slug}-${Math.random().toString(36).slice(2, 5)}`,
    name: req.proposedClubName,
    description: req.purpose,
    schoolId: req.schoolId,
    schoolName: getSchoolName(req.schoolId),
    imageUrl:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    schedule: req.schedule || "Por definir con los miembros",
    location: req.location || "Por definir",
    leaderName: req.leaderName,
    leaderEmail: req.leaderEmail,
    joinUrl: req.joinUrl,
    accessCode,
    category: req.category || "Liderazgo",
    status: "active",
    createdAt: new Date().toISOString(),
  };

  allClubs.unshift(newClub);
  setStored(STORAGE_CLUBS_KEY, allClubs);

  allRequests[reqIndex] = {
    ...req,
    status: "approved",
    accessCode,
    reviewNote: "Aprobado por el Administrador. Club creado automáticamente.",
  };
  setStored(STORAGE_REQUESTS_KEY, allRequests);

  return { club: newClub, accessCode };
}

export async function rejectClubRequest(requestId: string, reason?: string): Promise<boolean> {
  const allRequests = getStored<ClubRequest[]>(STORAGE_REQUESTS_KEY, INITIAL_REQUESTS);
  const idx = allRequests.findIndex((r) => r.id === requestId);
  if (idx < 0) return false;

  allRequests[idx] = {
    ...allRequests[idx],
    status: "rejected",
    reviewNote: reason || "Rechazado por el Administrador.",
  };
  setStored(STORAGE_REQUESTS_KEY, allRequests);
  return true;
}
