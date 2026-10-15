import React, { useState } from "react";
import type { Project } from "../../types";
import { motion } from "framer-motion";
import { DemoModal } from "../demoModal/DemoModal";

// On phones the buttons fill the row and are tall enough to tap comfortably;
// from `sm` up they shrink back to compact desktop chips.
const buttonBase =
  "flex-1 min-w-[40%] items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors sm:flex-none sm:min-w-0 sm:rounded-md sm:px-3 sm:py-1.5 sm:text-xs";
const secondaryColors =
  "border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800";
const primaryButton = `inline-flex ${buttonBase} bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200`;
const secondaryButton = `inline-flex ${buttonBase} ${secondaryColors}`;
// Only rendered on touch screens, where hovering the image to see the GIF isn't possible
const touchPreviewButton = `hidden pointer-coarse:inline-flex ${buttonBase} ${secondaryColors}`;

const GitHubIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5 fill-current">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const isInProgress = project.status === "in-progress";
  const [isHovered, setIsHovered] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const hasDemoModal = Boolean(project.demoInModal && project.gifUrl);
  // Touch screens can't hover to see the GIF, so those cards get a "Preview" button instead
  const hasTouchPreview = Boolean(project.gifUrl && !project.demoInModal);

  const media = (
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
  );

  return (
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

      {/* Image – clicking it does the same as the main button */}
      {hasDemoModal ? (
        <button
          type="button"
          onClick={() => setIsDemoOpen(true)}
          aria-label={`Watch ${project.title} demo`}
          className="block w-full cursor-pointer"
        >
          {media}
        </button>
      ) : project.liveUrl ? (
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${project.title} in a new tab`}
          className="block"
        >
          {media}
        </a>
      ) : (
        media
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
          {project.title}
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400 md:line-clamp-2">
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

        {/* Actions */}
        {(hasDemoModal || project.liveUrl || project.githubUrl) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {hasDemoModal && (
              <button
                type="button"
                onClick={() => setIsDemoOpen(true)}
                className={primaryButton}
              >
                ▶ Watch demo
              </button>
            )}
            {!hasDemoModal && project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={primaryButton}
              >
                Live demo ↗
              </a>
            )}
            {hasTouchPreview && (
              <button
                type="button"
                onClick={() => setIsDemoOpen(true)}
                className={touchPreviewButton}
              >
                ▶ Preview
              </button>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={secondaryButton}
              >
                <GitHubIcon />
                GitHub repo
              </a>
            )}
          </div>
        )}
      </div>

      {project.gifUrl && (
        <DemoModal
          isOpen={isDemoOpen}
          onClose={() => setIsDemoOpen(false)}
          title={project.title}
          gifUrl={project.gifUrl}
        />
      )}
    </motion.div>
  );
};
