"use client";

import React from "react";
import Link from "next/link";
import { useLocalization } from "@/src/@core/hooks/use-localization";

/** lucide-react does not export Facebook/YouTube brand icons in this project’s build; use inline SVGs. */
function FacebookGlyph({ className, ...rest }: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} {...rest}>
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
    );
}

function YoutubeGlyph({ className, ...rest }: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} {...rest}>
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
    );
}

const linkClass =
    "text-primary transition-colors hover:text-primary/80 text-sm";

const Footer: React.FC = () => {
    const { t } = useLocalization();

    return (
        <footer className="bg-slate-900 text-slate-400">
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="py-8 sm:py-16">
                <div className="mx-auto grid w-[92%] max-w-6xl grid-cols-1 gap-10 lg:w-[70%] lg:grid-cols-3 lg:gap-16">
                    <div>
                        <h4 className="mb-6 border-b-2 border-primary pb-3 text-sm font-black uppercase tracking-wide text-white">
                            {t("customer.footer.column_ltcinema")}
                        </h4>
                        <ul className="space-y-4 text-sm">
                            <li>
                                <Link href="/about-us" className={linkClass}>
                                    {t("customer.footer.about_us")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/career-opportunities" className={linkClass}>
                                    {t("customer.footer.career")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact-ltc" className={linkClass}>
                                    {t("customer.footer.contact")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/for-business-partners" className={linkClass}>
                                    {t("customer.footer.for_partners")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-6 border-b-2 border-primary pb-3 text-sm font-black uppercase tracking-wide text-white">
                            {t("customer.footer.policy_legal")}
                        </h4>
                        <ul className="space-y-4 text-sm">
                            <li>
                                <Link href="/condition-of-website-use" className={linkClass}>
                                    {t("customer.footer.website_conditions")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms-of-use" className={linkClass}>
                                    {t("customer.footer.terms_of_use")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/payment-policy" className={linkClass}>
                                    {t("customer.footer.payment_policy")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy-policy" className={linkClass}>
                                    {t("customer.footer.privacy_policy")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/cinema-rules" className={linkClass}>
                                    {t("customer.footer.cinema_rules")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className={linkClass}>
                                    {t("customer.footer.faq")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-6 border-b-2 border-primary pb-3 text-sm font-black uppercase tracking-wide text-white">
                            {t("customer.footer.stay_connected")}
                        </h4>
                        <div className="flex gap-3">
                            <a
                                href="#"
                                aria-label="Facebook"
                                className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-primary-shadcn hover:text-primary-shadcn-foreground"
                            >
                                <FacebookGlyph className="size-5" />
                            </a>
                            <a
                                href="#"
                                aria-label="YouTube"
                                className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-primary-shadcn hover:text-primary-shadcn-foreground"
                            >
                                <YoutubeGlyph className="size-5" />
                            </a>
                            <a
                                href="#"
                                aria-label="Zalo"
                                className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg font-bold text-white transition-colors hover:bg-primary-shadcn hover:text-primary-shadcn-foreground"
                            >
                                Z
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mx-auto mt-10 flex w-[92%] max-w-6xl flex-col items-center gap-4 border-t border-white/10 pt-8 lg:w-[70%]">
                    <p className="text-center text-xs">{t("customer.footer.copyright")}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
