import { Component } from "./projectBase";
import { ProjectItem } from "./projectItem";
import { DragTarget } from "../models/dragAndDropInterfaces";
import { Project, ProjectStatus } from "../models/project";
import { autobind } from "../decorator/autobind";
import { projectStore } from "../store/index";

export class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: Project[];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  private renderProjects() {
    const listElement = document.getElementById(
      `${this.type}-project-list`
    )! as HTMLUListElement;
    listElement.innerHTML = "";
    for (const prjItem of this.assignedProjects) {
      new ProjectItem(listElement.id, prjItem);
    }
  }

  @autobind
  dragOverHandler(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault();
      this.element.querySelector("ul")!.classList.add("droppable");
    }
  }

  @autobind
  dropHandler(event: DragEvent): void {
    const prjId = event.dataTransfer!.getData("text/plain");
    projectStore.moveProject(
      prjId,
      this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }

  @autobind
  dragLeaveHandler(_: DragEvent): void {
    this.element.querySelector("ul")!.classList.remove("droppable");
  }

  configure() {
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("drop", this.dropHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);
    projectStore.addListener((projects: Project[]) => {
      const releavantProjects = projects.filter((item) => {
        if (this.type === "active") {
          return item.status === ProjectStatus.Active;
        }
        return item.status === ProjectStatus.Finished;
      });
      this.assignedProjects = releavantProjects;
      this.renderProjects();
    });
  }

  renderContent() {
    const listId = `${this.type}-project-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type === "active" ? "実行中プロジェクト" : "完了プロジェクト";
  }
}
