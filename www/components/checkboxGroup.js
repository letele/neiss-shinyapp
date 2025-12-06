export function checkboxGroup(id, options) {
  const container = document.getElementById(id);

  // Add data attribute for Shiny binding recognition
  container.setAttribute('data-shiny-input-type', 'checkboxGroup');

  // Generate HTML
  container.innerHTML = options.map(option => `
    <input type="checkbox" id="${option.id}" checked>
    <label for="${option.id}" style="text-transform: capitalize;">
      ${option.label}
    </label><br>
  `).join('');

  // ---- Custom Shiny Binding for Checkbox Group ----
  const checkboxGroupBinding = new Shiny.InputBinding();

  Object.assign(checkboxGroupBinding, {
    find: function(scope) {
      return scope.querySelectorAll("[data-shiny-input-type='checkboxGroup']");
    },

    getId: function(el) {
      return el.id;
    },

    getValue: function(el) {
      const checkedBoxes = el.querySelectorAll("input[type='checkbox']:checked");
      return Array.from(checkedBoxes).map(cb => cb.id);
    },

    setValue: function(el, value) {
      if (!Array.isArray(value)) value = [];

      const allCheckboxes = el.querySelectorAll("input[type='checkbox']");
      allCheckboxes.forEach(cb => cb.checked = value.includes(cb.id));
    },

    subscribe: function(el, callback) {
      el.addEventListener('change', function(e) {
        if (e.target.type !== 'checkbox') return;
        const checkedBoxes = el.querySelectorAll("input[type='checkbox']:checked");
        // Prevent deselecting the last checked checkbox
        if (checkedBoxes.length === 0) {
          e.target.checked = true; 
          return;
        }

        callback();
      });
    },

    unsubscribe: function(el) {
      // Remove all change listeners by cloning node
      const newEl = el.cloneNode(true);
      el.parentNode.replaceChild(newEl, el);
    },

    receiveMessage: function(el, data) {
      if (data.hasOwnProperty('value')) {
        this.setValue(el, data.value);
      }
    },

    getState: function(el) {
      return { value: this.getValue(el) };
    }
  });

  // Register the binding with Shiny
  Shiny.inputBindings.register(checkboxGroupBinding, "checkboxGroup");

  return container;
}
