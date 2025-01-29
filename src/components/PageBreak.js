import { Node } from "@tiptap/core";

export const PageBreak = Node.create({
  name: "pageBreak",
  group: "block",
  selectable: true,

  parseHTML() {
    return [{ tag: "div.page-break" }];
  },

  renderHTML() {
    return ["div", { class: "page-break" }, " "];
  },

  addNodeView() {
    return () => {
      const div = document.createElement("div");
      div.classList.add("page-break");
      div.innerText = "— Page Break —";
      div.style.textAlign = "center";
      div.style.margin = "20px 0";
      div.style.borderTop = "2px dashed gray";
      return { dom: div };
    };
  },
});
