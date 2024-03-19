import { Component, Input, OnInit } from '@angular/core';
import { GetAllMessages, Message } from '../../types/GetMessages';
import { EmoteDictionary } from 'twitch-emotes-lib/dist/types/Emote';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent {



constructor(private sanitizer: DomSanitizer) { }


GetMessageWithEmotes(message:string):string{

  let newMessage :string = "";
  for (const word of message.split(" ")) {
    if (this.emotes) {
      if (this.emotes[word]) {
        const emote = this.emotes[word];
        let srcset = "";
        for (const url of emote.urls) {
          srcset += `${url.url} ${url.size}, `;
        }
        newMessage += ` <span class="mx-2 inline"><img srcset="${srcset}" alt="${word}" /></span>`;
      }
      else {
        newMessage += ` ${word}`;
      }

    }
  }
  return newMessage;
}



GetDate(arg0: Date) {
  //Convert to proper date format
  arg0 = new Date(arg0);

  //Date is UTC, so convert to local time
  arg0 = new Date(Date.UTC(arg0.getFullYear(), arg0.getMonth(), arg0.getDate(), arg0.getHours(), arg0.getMinutes(), arg0.getSeconds()));
  return `${arg0.toLocaleString()}`;
}

  @Input() 
  username!: string;

  @Input() 
  messages!: GetAllMessages;

  @Input()
  emotes : EmoteDictionary | null = null;



}
