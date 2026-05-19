import { apiRequest } from "../services/api";

export type Project = {
  id: string;
  name: string;
  apiKey: string;
  createdAt: string;
};

type ProjectsResponse = {
  data: Project[];
};

type ProjectResponse = {
  data: Project;
};

export async function getProjects() {
  return apiRequest<ProjectsResponse>("/projects");
}

export async function createProject(name: string) {
  return apiRequest<ProjectResponse>("/projects", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}
