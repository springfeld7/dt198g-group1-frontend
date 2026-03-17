import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-help',
  imports: [CommonModule],
  templateUrl: './help.component.html',
  styleUrl: './help.component.scss'
})
export class HelpComponent {
  qas: any[] = [
    {
      "q": "How do I edit my profile?",
      "a": "In the menu, select 'profile' and click 'edit' on your profile page.",
      "open": false
    }, {
      "q": "How do I join an event?",
      "a": "In the menu, select 'events' and then join your desired event via the register-button.",
      "open": false
    }, {
      "q": "How do I unregister from an event?",
      "a": "In the menu, select 'events'. Next, find your event and click 'unregister'.",
      "open": false
    }, {
      "q": "How do I find the contact details from previous events?",
      "a": "In the menu, select 'matches'.",
      "open": false
    }, {
      "q": "How do I unshare my contact details?",
      "a": "In the menu, select 'matches'. Next, find the match you wish to unshare your details with and press the recycle bin.",
      "open": false
    }, {
      "q": "How do I find this help page?",
      "a": "In the menu, select 'help'.",
      "open": false
    }
  ];

  toggleAnswer(qa: any) {
    qa.open = !qa.open;
  }
}
