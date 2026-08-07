export type ClassValue = string | number | null | false | undefined | ClassValue[];

/**
 * Minimal class merger — flattens conditional class arrays into a single
 * space-separated string. No external deps; later classes win at the CSS level.
 */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];

  const walk = (value: ClassValue) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach(walk);
    } else {
      out.push(String(value));
    }
  };

  inputs.forEach(walk);
  return out.join(" ");
}
