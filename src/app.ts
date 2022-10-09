// Drag and Drop
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTartget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

enum ProjectStatus {
  Active,
  Finished,
}

type Listener<T> = (items: T[]) => void;

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public manday: number,
    public status: ProjectStatus
  ) {}
}
class State<T> {
  protected listeners: Listener<T>[] = [];
  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

// project state management
class ProjectStore extends State<Project> {
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

const projectStore = ProjectStore.getInstance();

//validation
interface validatable {
  value: string | number;
  required?: boolean;
  max_length?: number;
  min_length?: number;
  max?: number;
  min?: number;
}

function validate(validateInputs: validatable): boolean {
  let result = true;
  if (validateInputs.required) {
    result = result && validateInputs.value.toString().trim().length !== 0;
  }
  if (
    validateInputs.max_length != null &&
    typeof validateInputs.value === "string"
  ) {
    result =
      result && validateInputs.value.trim().length <= validateInputs.max_length;
  }
  if (
    validateInputs.min_length != null &&
    typeof validateInputs.value === "string"
  ) {
    result =
      result && validateInputs.value.trim().length >= validateInputs.min_length;
  }
  if (validateInputs.max != null && typeof validateInputs.value === "number") {
    result = result && validateInputs.value <= validateInputs.max;
  }
  if (validateInputs.min != null && typeof validateInputs.value === "number") {
    result = result && validateInputs.value >= validateInputs.min;
  }
  return result;
}

//autobind decorator
function autobind(
  _target: any,
  _method: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}

// Component Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertPosition: boolean,
    newElementId?: string
  ) {
    this.templateElement = document.getElementById(
      templateId
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T;
    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as U;
    if (newElementId) {
      this.element.id = newElementId;
    }
    this.attach(insertPosition);
  }

  abstract configure(): void;
  abstract renderContent(): void;

  private attach(position: boolean) {
    this.hostElement.insertAdjacentElement(
      position ? "afterbegin" : "beforeend",
      this.element
    );
  }
}

class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  private project: Project;

  get manday() {
    if (!this.project.manday) return "";
    if (this.project.manday < 20) {
      return this.project.manday.toString() + "人日";
    } else {
      return (this.project.manday / 20).toString() + "人月";
    }
  }

  constructor(hostId: string, project: Project) {
    super("single-project", hostId, true, project.id);
    this.project = project;
    this.configure();
    this.renderContent();
  }

  @autobind
  dragStartHandler(event: DragEvent): void {
    event.dataTransfer!.setData("text/plain", this.project.id);
    event.dataTransfer!.effectAllowed = "move";
  }

  dragEndHandler(_: DragEvent): void {
    console.log("dragend");
  }

  configure(): void {
    this.element.addEventListener("dragstart", this.dragStartHandler);
    this.element.addEventListener("dragend", this.dragEndHandler);
  }
  renderContent(): void {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("h3")!.textContent = this.manday;
    this.element.querySelector("p")!.textContent = this.project.description;
  }
}

class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTartget
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

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInput: HTMLInputElement;
  descriptionInput: HTMLInputElement;
  mandayInput: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");
    this.titleInput = this.element.querySelector("#title") as HTMLInputElement;
    this.descriptionInput = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.mandayInput = this.element.querySelector(
      "#manday"
    ) as HTMLInputElement;

    this.configure();
  }
  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  renderContent() {}

  private clearInputs() {
    this.titleInput.value = "";
    this.descriptionInput.value = "";
    this.mandayInput.value = "";
  }

  private gatherUserInput(): [string, string, number] | void {
    const title = this.titleInput.value;
    const description = this.descriptionInput.value;
    const manday = this.mandayInput.value;

    const titleValidate: validatable = { value: title, required: true };
    const descriptionValidate: validatable = {
      value: description,
      max_length: 1000,
      min_length: 0,
    };
    const mandayValidate: validatable = { value: +manday, min: 0, max: 100 };

    if (
      !validate(titleValidate) ||
      !validate(descriptionValidate) ||
      !validate(mandayValidate)
    ) {
      alert("Invalid error");
    } else {
      return [title, description, parseFloat(manday)];
    }
  }

  @autobind
  submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, desc, manday] = userInput;
      projectStore.addproject(title, desc, manday);
      this.clearInputs();
    }
  }
}

const prjInput = new ProjectInput();
const prfListActive = new ProjectList("active");
const prjListFinished = new ProjectList("finished");
