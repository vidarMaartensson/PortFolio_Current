import { Navbar } from "./components/navbar/Navbar";
import { Hero } from "./components/hero/Hero";
import { ProjectGrid } from "./components/projectGrid/ProjectGrid";

function App() {
  return (
    <main className="min-h-screen pt-6 bg-white text-slate-900 dark:bg-black dark:text-white transition-colors duration-300">
      <Navbar />
      <Hero />
      <ProjectGrid />
    </main>
  );
}

export default App;
