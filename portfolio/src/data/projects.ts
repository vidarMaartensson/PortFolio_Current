import pulseGridImage from "../assets/projects/pulsegrid.png";
import pulseGridGif from "../assets/projects/pulsegrid.gif";
import codeReviewerImage from "../assets/projects/code-reviewer-buddy.png";
import pullPatrolImage from "../assets/projects/pullpatrol.png";
import pullPatrolGif from "../assets/projects/pullpatrol.gif";
import type { Project } from "../types";

export const VELOQ_OS_GITHUB = "https://github.com/vidarMaartensson/VeloqOS";
export const GITHUB_PROFILE = "https://github.com/vidarMaartensson";
export const EMAIL = "vidar.maartensson@gmail.com";

export const shippedProjects: Project[] = [
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
