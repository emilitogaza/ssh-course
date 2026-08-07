import { redirect } from "next/navigation";
import { getFirstChapter } from "@/lib/content";

// The course has no separate landing page — send visitors straight into the
// first chapter in reading order.
export default function Home() {
  redirect(`/${getFirstChapter().slug}`);
}
