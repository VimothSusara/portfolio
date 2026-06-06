import type { ComponentType, SVGProps } from "react";
import { Mail } from "lucide-react";
import { GitHubIcon } from "@/components/icons/github-icon";
import { LinkedInIcon } from "@/components/icons/linkedin-icon";

type SocialIcon = ComponentType<SVGProps<SVGSVGElement>>;

export const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/vimothsusara",
    icon: GitHubIcon,
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/vimoth-susara",
    icon: LinkedInIcon,
  },
  {
    name: "Email",
    href: "mailto:vimothsusara@gmail.com",
    icon: Mail,
  },
] as const satisfies ReadonlyArray<{
  name: string;
  href: string;
  icon: SocialIcon;
}>;