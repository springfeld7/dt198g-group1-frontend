import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { MessageComponent } from "./features/message/message.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, MessageComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'dt198g-group1-frontend';
}
