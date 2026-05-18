import { Component } from '@angular/core';
import { AppShellComponent } from './layouts/app-shell/app-shell.component';

@Component({
  selector: 'zrgenesiscloud-root',
  standalone: true,
  imports: [AppShellComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'zrgenesiscloud';
}
