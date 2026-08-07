import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Minimal `asChild` slot. Merges the Slot's own props onto its single child
 * element instead of rendering a wrapper, so a component can defer its markup
 * to whatever element the consumer passes in.
 */
export function Slot({
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode;
}) {
  if (!React.isValidElement(children)) {
    return null;
  }

  const child = children as React.ReactElement<Record<string, unknown>>;
  const childProps = child.props;

  return React.cloneElement(child, {
    ...props,
    ...childProps,
    // Merge classes and styles rather than letting one side win outright.
    className: cn(
      props.className as string | undefined,
      childProps.className as string | undefined
    ),
    style: {
      ...(props.style as React.CSSProperties | undefined),
      ...(childProps.style as React.CSSProperties | undefined),
    },
  });
}
