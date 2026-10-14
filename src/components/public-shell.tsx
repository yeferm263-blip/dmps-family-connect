/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- imported code with loose typing; checked at runtime
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Building2,
  ChevronDown,
  ExternalLink,
  GraduationCap,
  HeartHandshake,
  Menu,
  Phone,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { AnnouncementTicker } from "@/components/announcement-ticker";
import { CategoryIcon } from "@/components/category-icon";
import { TrustpilotReviewButton } from "@/components/help/trustpilot-review-button";
import { NavigationIcon } from "@/components/navigation-icon";

import { openAppTutorial } from "@/components/onboarding-tutorial";
import { LanguageSelector } from "@/components/language-selector";
import { SchoolSelectorButton } from "@/components/school-selector-button";
import { SearchInput } from "@/components/search-input";
import { SiteLogo } from "@/components/site-logo";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  fetchActiveAnnouncements,
  fetchCategories,
  fetchPublishedArticles,
  fetchSettings,
  localizedArticle,
  localizedCategory,
} from "@/lib/content";
import { NGOT_ARTICLES } from "@/lib/ngot-articles";
import { shortArticleTitle } from "@/lib/article-menu-title";

import { NGOT_TEAMS } from "@/lib/ngot-teams";
import { useI18n } from "@/lib/i18n";
import { useSchool } from "@/lib/school";
import { fetchPublicMenuItems, localizedMenuItem, type PublicMenuItem } from "@/lib/navigation";
import { fetchSocialMediaChannels, type SocialMediaChannel } from "@/lib/social-media";
import { SocialPlatformIcon } from "@/components/social-media-icons";

/** Programmatically open or close the mobile menu sheet */
export function toggleAppMenu(openState?: boolean) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("dmps_set_menu_open", { detail: { open: openState } }));
  }
}

export function PublicShell({ children }: { children: ReactNode }) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const queryClient = useQueryClient();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Listen for programmatic menu open/close events
  useEffect(() => {
    const handleMenuEvent = (e: Event) => {
      const custom = e as CustomEvent<{ open?: boolean }>;
      if (typeof custom.detail?.open === "boolean") {
        setOpen(custom.detail.open);
      } else {
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("dmps_set_menu_open", handleMenuEvent);
    return () => window.removeEventListener("dmps_set_menu_open", handleMenuEvent);
  }, []);

  // Listen for real-time navigation and social media updates from admin
  useEffect(() => {
    const handleNavUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["public_menu_items"] });
    };
    const handleContentUpdate = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (!detail?.table || detail.table.startsWith("social_media")) {
        queryClient.invalidateQueries({ queryKey: ["social_media_channels_public"] });
      }
      if (!detail?.table || detail.table.startsWith("public_menu")) {
        queryClient.invalidateQueries({ queryKey: ["public_menu_items"] });
      }
    };
    window.addEventListener("dmps_navigation_updated", handleNavUpdate);
    window.addEventListener("dmps_content_updated", handleContentUpdate);
    return () => {
      window.removeEventListener("dmps_navigation_updated", handleNavUpdate);
      window.removeEventListener("dmps_content_updated", handleContentUpdate);
    };
  }, [queryClient]);

  const { selectedSchool } = useSchool();
  const { data: categories } = useQuery({
    queryKey: ["categories", selectedSchool.id],
    queryFn: () => fetchCategories(selectedSchool.id),
  });
  const { data: announcements } = useQuery({
    queryKey: ["announcements", selectedSchool.id],
    queryFn: () => fetchActiveAnnouncements(selectedSchool.id),
  });
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const { data: articles } = useQuery({
    queryKey: ["articles", selectedSchool.id],
    queryFn: () => fetchPublishedArticles(undefined, selectedSchool.id, { light: true }),
  });

  // Active social media channels configured from admin
  const { data: socialChannels = [] } = useQuery({
    queryKey: ["social_media_channels_public"],
    queryFn: async () => {
      const channels = await fetchSocialMediaChannels();
      return channels.filter((c) => c.is_active);
    },
  });

  // Dynamic editable navigation menu items
  const { data: menuItems = [] } = useQuery({
    queryKey: ["public_menu_items", selectedSchool.id],
    queryFn: () => fetchPublicMenuItems(selectedSchool.id),
  });

  const headerNavItems = useMemo(() => {
    return menuItems
      .filter(
        (item) =>
          item.section === "main_header" &&
          item.is_visible &&
          (!item.school_id ||
            item.school_id === "all" ||
            item.school_id === "district" ||
            item.school_id === selectedSchool.id),
      )
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  }, [menuItems, selectedSchool.id]);

  const resourceDropdownItems = useMemo(() => {
    return menuItems
      .filter(
        (item) =>
          item.section === "resources_dropdown" &&
          item.is_visible &&
          (!item.school_id ||
            item.school_id === "all" ||
            item.school_id === "district" ||
            item.school_id === selectedSchool.id),
      )
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  }, [menuItems, selectedSchool.id]);

  const footerLinks = useMemo(() => {
    return menuItems
      .filter(
        (item) =>
          item.section === "footer_links" &&
          item.is_visible &&
          (!item.school_id ||
            item.school_id === "all" ||
            item.school_id === "district" ||
            item.school_id === selectedSchool.id),
      )
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  }, [menuItems, selectedSchool.id]);

  const categorizedFooterLinks = useMemo(() => {
    const categories: {
      key: "academic" | "services" | "community";
      titleEs: string;
      titleEn: string;
      titleKar: string;
      icon: typeof GraduationCap;
      items: PublicMenuItem[];
    }[] = [
      {
        key: "academic",
        titleEs: "Académico y Calendario",
        titleEn: "Academic & Calendar",
        titleKar: "မုၢ်နံၤမုၢ်သီ ဒီးတၢ်မၤလိ",
        icon: GraduationCap,
        items: [],
      },
      {
        key: "services",
        titleEs: "Servicios y Apoyo Familiar",
        titleEn: "Family Services & Support",
        titleKar: "တၢ်မၤစၢၤဟံၣ်ဖိဃီဖိ",
        icon: HeartHandshake,
        items: [],
      },
      {
        key: "community",
        titleEs: "Comunidad y Contacto",
        titleEn: "Community & Contact",
        titleKar: "ကရူၢ် ဒီးတၢ်ဆဲးကျိး",
        icon: Building2,
        items: [],
      },
    ];

    for (const item of footerLinks) {
      const p = (item.path || "").toLowerCase();
      const id = (item.id || "").toLowerCase();

      if (
        p.includes("calend") ||
        p.includes("horario") ||
        p.includes("bell") ||
        p.includes("program") ||
        p.includes("deport") ||
        p.includes("sport") ||
        p.includes("topic") ||
        p.includes("articul") ||
        id.includes("calendar") ||
        id.includes("bell") ||
        id.includes("sports") ||
        id.includes("program") ||
        id.includes("article")
      ) {
        categories[0]!.items.push(item);
      } else if (
        p.includes("dart") ||
        p.includes("transport") ||
        p.includes("app") ||
        p.includes("bfl") ||
        p.includes("volunt") ||
        p.includes("faq") ||
        p.includes("empleo") ||
        p.includes("job") ||
        id.includes("dart") ||
        id.includes("app") ||
        id.includes("bfl") ||
        id.includes("volunt") ||
        id.includes("faq") ||
        id.includes("job")
      ) {
        categories[1]!.items.push(item);
      } else {
        categories[2]!.items.push(item);
      }
    }

    return categories.filter((c) => c.items.length > 0);
  }, [footerLinks]);

  const articleLinks = useMemo(() => {
    const items: { kind: "article" | "guide"; slug: string; title: string }[] = (
      articles ?? []
    ).map((article) => ({
      kind: "article" as const,
      slug: article.slug,
      title: shortArticleTitle(localizedArticle(article, lang, selectedSchool.id).title),
    }));
    if (selectedSchool.id === "lincoln") {
      items.push(
        ...NGOT_ARTICLES.map((a) => ({
          kind: "guide" as const,
          slug: a.slug,
          title: shortArticleTitle(a.title),
        })),
      );
    }
    return items;
  }, [articles, lang, selectedSchool.id]);

  const notice =
    (lang === "es" ? settings?.official_notice_es : settings?.official_notice_en) ??
    t("site.official");

  const isResourceActive =
    pathname === "/calendario" ||
    pathname === "/programas" ||
    pathname === "/programas-estudiantes" ||
    pathname === "/deportes-actividades" ||
    pathname === "/equipos" ||
    pathname.startsWith("/transporte") ||
    pathname === "/announcements" ||
    pathname === "/faq" ||
    pathname === "/voluntarios" ||
    pathname === "/bfl-status" ||
    pathname === "/empleos" ||
    pathname === "/horario-campanas";

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-primary focus:px-4 focus:py-3 focus:font-semibold focus:text-primary-foreground"
      >
        {t("nav.skip")}
      </a>

      {announcements?.length ? (
        <AnnouncementTicker announcements={announcements} schoolId={selectedSchool.id} />
      ) : null}

      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 lg:gap-6">
          <SiteLogo className="min-w-0" />
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <nav aria-label="Main" className="hidden lg:block" data-tutorial="desktop-nav">
              <ul className="flex items-center gap-1.5" data-tutorial="main-menu">
                {headerNavItems.map((item) => {
                  const loc = localizedMenuItem(item, lang);

                  // 1. Resources Dropdown Trigger
                  if (
                    item.id === "nav_resources" ||
                    (item.path === "/programas" && item.id.includes("resources"))
                  ) {
                    return (
                      <li key={item.id}>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className={`group inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs active:scale-[0.98] hover:bg-secondary focus:outline-hidden ${
                              isResourceActive
                                ? "bg-primary-soft text-primary shadow-xs"
                                : "text-foreground/80 hover:text-foreground"
                            }`}
                          >
                            <NavigationIcon
                              name={item.icon || "FolderTree"}
                              className="size-4 shrink-0 opacity-70 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3"
                            />
                            <span>{loc.label || t("nav.resources")}</span>
                            <ChevronDown
                              className="size-4 shrink-0 opacity-70 transition-transform duration-200 group-hover:translate-y-0.5"
                              aria-hidden="true"
                            />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="start"
                            className="w-80 rounded-2xl p-2 shadow-lift animate-menu-pop"
                          >
                            <DropdownMenuLabel className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              {loc.label || t("nav.resourcesMenuLabel")}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="my-1" />

                            {resourceDropdownItems.map((resItem) => {
                              const resLoc = localizedMenuItem(resItem, lang);
                              const isTutorial =
                                resItem.path === "#tutorial" || resItem.path.startsWith("#");
                              const isExt =
                                Boolean(resItem.is_external) || resItem.path.startsWith("http");

                              if (isTutorial) {
                                return (
                                  <DropdownMenuItem asChild key={resItem.id}>
                                    <button
                                      type="button"
                                      onClick={openAppTutorial}
                                      className="flex w-full cursor-pointer items-start gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-secondary"
                                    >
                                      <div
                                        className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg ${
                                          resItem.icon_color || "bg-primary/10 text-primary"
                                        }`}
                                      >
                                        <NavigationIcon
                                          name={resItem.icon || "Compass"}
                                          className="size-4"
                                        />
                                      </div>
                                      <div>
                                        <div className="text-sm font-semibold text-foreground">
                                          {resLoc.label}
                                        </div>
                                        {resLoc.desc && (
                                          <div className="text-xs text-muted-foreground">
                                            {resLoc.desc}
                                          </div>
                                        )}
                                      </div>
                                    </button>
                                  </DropdownMenuItem>
                                );
                              }

                              if (isExt) {
                                return (
                                  <DropdownMenuItem asChild key={resItem.id}>
                                    <a
                                      href={resItem.path}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex cursor-pointer items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-secondary"
                                    >
                                      <div
                                        className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg ${
                                          resItem.icon_color || "bg-primary/10 text-primary"
                                        }`}
                                      >
                                        <NavigationIcon name={resItem.icon} className="size-4" />
                                      </div>
                                      <div>
                                        <div className="text-sm font-semibold text-foreground">
                                          {resLoc.label}
                                        </div>
                                        {resLoc.desc && (
                                          <div className="text-xs text-muted-foreground">
                                            {resLoc.desc}
                                          </div>
                                        )}
                                      </div>
                                    </a>
                                  </DropdownMenuItem>
                                );
                              }

                              return (
                                <DropdownMenuItem asChild key={resItem.id}>
                                  <Link
                                    to={resItem.path as any}
                                    className="flex cursor-pointer items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-secondary"
                                  >
                                    <div
                                      className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg ${
                                        resItem.icon_color || "bg-primary/10 text-primary"
                                      }`}
                                    >
                                      <NavigationIcon name={resItem.icon} className="size-4" />
                                    </div>
                                    <div>
                                      <div className="text-sm font-semibold text-foreground">
                                        {resLoc.label}
                                      </div>
                                      {resLoc.desc && (
                                        <div className="text-xs text-muted-foreground">
                                          {resLoc.desc}
                                        </div>
                                      )}
                                    </div>
                                  </Link>
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </li>
                    );
                  }

                  // 2. Teams Dropdown Trigger (Lincoln High)
                  if (item.id === "nav_teams") {
                    if (selectedSchool.id !== "lincoln") return null;
                    return (
                      <li key={item.id}>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className={`inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-colors hover:bg-secondary focus:outline-hidden ${
                              pathname.startsWith("/equipos") || pathname.startsWith("/guias")
                                ? "bg-primary-soft text-primary"
                                : "text-foreground/80 hover:text-foreground"
                            }`}
                          >
                            <Users className="size-4 shrink-0 opacity-70" aria-hidden="true" />
                            <span>{loc.label || t("nav.teams")}</span>
                            <ChevronDown
                              className="size-4 shrink-0 opacity-70"
                              aria-hidden="true"
                            />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="start"
                            className="w-80 rounded-2xl p-2 shadow-lift"
                          >
                            <DropdownMenuLabel className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              {t("nav.ngotTeams")}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="my-1" />
                            {NGOT_TEAMS.map((team) => (
                              <DropdownMenuItem asChild key={team.slug}>
                                <Link
                                  to="/equipos/$slug"
                                  params={{ slug: team.slug }}
                                  className="flex cursor-pointer items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-secondary"
                                >
                                  <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                                    <Users className="size-4" aria-hidden="true" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-foreground">
                                      {team.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {team.members.filter((m) => m.name).length}{" "}
                                      {t("nav.teamsStaffCount")}
                                    </div>
                                  </div>
                                </Link>
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator className="my-1" />
                            <DropdownMenuItem asChild>
                              <Link
                                to="/equipos"
                                className="flex cursor-pointer items-center gap-2 rounded-xl p-2.5 text-sm font-bold text-primary transition-colors hover:bg-secondary"
                              >
                                {t("nav.viewAllTeamsGuides")}
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </li>
                    );
                  }

                  // 3. Articles Dropdown Trigger
                  if (
                    item.id === "nav_articles" ||
                    (item.path === "/topics" && item.id.includes("articles"))
                  ) {
                    return (
                      <li key={item.id}>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className={`inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-colors hover:bg-secondary focus:outline-hidden ${
                              pathname.startsWith("/topics") || pathname.startsWith("/articles")
                                ? "bg-primary-soft text-primary"
                                : "text-foreground/80 hover:text-foreground"
                            }`}
                          >
                            <BookOpen className="size-4 shrink-0 opacity-70" aria-hidden="true" />
                            <span>{loc.label || t("nav.articles")}</span>
                            <ChevronDown
                              className="size-4 shrink-0 opacity-70"
                              aria-hidden="true"
                            />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="start"
                            className="max-h-[70vh] w-80 overflow-y-auto rounded-2xl p-2 shadow-lift"
                          >
                            <DropdownMenuLabel className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              {loc.label || t("nav.articles")}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="my-1" />
                            {articleLinks.length === 0 ? (
                              <p className="px-3 py-2 text-sm text-muted-foreground">
                                {t("nav.noArticlesYet")}
                              </p>
                            ) : (
                              articleLinks.map((artItem) =>
                                artItem.kind === "guide" ? (
                                  <DropdownMenuItem asChild key={`g-${artItem.slug}`}>
                                    <Link
                                      to="/guias/$slug"
                                      params={{ slug: artItem.slug }}
                                      className="flex cursor-pointer items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-secondary"
                                    >
                                      <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                                        <BookOpen className="size-4" aria-hidden="true" />
                                      </div>
                                      <div className="min-w-0">
                                        <div className="text-sm font-semibold text-foreground">
                                          {artItem.title}
                                        </div>
                                        <div className="truncate text-xs text-muted-foreground">
                                          {t("nav.ninthGradePackage")}
                                        </div>
                                      </div>
                                    </Link>
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem asChild key={`a-${artItem.slug}`}>
                                    <Link
                                      to="/articles/$slug"
                                      params={{ slug: artItem.slug }}
                                      className="flex cursor-pointer items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-secondary"
                                    >
                                      <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                                        <BookOpen className="size-4" aria-hidden="true" />
                                      </div>
                                      <div className="min-w-0">
                                        <div className="text-sm font-semibold text-foreground">
                                          {artItem.title}
                                        </div>
                                      </div>
                                    </Link>
                                  </DropdownMenuItem>
                                ),
                              )
                            )}
                            <DropdownMenuSeparator className="my-1" />
                            <DropdownMenuItem asChild>
                              <Link
                                to="/topics"
                                className="flex cursor-pointer items-center gap-2 rounded-xl p-2.5 text-sm font-bold text-primary transition-colors hover:bg-secondary"
                              >
                                {t("nav.viewAllCategories")}
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </li>
                    );
                  }

                  // 4. Standard Nav Item / External Link / Custom Item
                  const isExternal = Boolean(item.is_external) || item.path.startsWith("http");
                  const isTutorial = item.path === "#tutorial" || item.path.startsWith("#");

                  if (isTutorial) {
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={openAppTutorial}
                          className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
                        >
                          <NavigationIcon name={item.icon} className="size-4 shrink-0 opacity-80" />
                          <span>{loc.label}</span>
                        </button>
                      </li>
                    );
                  }

                  if (isExternal) {
                    return (
                      <li key={item.id}>
                        <a
                          href={item.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <NavigationIcon name={item.icon} className="size-4 shrink-0 opacity-80" />
                          <span>{loc.label}</span>
                        </a>
                      </li>
                    );
                  }

                  return (
                    <li key={item.id}>
                      <Link
                        to={item.path as any}
                        activeOptions={{ exact: item.path === "/" }}
                        className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground data-[status=active]:bg-primary-soft data-[status=active]:text-primary"
                      >
                        {item.icon && item.icon !== "Link2" ? (
                          <NavigationIcon name={item.icon} className="size-4 shrink-0 opacity-80" />
                        ) : null}
                        <span>{loc.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div id="header-school-selector" className="hidden sm:block">
              <SchoolSelectorButton />
            </div>
            <div id="header-language-selector">
              <LanguageSelector />
            </div>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  id="header-menu-button"
                  data-tutorial="main-menu"
                  variant="outline"
                  size="icon"
                  className="min-h-11 min-w-11 rounded-xl lg:hidden"
                  aria-label={t("nav.openMenu")}
                >
                  <Menu className="size-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(23rem,94vw)] overflow-y-auto p-0">
                <div className="border-b border-border p-4">
                  <SheetTitle className="text-lg font-bold">{t("nav.menu")}</SheetTitle>
                </div>
                <nav aria-label="Mobile" className="space-y-7 p-5 pb-12">
                  <SearchInput size="sm" />
                  <div className="border-b border-border pb-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("nav.selectedSchool")}
                    </p>
                    <SchoolSelectorButton className="w-full justify-between" />
                  </div>

                  {/* Mobile Header Main Links */}
                  <div>
                    <p className="px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t("nav.home")} & {t("nav.resources")}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {headerNavItems.map((item, idx) => {
                        const loc = localizedMenuItem(item, lang);
                        const isExt = Boolean(item.is_external) || item.path.startsWith("http");
                        const isTut = item.path === "#tutorial" || item.path.startsWith("#");

                        if (isTut) {
                          return (
                            <li
                              key={`m-${item.id}`}
                              className="animate-nav-item"
                              style={{ animationDelay: `${Math.min(idx * 35, 350)}ms` }}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setOpen(false);
                                  openAppTutorial();
                                }}
                                className="group flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-base font-semibold transition-all duration-200 hover:bg-secondary hover:translate-x-1 text-left"
                              >
                                <NavigationIcon
                                  name={item.icon || "Compass"}
                                  className="size-5 shrink-0 text-primary transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6"
                                />
                                <span>{loc.label}</span>
                              </button>
                            </li>
                          );
                        }

                        if (isExt) {
                          return (
                            <li
                              key={`m-${item.id}`}
                              className="animate-nav-item"
                              style={{ animationDelay: `${Math.min(idx * 35, 350)}ms` }}
                            >
                              <a
                                href={item.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setOpen(false)}
                                className="group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-base font-semibold transition-all duration-200 hover:bg-secondary hover:translate-x-1"
                              >
                                <NavigationIcon
                                  name={item.icon || "Globe"}
                                  className="size-5 shrink-0 text-primary transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6"
                                />
                                <span>{loc.label}</span>
                              </a>
                            </li>
                          );
                        }

                        return (
                          <li
                            key={`m-${item.id}`}
                            className="animate-nav-item"
                            style={{ animationDelay: `${Math.min(idx * 35, 350)}ms` }}
                          >
                            <Link
                              to={item.path as any}
                              activeOptions={{ exact: item.path === "/" }}
                              onClick={() => setOpen(false)}
                              className="group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-base font-semibold transition-all duration-200 hover:bg-secondary hover:translate-x-1 data-[status=active]:bg-primary-soft data-[status=active]:text-primary"
                            >
                              <NavigationIcon
                                name={item.icon || "Home"}
                                className="size-5 shrink-0 text-primary transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6"
                              />
                              <span>{loc.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Mobile Resources Submenu */}
                  {resourceDropdownItems.length > 0 && (
                    <div>
                      <p className="px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {t("nav.resourcesMenuLabel")}
                      </p>
                      <ul className="mt-2 space-y-1">
                        {resourceDropdownItems.map((resItem, resIdx) => {
                          const loc = localizedMenuItem(resItem, lang);
                          const isTut =
                            resItem.path === "#tutorial" || resItem.path.startsWith("#");
                          const isExt =
                            Boolean(resItem.is_external) || resItem.path.startsWith("http");

                          if (isTut) {
                            return (
                              <li
                                key={`m-res-${resItem.id}`}
                                className="animate-nav-item"
                                style={{ animationDelay: `${Math.min(resIdx * 35, 400)}ms` }}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpen(false);
                                    openAppTutorial();
                                  }}
                                  className="group flex min-h-11 w-full items-center gap-3 rounded-xl bg-primary/5 px-3 py-2 text-base font-bold text-primary transition-all duration-200 hover:bg-primary/10 hover:translate-x-1 text-left"
                                >
                                  <NavigationIcon
                                    name={resItem.icon || "Compass"}
                                    className="size-5 shrink-0 text-primary transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6"
                                  />
                                  <span>{loc.label}</span>
                                </button>
                              </li>
                            );
                          }

                          if (isExt) {
                            return (
                              <li
                                key={`m-res-${resItem.id}`}
                                className="animate-nav-item"
                                style={{ animationDelay: `${Math.min(resIdx * 35, 400)}ms` }}
                              >
                                <a
                                  href={resItem.path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setOpen(false)}
                                  className="group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-base font-semibold transition-all duration-200 hover:bg-secondary hover:translate-x-1"
                                >
                                  <NavigationIcon
                                    name={resItem.icon || "Globe"}
                                    className="size-5 shrink-0 text-primary transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div>{loc.label}</div>
                                    {loc.desc && (
                                      <div className="truncate text-xs font-normal text-muted-foreground">
                                        {loc.desc}
                                      </div>
                                    )}
                                  </div>
                                </a>
                              </li>
                            );
                          }

                          return (
                            <li
                              key={`m-res-${resItem.id}`}
                              className="animate-nav-item"
                              style={{ animationDelay: `${Math.min(resIdx * 35, 400)}ms` }}
                            >
                              <Link
                                to={resItem.path as any}
                                onClick={() => setOpen(false)}
                                className="group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-base font-semibold transition-all duration-200 hover:bg-secondary hover:translate-x-1 data-[status=active]:bg-primary-soft data-[status=active]:text-primary"
                              >
                                <NavigationIcon
                                  name={resItem.icon || "FolderTree"}
                                  className="size-5 shrink-0 text-primary transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6"
                                />
                                <div className="min-w-0 flex-1">
                                  <div>{loc.label}</div>
                                  {loc.desc && (
                                    <div className="truncate text-xs font-normal text-muted-foreground">
                                      {loc.desc}
                                    </div>
                                  )}
                                </div>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {/* 9th Grade Teams (Lincoln High) */}
                  {selectedSchool.id === "lincoln" ? (
                    <div>
                      <p className="px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {t("nav.teams")}
                      </p>
                      <ul className="mt-2 space-y-1">
                        {NGOT_TEAMS.map((team) => (
                          <li key={`mt-${team.slug}`}>
                            <Link
                              to="/equipos/$slug"
                              params={{ slug: team.slug }}
                              onClick={() => setOpen(false)}
                              className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-secondary"
                            >
                              <Users className="size-4 shrink-0 text-primary" />
                              <span>{team.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div data-tutorial="categories">
                    <p className="px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t("categories.title")}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {(categories ?? []).map((cat) => (
                        <li key={cat.id}>
                          <Link
                            to="/topics/$slug"
                            params={{ slug: cat.slug }}
                            onClick={() => setOpen(false)}
                            className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary"
                          >
                            <CategoryIcon
                              name={cat.icon}
                              className="size-4 shrink-0 text-primary"
                            />
                            <span className="min-w-0 truncate">
                              {localizedCategory(cat, lang).name}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to="/admin/login"
                    onClick={() => setOpen(false)}
                    className="flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary"
                  >
                    {t("nav.staff")}
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {children}
        <div className="mx-auto max-w-6xl px-4 sm:px-6"></div>
      </main>

      <footer className="mt-16 border-t border-border bg-secondary/50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_1.8fr_1fr]">
          <div>
            <SiteLogo />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">{t("site.tagline")}</p>
            <p className="mt-4 text-sm font-medium text-primary">{notice}</p>
          </div>
          <nav aria-label="Footer" className="min-w-0">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
                {t("home.quickLinks")}
              </h2>
              <span className="text-xs font-semibold text-muted-foreground">
                {footerLinks.length} {lang === "en" ? "links" : "enlaces"}
              </span>
            </div>

            <Accordion
              type="multiple"
              className="space-y-2 border-none"
            >
              {categorizedFooterLinks.map((cat) => {
                const catTitle =
                  lang === "en"
                    ? cat.titleEn
                    : lang === "kar" || lang === "ksw"
                      ? cat.titleKar
                      : cat.titleEs;
                const Icon = cat.icon;

                return (
                  <AccordionItem
                    key={cat.key}
                    value={cat.key}
                    className="rounded-2xl border border-border/80 bg-background/80 shadow-2xs overflow-hidden"
                  >
                    <AccordionTrigger className="px-3.5 py-2.5 text-xs font-bold text-foreground hover:bg-secondary/60 hover:no-underline transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="grid size-6 place-items-center rounded-lg bg-primary/10 text-primary shrink-0">
                          <Icon className="size-3.5" aria-hidden="true" />
                        </div>
                        <span className="truncate">{catTitle}</span>
                        <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          {cat.items.length}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3.5 pt-1 pb-3 text-xs">
                      <ul className="space-y-2 pl-1">
                        {cat.items.map((item) => {
                          const loc = localizedMenuItem(item, lang);
                          const isTut = item.path === "#tutorial" || item.path.startsWith("#");
                          const isExt = Boolean(item.is_external) || item.path.startsWith("http");

                          if (isTut) {
                            return (
                              <li key={`ft-${item.id}`}>
                                <button
                                  type="button"
                                  onClick={openAppTutorial}
                                  className="flex items-center gap-2 text-start text-foreground/80 hover:text-primary transition-colors cursor-pointer group"
                                >
                                  <NavigationIcon
                                    name={item.icon || "Compass"}
                                    className="size-3.5 text-muted-foreground group-hover:text-primary shrink-0 transition-colors"
                                  />
                                  <span className="group-hover:underline">{loc.label}</span>
                                </button>
                              </li>
                            );
                          }

                          if (isExt) {
                            return (
                              <li key={`ft-${item.id}`}>
                                <a
                                  href={item.path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors group"
                                >
                                  <NavigationIcon
                                    name={item.icon || "Globe"}
                                    className="size-3.5 text-muted-foreground group-hover:text-primary shrink-0 transition-colors"
                                  />
                                  <span className="group-hover:underline">{loc.label}</span>
                                  <ExternalLink className="size-2.5 text-muted-foreground opacity-70" />
                                </a>
                              </li>
                            );
                          }

                          return (
                            <li key={`ft-${item.id}`}>
                              <Link
                                to={item.path as any}
                                className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors group"
                              >
                                <NavigationIcon
                                  name={item.icon || "Link"}
                                  className="size-3.5 text-muted-foreground group-hover:text-primary shrink-0 transition-colors"
                                />
                                <span className="group-hover:underline">{loc.label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </nav>
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide">Redes sociales</h2>
              <Link
                to="/redes-sociales"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Ver todas →
              </Link>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Sigue las cuentas oficiales activas de nuestra comunidad educativa:
            </p>

            {/* Logos con color oficial de cada app activada desde el panel admin */}
            <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
              {socialChannels.length > 0 ? (
                socialChannels.map((ch) => (
                  <a
                    key={ch.id}
                    href={ch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`${ch.name} (${ch.handle})`}
                    className="group relative flex size-10 items-center justify-center rounded-xl shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                    style={{
                      backgroundColor:
                        ch.platform === "instagram"
                          ? "#E4405F"
                          : ch.platform === "youtube"
                            ? "#FF0000"
                            : ch.platform === "tiktok"
                              ? "#010101"
                              : ch.platform === "facebook"
                                ? "#1877F2"
                                : ch.platform === "twitter"
                                  ? "#000000"
                                  : ch.platform === "whatsapp"
                                    ? "#25D366"
                                    : ch.brand_color || "#3B82F6",
                      color: "#ffffff",
                    }}
                  >
                    <SocialPlatformIcon platform={ch.platform} className="size-5" />
                    <span className="sr-only">{ch.name}</span>
                  </a>
                ))
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    No hay redes activas actualmente.
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col items-start gap-3">
              <TrustpilotReviewButton />
            </div>
          </div>
        </div>
        {/* Independence Disclaimer Banner */}
        <div className="border-t border-border/80 bg-background/60 py-6 px-4 sm:px-6">
          <div className="mx-auto max-w-6xl space-y-4">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5 text-foreground/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-semibold text-foreground">
                  {t("footer.disclaimer")}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {lang === "en"
                    ? "Independent, volunteer-supported community guide. School names and trademarks belong to Des Moines Public Schools."
                    : "Guía comunitaria independiente mantenida por voluntarios. Nombres escolares y marcas pertenecen a Des Moines Public Schools."}
                </p>
              </div>
              <Link
                to="/independence-disclaimer"
                className="shrink-0 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary px-3.5 py-1.5 text-xs font-bold transition-colors"
              >
                {t("footer.independence")} →
              </Link>
            </div>

            {/* Legal Center Links Row */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground pt-1">
              <Link
                to="/independence-disclaimer"
                className="hover:text-foreground hover:underline transition-colors font-medium"
              >
                {t("footer.independence")}
              </Link>
              <span>·</span>
              <Link
                to="/privacy-policy"
                className="hover:text-foreground hover:underline transition-colors font-medium"
              >
                {t("footer.privacy")}
              </Link>
              <span>·</span>
              <Link
                to="/cookie-policy"
                className="hover:text-foreground hover:underline transition-colors font-medium"
              >
                {t("footer.cookies")}
              </Link>
              <span>·</span>
              <Link
                to="/terms-of-use"
                className="hover:text-foreground hover:underline transition-colors font-medium"
              >
                {t("footer.terms")}
              </Link>
              <span>·</span>
              <Link
                to="/information-disclaimer"
                className="hover:text-foreground hover:underline transition-colors font-medium"
              >
                {t("footer.infoDisclaimer")}
              </Link>
            </div>
          </div>
        </div>

        {/* Final Copyright Bar */}
        <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {t("footer.rights")} · {t("footer.official")}
        </div>
      </footer>
    </div>
  );
}
