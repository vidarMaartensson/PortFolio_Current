import React from "react";
import { ProjectCard } from "../projectCard/ProjectCard";
import type { Project } from "../../types";
import pulseGridImage from "../../assets/projects/pulsegrid.png";
import pulseGridGif from "../../assets/projects/pulsegrid.gif";
import codeReviewerImage from "../../assets/projects/code-reviewer-buddy.png";
import pullPatrolImage from "../../assets/projects/pullpatrol.png";
import pullPatrolGif from "../../assets/projects/pullpatrol.gif";

const projects: Project[] = [
  {
    id: 2,
    title: "PulseGrid",
    description:
      "Real-time monitoring dashboard with live service metrics, an event stream and simulated incidents.",
    tags: ["React", "TypeScript", "Recharts", "Vite"],
    imageUrl: pulseGridImage,
    gifUrl: pulseGridGif,
    liveUrl: "https://pulse-grid-delta.vercel.app/",
    githubUrl: "https://github.com/vidarMaartensson/PulseGrid",
    status: "completed",
  },
  {
    id: 3,
    title: "Agent Code Reviewer Buddy",
    description:
      "AI code reviewer that clones any GitHub repo and streams a live multi-agent review via Llama 3.3.",
    tags: [".NET", "React", "TypeScript", "Llama / Groq"],
    imageUrl: codeReviewerImage,
    liveUrl: "https://agent-code-reveiwer-buddy.vercel.app/",
    githubUrl: "https://github.com/vidarMaartensson/Agent_Code_Reveiwer_Buddy",
    status: "completed",
  },
  {
    id: 4,
    title: "PullPatrol",
    description:
      "Automated pull request reviewer that combines static rules with GPT-OSS 120B via Groq and posts inline findings on GitHub.",
    tags: [".NET 10", "C#", "GitHub API", "Groq"],
    imageUrl: pullPatrolImage,
    gifUrl: pullPatrolGif,
    githubUrl: "https://github.com/vidarMaartensson/PullPatrol",
    demoInModal: true,
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
