import React from "react";
import { ProjectCard } from "../projectCard/ProjectCard";
import type { Project } from "../../types";

const projects: Project[] = [
  {
    id: 1,
    title: "A E-store",
    description:
      "Fully scalable stripe application with live inventory changes and orders.",
    tags: ["Next.js", "TypeScript", "Tailwind", "PostgreSQL"],
    status: "in-progress",
  },
  {
    id: 2,
    title: "Personal Dashboard",
    description: "A internal tool to visualize my data from gihub and jara",
    tags: ["React", "Go", "Redis"],
    status: "in-progress",
  },
  {
    id: 3,
    title: "Open Source Contributor Tool",
    description:
      "Helps junior developer find their first github problem challange",
    tags: ["Node.js", "Express", "React"],
    status: "completed",
  },
];

export const ProjectGrid: React.FC = () => {
  return (
    <section /* Removed background classes to allow stars to show through */
      id="projects"
      className="py-20"
    >
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            My Projects
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            These are projects I've worked on recently, or thats in the making!
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
};
