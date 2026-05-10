import { type ReactNode } from "react";
import { cn } from "@/src/@core/utils/cn";

export type CustomerStaticPageProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Use wide container for dense grids (careers, payment methods). */
  contentMaxWidth?: "default" | "wide";
};

export default function CustomerStaticPage({
  title,
  subtitle,
  children,
  contentMaxWidth = "default",
}: CustomerStaticPageProps) {
  return (
    <div className="min-h-[40vh] bg-[#f5f6f8]">
      <div className="bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-10 sm:py-14">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl">{title}</h1>
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-sm opacity-90 sm:text-base">{subtitle}</p>
          ) : null}
          <div className="mt-3 h-1 w-16 rounded-full bg-primary-shadcn" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div
          className={cn(
            "mx-auto space-y-4 text-slate-800 [&_h2]:mt-8 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h3]:mt-4 [&_h3]:font-heading [&_h3]:text-lg [&_h3]:font-semibold [&_p]:leading-relaxed [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mt-1 [&_a]:font-semibold [&_a]:text-primary-shadcn hover:[&_a]:underline",
            contentMaxWidth === "wide" ? "max-w-5xl" : "max-w-3xl",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
