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
    }, {
      q: "What to expect from an event?",
      a: "You will attend three short meetings with different participants. After each meeting, you answer a few questions to help improve matching for the next round. You will be guided on who to meet and where to sit for each round.",
      open: false
    }, {
      q: "Sharing contact details?",
      a: "At the end of the event, you can choose to share your contact details with people you met. Contact details are only shared when both participants agree too.",
      open: false
    }, {
      q: "What if the conversation gets awkward?",
      a: "No worries — each meeting is short, so you're never stuck for long. Just be yourself and move on to the next match!",
      open: false
    }, {
      q: "What if I accidentally fall in love after 5 minutes?",
      a: "Then you’re ahead of schedule. Just remember there are still two more rounds to survive.",
      open: false
    }, {
      q: "Will people be silently judging me the entire time?",
      a: "Only a little. But you're also silently judging them, so it evens out.",
      open: false
    },
  ];

  toggleAnswer(qa: any) {
    qa.open = !qa.open;
  }
}
