import TopBar from "../_components/TopBar";
import Header from "../_components/Header";
import SubNav from "../_components/SubNav";
import Hero from "../_components/Hero";
import MovieSelection from "../_components/MovieSelection";
import Footer from "../_components/Footer";

export default function Home() {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
            <TopBar />
            <Header />
            <SubNav />
            <main>
                <Hero />
                <MovieSelection />
            </main>
            <Footer />
        </div>
    );
}
