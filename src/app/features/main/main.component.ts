import { Component, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { FeedComponent } from '../feed/feed.component';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  imports: [FeedComponent, CommonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  private authService = inject(AuthService);
  private authSub?: Subscription;
  loggedIn: boolean = false;

  ngOnInit() {
    this.authSub = this.authService.isLoggedIn$().subscribe(isLoggedIn => {
      this.loggedIn = isLoggedIn;
    });
  }

  ngOnDestroy() {
    this.authSub?.unsubscribe();
  }
}
