"use client";

import { usePathname } from "next/navigation";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function PageBreadcrumb() {
  const pathname = usePathname();

  // Remove locale and sidebar from path
  const pathSegments = pathname
    .split("/")
    .filter(Boolean)
    .filter(
      (segment) =>
        segment !== "[locale]" &&
        segment !== "(app)" &&
        segment !== "(sidebar)",
    );

  // Build breadcrumb items
  const items = pathSegments.map((segment, index) => {
    const isLast = index === pathSegments.length - 1;
    const href = `/${pathSegments.slice(0, index + 1).join("/")}`;

    // Format segment title (capitalize and replace hyphens with spaces)
    const title = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return { title, href, isLast };
  });

  if (items.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        {items.map((item, index) => (
          <React.Fragment key={item.href}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href}>{item.title}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
