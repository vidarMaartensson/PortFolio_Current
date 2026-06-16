import React from "react";
import { motion } from "framer-motion";

export const Hero: React.FC = () => {
  const handleScrollToProjects = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const projectsSection = document.getElementById("projects");
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 text-center bg-transparent transition-colors duration-500">
      {/* Subtilt bakgrundsljus för premiumkänsla */}
      <div className="absolute -z-10 h-full w-full">
        <div className="absolute left-1/2 top-1/4 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[100px] dark:bg-blue-900/20"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl"
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4 inline-block rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
        >
          Fullstack-utvecklare • 3 years of experience
        </motion.span>

        <h1 className="mb-6 text-5xl font-black tracking-tight text-slate-900 dark:text-white sm:text-7xl lg:text-8xl">
          From a complex problem to a{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-400 bg-clip-text text-transparent">
            scalable reality
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-400 sm:text-xl">
          Fullstack developer with focus on user friendly scalable apps.
          Maintainable projects with intuitive and modern solutions, with a
          sweet tooth for AI.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            href="#projects"
            onClick={handleScrollToProjects}
            className="w-full rounded-xl bg-slate-900 px-8 py-4 text-sm font-bold text-white shadow-xl transition-all hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-100 sm:w-auto"
          >
            See my projects
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            href="mailto:vidar.maartensson@gmail.com"
            className="w-full rounded-xl border border-slate-200 bg-white px-8 py-4 text-sm font-bold text-slate-900 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 sm:w-auto"
          >
            Get in touch
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
};
