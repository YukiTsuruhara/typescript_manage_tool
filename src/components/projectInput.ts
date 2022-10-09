import { Component } from "./projectBase";
import { autobind } from "../decorator/autobind";
import { projectStore } from "../store/index";
import { validatable, validate } from "../utils/validation";

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
    const mandayValidate: validatable = {
      value: +manday,
      min: 0,
      max: 100,
    };

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
