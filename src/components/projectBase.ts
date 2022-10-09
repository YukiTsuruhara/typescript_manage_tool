export abstract class Component<
    T extends HTMLElement,
    U extends HTMLElement
  > {
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
