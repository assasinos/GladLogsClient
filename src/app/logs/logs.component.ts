import { HttpClient } from '@angular/common/http';
import { ApplicationRef, Component, ComponentFactoryResolver, OnInit, createComponent } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GetAllActivityWeekResponses } from '../../types/ActivityWeekResponse';
import { GetAllMessages } from '../../types/GetMessages';
import { MessageComponent } from '../message/message.component';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from '../app.component';
import { DataSharingService } from '../services/data-sharing.service';
import { EmoteDictionary } from 'twitch-emotes-lib/dist/types/Emote';
import { EmoteClient } from 'twitch-emotes-lib';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.css'
})
export class LogsComponent implements OnInit {



  onLoadMessages(arg0: number) {

    this.http
    .get<GetAllMessages>(
      `${this.dataService.hostname}/api/logs/messages/${this.chatname}/${this.username}/${arg0}`
    )
    .subscribe({
      next: async (result) => {
        const messages = result;

        messages.messages.reverse()

        

        // Locate a DOM node that would be used as a host.
        const hostElement = document.getElementById(`week_${arg0}`);
        if (!hostElement) {
          return;
        }
        hostElement.innerHTML = '';
        // Get an `EnvironmentInjector` instance from the `ApplicationRef`.
        const environmentInjector = this.ref.injector;

        // We can now create a `ComponentRef` instance.
        const componentRef = createComponent(MessageComponent, {hostElement, environmentInjector});

        componentRef.setInput('messages',messages);
        componentRef.setInput('username',this.username);

        //Wait 2 seconds if messages wasn't loaded successfully
        if(!this.emotes){
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
        componentRef.setInput('emotes',this.emotes);

        this.ref.attachView(componentRef.hostView);
        componentRef.changeDetectorRef.detectChanges();

      },
      error: (error) => {
        console.error(error);
      },
    });



  }

  GetDate(arg0: number) :string {
    const startDate: Date = new Date(Date.now());
    startDate.setDate(startDate.getDate() - arg0 * 7 -2);

    const endDate: Date = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    return `${endDate.getDate() -1}/${endDate.getMonth()} - ${startDate.getDate()}/${startDate.getMonth()}`;
  }


  username: string = '';
  chatname: string = '';
  
  emotes : EmoteDictionary | null = null;


  activeWeeks: GetAllActivityWeekResponses | null = null;


  GetEmoteDictLenght() : number {
    if(this.emotes){
      return Object.keys(this.emotes).length;
    }
    return -1;
  
  }; 


  DismissEmoteToast() {
    //This will make emotes null so GetEmoteDictLenght will return -1
    this.emotes = null;
  }


  async GetEmotes(){
      //Loading Emotes each time chat is checked seems to be unnecessary and slow
      //So I think storing these in a sessionStorage is a good idea
      //LocalStorage would be a good idea if emotes would not change, but they do :(
        if(sessionStorage.getItem(`emotes.${this.chatname}`) === null){
          const emoteClient = new EmoteClient(this.chatname);
          this.emotes = await emoteClient.GetAllEmotesDictionary();
          if(this.GetEmoteDictLenght() === 0){
            return;
          }
          sessionStorage.setItem(`emotes.${this.chatname}`, JSON.stringify(this.emotes));
          return;
        }
        //Get emotes from session storage
        this.emotes = JSON.parse(sessionStorage.getItem(`emotes.${this.chatname}`) as string);
  }



  constructor(private http: HttpClient, private route: ActivatedRoute, private ref : ApplicationRef, private dataService: DataSharingService) {}
  async ngOnInit(): Promise<void> {
    //Get params
    this.route.params.subscribe({
      next: (value) => {
        this.dataService.updateUserValues(value['chat'], value['nickname']);
        this.chatname = value['chat'];
        this.username = value['nickname'];
      },
      error: (err) => console.error('Error Loading Messages: ' + err),
    });

    //Get user active weeks
    this.http
      .get<GetAllActivityWeekResponses>(
        `${this.dataService.hostname}/api/logs/user/${this.chatname}/${this.username}`
      )
      .subscribe({
        next: (result) => {
          this.activeWeeks = result;
          this.activeWeeks.weeks.reverse();
        },
        error: (error) => {
          console.error(error);
        },
      });


      await this.GetEmotes();
  }
}
