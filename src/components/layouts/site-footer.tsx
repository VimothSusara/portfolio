import Link from "next/link";
import { socialLinks } from "@/data/social-links";
import { siteConfig } from "@/data/constants";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="container mx-auto flex flex-col gap-4 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>

        <div className="flex items-center gap-4">
          {socialLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              aria-label={link.name}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <link.icon className="size-4" />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}