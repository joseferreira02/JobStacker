"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

function formatSegment(segment: string) {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className=" text-black flex items-center">

      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");

        return (
          <span key={href}>
            {" > "}
            <Link href={href}>
              {formatSegment(segment)}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}