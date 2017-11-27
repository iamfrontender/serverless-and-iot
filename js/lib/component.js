'use strict';

export default class Component {
  constructor(config) {
    this.config = config || {};

    this.el = {};

    this.elements();
    this.objects();
    this.listeners();
    this.init();
  }

  elements() {
    const selectors = this.config.selectors || {};

    Object.keys(selectors).forEach(selector => {
      this.el[selector] = document.querySelector(selectors[selector]);
    });
  }

  objects() {
    const objects = this.config.objects || {};

    Object.keys(objects).forEach(object => {
      let el = document.querySelector(objects[object]);
      let content = (el && el.textContent) || '{}';

      this[object] = JSON.parse(content);
    });
  }

  listeners() {
    // subclasses
  }

  init() {
    // subclasses
  };

  render(template) {
    let container = document.createElement('div');

    container.innerHTML = template;

    return container.firstElementChild;
  }
}
