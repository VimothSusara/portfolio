import { SiteFooter } from "@/components/layouts/site-footer";
import { SiteHeader } from "@/components/layouts/site-header";
import { PageViewTracker } from "@/components/site/page-view-tracker";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageViewTracker />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}