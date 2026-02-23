import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BackendService } from '../../../services/backend.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view',
  imports: [RouterLink, CommonModule],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss'
})
export class ViewComponent {
  private backendService = inject(BackendService);
  private authService = inject(AuthService);
  isLoggedIn: boolean = false;
  imageSrc: string = '';
  placeholderSrc: string = '/profile.svg';
  isLoaded: boolean = false;

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn$().value;
  }
}
