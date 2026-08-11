import { SquareTerminal } from "lucide-react";
import Link from "next/link";
import { CourseSidebar } from "@/components/course-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { PageTransition } from "@/components/page-transition";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSidebarSections } from "@/lib/content";

// The documentation shell shared by every chapter: a persistent left rail on
// desktop, a fixed bottom tray on mobile. The per-chapter body and the "On this
// page" rail are rendered by the page itself, inside `children`.
export default function CourseLayout({ children }: { children: React.ReactNode }) {
  const sections = getSidebarSections();

  return (
    <div className="mx-auto flex w-full max-w-[90rem] flex-1">
      {/* Desktop chapter rail */}
      <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 flex-col lg:flex">
        <div className="flex items-center justify-between py-5 pl-6 pr-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-base font-semibold text-brand-ink"
          >
            <SquareTerminal className="icon-5 text-brand" />
            Port 22
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <CourseSidebar sections={sections} />
        </div>
      </aside>

      {/* Content column — bottom padding keeps the mobile tray off the pager */}
      <div className="flex min-w-0 flex-1 flex-col pb-24 lg:pb-0">
        <MobileNav sections={sections} />
        <PageTransition>{children}</PageTransition>
      </div>
    </div>
  );
}
