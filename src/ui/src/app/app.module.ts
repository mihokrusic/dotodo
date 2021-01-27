import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { PeriodToolbarComponent } from './components/period-toolbar/period-toolbar.component';
import { TasksComponent } from './components/tasks/tasks.component';
import { TaskComponent } from './components/task/task.component';
import { TasksProgressComponent } from './components/tasks-progress/tasks-progress.component';
import { TaskNewComponent } from './components/task-new/task-new.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxElectronModule } from 'ngx-electron';

const MATERIAL_MODULES = [MatButtonModule, MatIconModule, MatDividerModule, MatMenuModule];

@NgModule({
    declarations: [
        AppComponent,
        PeriodToolbarComponent,
        TasksComponent,
        TaskComponent,
        TasksProgressComponent,
        TaskNewComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        NgxElectronModule,
        AppRoutingModule,
        ...MATERIAL_MODULES,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
