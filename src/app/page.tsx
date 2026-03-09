import TopBar from "./(customer)/_components/TopBar";
import Header from "./(customer)/_components/Header";
import SubNav from "./(customer)/_components/SubNav";
import Hero from "./(customer)/_components/Hero";
import MovieSelection from "./(customer)/_components/MovieSelection";
import Footer from "./(customer)/_components/Footer";

export default function Home() {
    return (
        <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
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