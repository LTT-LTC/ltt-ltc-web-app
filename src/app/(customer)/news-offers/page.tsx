import Link from "next/link";
import TopBar from "../_components/TopBar";
import Header from "../_components/Header";
import Footer from "../_components/Footer";
import { NEWS_OFFERS } from "./newsOffersData";

export default function NewsOffersPage() {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
            <TopBar />
            <Header />

            <main className="w-[92%] lg:w-[70%] mx-auto py-10 sm:py-14">
                <section className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">News & Offers</h1>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                        Explore the latest promotions, campaign updates, and special offers from LTCinema.
                    </p>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    {NEWS_OFFERS.map((item) => (
                        <article
                            key={item.slug}
                            className="group rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm"
                        >
                            <Link href={`/news-offers/${item.slug}`} className="block">
                                <div className="relative aspect-video overflow-hidden">
                                    <img
                                        src={item.banner}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                            </Link>

                            <div className="px-4 py-3 bg-white text-slate-900">
                                <Link
                                    href={`/news-offers/${item.slug}`}
                                    className="block hover:text-primary transition-colors"
                                >
                                    <p className="font-semibold text-sm sm:text-base leading-6">{item.title}</p>
                                    <p className="text-xs sm:text-sm text-slate-600 mt-1">{item.dateLabel}</p>
                                </Link>
                            </div>
                        </article>
                    ))}
                </section>
            </main>

            <Footer />
        </div>
    );
}
