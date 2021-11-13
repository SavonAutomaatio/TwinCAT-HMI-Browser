import { AppSettings } from './interfaces';

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

var _ipc = require('electron').ipcRenderer;
var settings: AppSettings;
var domLoaded: boolean = false;

_ipc.invoke("settings-get").then((newSettings) => updateSettings(newSettings))


function updateSettings(newSettings: AppSettings) {
  settings = newSettings;
  handleDom();
}


window.addEventListener("DOMContentLoaded", () => {
  domLoaded = true;
  handleDom();
});

function handleDom() {
  if (!domLoaded || settings == null)
    return;

  if (settings.tcHmiUser || settings.tcHmiPassword) {
    let form = document.querySelector<HTMLFormElement>('.login-container form');
    if (form) {
      console.log("Found login form: " + form);
      let userInput = form.querySelector<HTMLInputElement>('input[name="Username"]');
      let userSelect = form.querySelector<HTMLSelectElement>('select[name="Username"]');
      let passwordInput = form.querySelector<HTMLInputElement>('input[name="Password"]');
      let persistentCheckbox = form.querySelector<HTMLInputElement>('input[name="Persistent"]');

      if (!userSelect) {
        userSelect = form.querySelector<HTMLSelectElement>('select[id="select-user"]');
      }

      if (userInput && settings.tcHmiUser) {
        userInput.value = settings.tcHmiUser;
      }
      if (userSelect && settings.tcHmiUser) {
        for (let i = 0; i < userSelect.options.length; i++) {
          let option = userSelect.options[i];
          console.log(option);
          console.assert(option.value == settings.tcHmiUser, "Option %s does not match setting %s", option.value, settings.tcHmiUser);
          if (option.value == settings.tcHmiUser) {
            userSelect.selectedIndex = i;
            console.log("Selected user index " + i);
            break;
          }
        }
      }
      if (passwordInput && settings.tcHmiPassword) {
        passwordInput.value = settings.tcHmiPassword;
        if (persistentCheckbox) {
          persistentCheckbox.checked = true;
        }
        if (settings.tcHmiAutoLogin) {
          _ipc.invoke("autologin-done", false).then((done) => {
            if (!done) {
              console.log("Auto login");
              _ipc.invoke("autologin-done", true).then(() => {
                setTimeout(() => {
                  form.submit();
                }, 5000);
              });
            }
          });
        }
      }
    }
  }
}