import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LangProvider } from "@/components/LangProvider";

export const metadata: Metadata = {
  title: "Impostor Aula",
  description: "Actividad interactiva para la clase de tecnología en salud",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <LangProvider>{children}</LangProvider>
        <p
          className="font-signature pointer-events-none fixed bottom-[max(0.5rem,env(safe-area-inset-bottom))] right-3 z-10 bg-paper/80 px-2 py-1 text-xs text-ink-muted backdrop-blur-sm sm:right-4 sm:text-sm"
          aria-label="Profesora Beatriz Mena"
        >
          Profesora Beatriz Mena
        </p>
      </body>
    </html>
  );
}
