import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import avatar from "../../assets/avatar.png";

export const Navbar: React.FC = () => {
  const [isDark, setIsDark] = useState(
    localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches),
  );

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.replace("#", "");
      const element = targetId ? document.getElementById(targetId) : document.body;
      element?.scrollIntoView({ behavior: "smooth" });
      window.history.pushState(null, "", href || "#");
    }
  };

  // Define navLinks outside of the component or memoize it if it depends on props/state
  // For now, it's fine here as it's static.
  const navLinks = [
    { name: "Hem", href: "#" },
    { name: "Projects", href: "#projects" },
    { name: "Contact", href: "mailto:vidar.maartensson@gmail.com" },
  ];

  const contactEmail = navLinks.find((link) => link.name === "Contact")?.href;

  const handleAvatarClick = () => {
    if (contactEmail) {
      window.location.href = contactEmail;
    }
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center p-6"
    >
      <div className="relative flex items-center">
        <nav className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200/50 bg-white/80 backdrop-blur-md shadow-lg dark:border-slate-800/50 dark:bg-slate-900/80">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleScroll(e, link.href)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 no-underline"
            >
              {link.name}
            </a>
          ))}

          <div className="mx-2 h-4 w-[1px] bg-slate-200 dark:bg-slate-700" />

          <button
            onClick={() => setIsDark(!isDark)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-all hover:bg-slate-100 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-400 border-none bg-transparent cursor-pointer"
            aria-label="Byt färgtema"
          >
            {isDark ? (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 18v1m9-9h1M3 12h1m15.364-6.364l.707-.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          {/* En liten visuell avskiljare innan kontakt-knappen (valfritt) */}
          <div className="mx-2 h-4 w-[1px] bg-slate-200 dark:bg-slate-700" />

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-900 dark:text-white hover:opacity-70 transition-opacity no-underline"
          >
            <svg
              className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            GitHub
          </a>
        </nav>

        <img
          src={avatar}
          alt="Profile Avatar"
          onClick={handleAvatarClick}
          className={`absolute left-full ml-4 top-1/2 -translate-y-1/2 rounded-full border-2 border-slate-200 object-cover shadow-xl dark:border-slate-800 transition-all duration-300 hover:scale-110 hover:rotate-3 cursor-pointer ${
            isScrolled
              ? "h-12 w-12"
              : "h-12 w-12 sm:h-16 sm:w-16 lg:h-24 lg:w-24"
          }`}
        />
      </div>
    </motion.header>
  );
};
