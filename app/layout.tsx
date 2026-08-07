import type { Metadata, Viewport } from "next";
import { Mona_Sans } from "next/font/google";
import { MotionProvider } from "@/components/motion-provider";
import "./globals.css";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

// Runs synchronously during HTML parsing, before first paint, so the saved (or
// system) theme is applied to <html> with no flash of the wrong colours. Falls
// back to the OS preference when the user hasn't chosen one yet.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

const SITE_NAME = "Port 22";
const SITE_TITLE = "Port 22 — how SSH, servers, and keys actually work";
const SITE_DESCRIPTION =
  "A plain-English course on SSH: how clients, servers, and key pairs actually fit together, how to get access to a machine, how to run and secure your own, and how to fix it when it breaks. For people who can code a little but never quite got SSH.";


export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "hsl(152, 48%, 96%)" },
    { media: "(prefers-color-scheme: dark)", color: "hsl(152, 45%, 4%)" },
  ],
};

export const metadata: Metadata = {
  title: {
    template: `%s | ${SITE_NAME}`,
    default: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: {
      template: `%s | ${SITE_NAME}`,
      default: SITE_TITLE,
    },
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: {
      template: `%s | ${SITE_NAME}`,
      default: SITE_TITLE,
    },
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // Lets Next.js disable the CSS smooth scroll while it resets the scroll
      // position on navigation, so route transitions don't animate a scroll.
      data-scroll-behavior="smooth"
      // The inline theme script sets the `dark` class before React hydrates.
      suppressHydrationWarning
      className={`${monaSans.variable} h-full antialiased selection:text-ink-flip selection:bg-brand`}
    >
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: trusted inline theme script, no user input */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
