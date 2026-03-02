import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

type ActionCardLinkProps = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  ctaLabel?: string;
  className?: string;
};

export default function ActionCardLink({
  href,
  title,
  description,
  icon: Icon,
  ctaLabel = "Sende inn",
  className,
}: ActionCardLinkProps) {
  return (
    <Link
      href={href}
      aria-label={title}
      className={cn(
        "group relative flex h-full min-h-[120px] flex-col justify-between rounded-2xl border bg-card px-5 py-4 shadow-sm transition-colors",
        "hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted/40 ring-1 ring-border">
          <Icon className="h-5 w-5 text-foreground/90" />
        </div>

        <div className="min-w-0">
          <div className="text-base font-semibold leading-6">{title}</div>
          <div className="mt-1 text-sm leading-5 text-muted-foreground">
            {description}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 text-sm font-medium text-muted-foreground">
        <span className="transition-colors group-hover:text-foreground/90">
          {ctaLabel}
        </span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

