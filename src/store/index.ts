import { Project, ProjectStatus } from "../models/project";

type Listener<T> = (items: T[]) => void;
class State<T> {
  protected listeners: Listener<T>[] = [];
  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

// project state management
export class ProjectStore extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectStore;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectStore();
    return this.instance;
  }

  addproject(title: string, description: string, manday: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      manday,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    this.updateListener();
  }

  moveProject(prjId: string, newStatus: ProjectStatus) {
    const targetProject = this.projects.find((item) => item.id === prjId);
    if (targetProject && newStatus !== targetProject.status) {
      targetProject.status = newStatus;
      this.updateListener();
    }
  }

  private updateListener() {
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

export const projectStore = ProjectStore.getInstance();
