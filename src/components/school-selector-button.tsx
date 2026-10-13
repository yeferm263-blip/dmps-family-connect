import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SchoolEmblem } from "@/components/school-emblem";
import { useSchool } from "@/lib/school";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface SchoolSelectorButtonProps {
  className?: string;
}

export function SchoolSelectorButton({ className }: SchoolSelectorButtonProps) {
  const { selectedSchool, openSchoolModal } = useSchool();
  const { t } = useI18n();

  return (
    <Button
      type="button"
      variant="outline"
      onClick={openSchoolModal}
      className={cn(
        "group min-h-11 gap-2 rounded-full font-semibold transition-all duration-200 hover:shadow-xs",
        className,
      )}
      aria-label={t("school.selector.title") || "Select School"}
    >
      <SchoolEmblem schoolId={selectedSchool.id} size="sm" />
      <span className="max-w-32 truncate text-sm font-bold text-foreground">
        {selectedSchool.shortName || selectedSchool.short_name || selectedSchool.name}
      </span>
      <ChevronDown
        className="size-4 shrink-0 opacity-60 transition-transform duration-200 group-hover:translate-y-0.5"
        aria-hidden="true"
      />
    </Button>
  );
}
