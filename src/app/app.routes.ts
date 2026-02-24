import { Routes } from '@angular/router';
import { SignupComponent } from './features/signup/signup.component';
import { LoginComponent } from './features/login/login.component';
import { MainComponent } from './features/main/main.component';
import { MatchesComponent } from './features/matches/matches.component';
import { ViewComponent } from './features/profile/view/view.component';
import { EditComponent } from './features/profile/edit/edit.component';
import { FeedComponent } from './features/feed/feed.component';

export const routes: Routes = [
    { path: '', component: MainComponent },
    { path: 'profile', children: [
        { path: '', component: ViewComponent },
        { path: 'edit', component: EditComponent },
    ]},
    { path: 'events', component: FeedComponent },
    { path: 'matches', component: MatchesComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'login', component: LoginComponent },
];
