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
  // On phones the links are shown as icons only so the bar fits the screen.
  const navLinks = [
    {
      name: "Home",
      href: "#",
      icon: "M3 10.5 12 3l9 7.5M5 9v11a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9",
    },
    {
      name: "Projects",
      href: "#projects",
      icon: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z",
    },
    {
      name: "Contact",
      href: "mailto:vidar.maartensson@gmail.com",
      icon: "M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7zm0 0 9 6 9-6",
    },
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
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div className="relative flex items-center gap-3 sm:gap-0">
        <nav className="flex items-center gap-1 px-2 py-1.5 sm:gap-2 sm:px-4 sm:py-2 rounded-full border border-slate-200/50 bg-white/80 backdrop-blur-md shadow-lg dark:border-slate-800/50 dark:bg-slate-900/80">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleScroll(e, link.href)}
              aria-label={link.name}
              title={link.name}
              className="flex items-center p-2.5 sm:px-4 sm:py-2 text-sm font-semibold text-slate-600 transition-all hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 no-underline"
            >
              <svg
                className="h-5 w-5 sm:hidden"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d={link.icon} />
              </svg>
              <span className="hidden sm:inline">{link.name}</span>
            </a>
          ))}

          <div className="mx-0.5 sm:mx-2 h-4 w-[1px] bg-slate-200 dark:bg-slate-700" />

          <button
            onClick={() => setIsDark(!isDark)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-all hover:bg-slate-100 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-400 border-none bg-transparent cursor-pointer"
            aria-label="Toggle color theme"
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
          <div className="mx-0.5 sm:mx-2 h-4 w-[1px] bg-slate-200 dark:bg-slate-700" />

          <a
            href="https://github.com/vidarMaartensson"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="group flex items-center gap-2 p-2.5 sm:px-4 sm:py-2 text-sm font-bold text-slate-900 dark:text-white hover:opacity-70 transition-opacity no-underline"
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
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </nav>

        <img
          src={avatar}
          alt="Profile Avatar"
          onClick={handleAvatarClick}
          className={`shrink-0 sm:absolute sm:left-full sm:ml-4 sm:top-1/2 sm:-translate-y-1/2 rounded-full border-2 border-slate-200 object-cover shadow-xl dark:border-slate-800 transition-all duration-300 hover:scale-110 hover:rotate-3 cursor-pointer ${
            isScrolled
              ? "h-10 w-10 sm:h-12 sm:w-12"
              : "h-10 w-10 sm:h-16 sm:w-16 lg:h-24 lg:w-24"
          }`}
        />
      </div>
    </motion.header>
  );
};
