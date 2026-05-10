import TopBar from "../_components/TopBar";
import Header from "../_components/Header";
import SubNav from "../_components/SubNav";
import Hero from "../_components/Hero";
import Footer from "../_components/Footer";

/**
 * Full customer chrome (TopBar, Header, SubNav, Hero carousel, Footer) with page content as main body.
 * Route group name does not affect URLs ({@link https://nextjs.org/docs/app/building-your-application/routing/route-groups}).
 */
export default function SiteChromeLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen flex-col bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100">
            <TopBar />
            <Header />
            <SubNav />
            <main className="w-full flex-1">
                <Hero />
                {children}
            </main>
            <Footer />
        </div>
    );
}
