import { Component } from '@angular/core';
import { ElectronService } from 'ngx-electron';
@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['./app.component.less'],
})
export class AppComponent {
    appVersion: string;

    constructor(private electronService: ElectronService) {}

    ngOnInit() {
        this.appVersion = this.electronService.remote.app.getVersion();
    }
}
