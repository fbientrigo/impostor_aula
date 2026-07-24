"use client";

// App shell header: wordmark on the left, hamburger on the right. The drawer
// holds navigation, "how to play", the language toggle, and any contextual
// items a page passes in (e.g., "leave room" on student pages). The primary
// action of each screen never lives here.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useLang } from "./LangProvider";
import {
  Drawer,
  DrawerItem,
  HomeIcon,
  IconButton,
  LeafIcon,
  MenuIcon,
  SectionLabel,
} from "@/components/ui";

export function AppHeader({ subtitle, drawerExtras }: { subtitle?: string; drawerExtras?: ReactNode }) {
  const { lang, setLang, t } = useLang();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
      <Link href="/" className="flex items-center gap-2.5">
        <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-lg bg-leaf-soft text-leaf">
          <LeafIcon />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="font-display text-lg text-ink">{t("app.name")}</span>
          <span className="hidden text-xs text-ink-muted sm:inline">{subtitle ?? t("app.tagline")}</span>
        </span>
      </Link>

      <IconButton label={t("a11y.openMenu")} onClick={() => setOpen(true)} aria-expanded={open}>
        <MenuIcon />
      </IconButton>

      <Drawer open={open} onClose={() => setOpen(false)} title={t("nav.menu")} closeLabel={t("a11y.closeMenu")}>
        <nav className="font-handwritten flex flex-col gap-1">
          <DrawerItem
            icon={<HomeIcon />}
            onClick={() => {
              setOpen(false);
              router.push("/");
            }}
          >
            {t("nav.home")}
          </DrawerItem>
          {drawerExtras}
        </nav>

        <div className="mt-4 border-t border-edge pt-4">
          <SectionLabel className="px-3">{t("howto.title")}</SectionLabel>
          <ol className="font-handwritten mt-2 list-decimal space-y-2 pl-8 pr-3 text-sm text-ink-secondary">
            <li>{t("howto.step1")}</li>
            <li>{t("howto.step2")}</li>
            <li>{t("howto.step3")}</li>
            <li>{t("howto.step4")}</li>
          </ol>
        </div>

        <div className="mt-4 border-t border-edge pt-3">
          <button
            onClick={() => setLang(lang === "es" ? "en" : "es")}
            className="font-handwritten flex min-h-11 w-full items-center justify-between rounded-lg px-3 py-2 text-base text-ink-secondary transition-colors hover:bg-paper hover:text-ink"
          >
            <span>Idioma / Language</span>
            <span className="rounded-md border border-edge-strong px-2 py-0.5 text-sm">
              {lang === "es" ? "ES" : "EN"}
            </span>
          </button>
        </div>
      </Drawer>
    </header>
  );
}
