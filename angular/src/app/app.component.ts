import { Component } from '@angular/core';
import { AppSettings } from '../../../electron/src/interfaces'
import { IpcService } from './ipc.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [IpcService]
})
export class AppComponent {
  title = 'TwinCAT-HMI-Browser';

  settings: AppSettings = new AppSettings();

  constructor(private readonly _ipc: IpcService) {
    this._ipc.on("settings-change", (event, data) => {
      this.settings = <AppSettings>data;
    });
    this._ipc.invoke("settings-get").then((newSettings) => this.settings = newSettings)
  }

  submitForm() {
    console.log(this.settings);

    this._ipc.send("settings-change", this.settings);
  }
}
