import React, { useState } from "react";
import type { Project } from "../../types";
import { motion } from "framer-motion";

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const isInProgress = project.status === "in-progress";
  const [isHovered, setIsHovered] = useState(false);

  const card = (
    <motion.div
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      {/* Status Badge */}
      {isInProgress && (
        <div className="absolute right-3 top-3 z-10">
          <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            <span className="mr-1.5 h-2 w-2 animate-pulse rounded-full bg-amber-500"></span>
            Under utveckling
          </span>
        </div>
      )}

      {/* Image Placeholder/Image */}
      <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
        {project.imageUrl ? (
          <>
            <img
              src={project.imageUrl}
              alt={project.title}
              className={`h-full w-full object-cover object-top ${isInProgress ? "opacity-50 grayscale" : ""}`}
            />
            {/* Only mount the GIF on hover so it isn't downloaded up front and restarts each time */}
            {project.gifUrl && isHovered && (
              <img
                src={project.gifUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
            )}
          </>
        ) : (
          <span className="text-slate-400 font-mono italic text-sm">
            {isInProgress ? "Being developed..." : "Picture missing"}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
          {project.title}
        </h3>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
          {project.description}
        </p>

        {/* Tags */}
        <div className="mt-auto flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-500 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );

  if (!project.liveUrl) return card;

  return (
    <a
      href={project.liveUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${project.title} in a new tab`}
      className="block h-full"
    >
      {card}
    </a>
  );
};
