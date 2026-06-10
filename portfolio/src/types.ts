export interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  imageUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  status: "completed" | "in-progress";
}
