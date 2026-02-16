import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuComponent } from './menu/menu.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, MenuComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  logout() {
    alert("Loggar ut");
  }
}
