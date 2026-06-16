import { Navbar } from "./components/navbar/Navbar";
import { Hero } from "./components/hero/Hero";
import { ProjectGrid } from "./components/projectGrid/ProjectGrid";
import React, { useMemo } from "react";

// Helper function to generate star layers
const generateStars = (
  count: number,
  sizeClass: string,
  animationDuration: string,
) => {
  let shadow = "";
  // Generate stars across a larger area than just the viewport to ensure continuous animation
  // Adjust these values based on desired star density and screen size
  // Using fixed values for now, but could be dynamic based on screen size if needed
  const areaWidth = 2000; // Example: 2000px width for star generation
  const areaHeight = 2000; // Example: 2000px height for star generation

  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * areaWidth);
    const y = Math.floor(Math.random() * areaHeight);
    shadow += `${x}px ${y}px var(--star-color)${i === count - 1 ? "" : ","}`;
  }

  return (
    <div
      className={`stars ${sizeClass}`}
      style={{ boxShadow: shadow, animationDuration: animationDuration }}
      key={sizeClass} // Key for React list rendering
    ></div>
  );
};

export default function App() {
  // Memoize star elements to prevent re-rendering on every App render
  const starBackground = useMemo(
    () => (
      <div className="stars-container">
        {generateStars(700, "stars-small", "50s")}
        {generateStars(200, "stars-medium", "100s")}
        {generateStars(100, "stars-large", "150s")}
      </div>
    ),
    [],
  ); // Empty dependency array means it only renders once

  return (
    <div className="relative min-h-screen pt-6 text-slate-900 dark:text-white transition-colors duration-500">
      {" "}
      {/* Main wrapper for the app content */}
      {starBackground} {/* Render the memoized star background */}
      <Navbar />
      <Hero />
      <ProjectGrid />
    </div>
  );
}
