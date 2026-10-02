export interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  imageUrl?: string;
  gifUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  /** Open the GIF in a modal from a "Watch demo" button instead of linking to a live site */
  demoInModal?: boolean;
  status: "completed" | "in-progress";
}
