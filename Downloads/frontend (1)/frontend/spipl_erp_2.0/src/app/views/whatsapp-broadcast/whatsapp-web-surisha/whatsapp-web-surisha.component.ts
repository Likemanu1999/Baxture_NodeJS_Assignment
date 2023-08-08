
import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy, ElementRef, AfterViewChecked } from '@angular/core';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { WhatsappService } from '../whatsapp.service';
import { DatePipe, ViewportScroller } from '@angular/common';
import { LoginService } from '../../login/login.service';
import { UserDetails } from '../../login/UserDetails.model';
import { DomSanitizer } from "@angular/platform-browser";


@Component({
  selector: 'app-whatsapp-web-surisha',
  templateUrl: './whatsapp-web-surisha.component.html',
  styleUrls: ['./whatsapp-web-surisha.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ToasterService, PermissionService, WhatsappService, DatePipe, LoginService],
})
export class WhatsappWebSurishaComponent implements OnInit {

  heads: any;
  detailChat = [];
  @ViewChild('scrollMe', { static: true }) private myScrollContainer: ElementRef;
  @ViewChild('scrollHeads', { static: true }) private myScrollHead: ElementRef;
  contact_number: any;
  user: UserDetails;
  userId: any;
  target: boolean = false;
  message: any;
  selected: any;

  public filterQuery = '';
  filterArray = [];
  templates: import("readline").Interface[];
  addclass: boolean;
  addclassDet: boolean;
  contact_name: any;
  links: any;
  show_all_chats: boolean;
  isLoading: boolean;

  limit: number = 10;
  stopscroll: boolean;
  headLimit: number;
  count: any;



  constructor(private whatsapp: WhatsappService, private datepipe: DatePipe, private loginService: LoginService, private scroller: ViewportScroller, private sanitizer: DomSanitizer) {
    this.user = this.loginService.getUserDetails();
    this.userId = this.user.userDet[0].id;
    this.links = this.user.links;
    this.show_all_chats = (this.links.indexOf('Show All Chats') > -1);
  }

  ngOnInit() {
    this.getData();
    this.getChatHeadCount();
    this.scrollToBottom();
    this.getTemplates();
    this.backToHeads();


  }

  ngAfterViewChecked() {


  }

  getChatHeadCount() {
    let data = {}
    if (!this.show_all_chats) {
      data['user_id'] = this.userId
    }
    this.whatsapp.getChatHeads('api/whatsapp/getChatHeadCountSurisha', data).subscribe(response => {
      if (response) {
        this.count = response.count
      }

    })
  }


  getData() {
    this.headLimit = 100
    let data = {}
    if (!this.show_all_chats) {
      data['user_id'] = this.userId
    }

    data['limit'] = this.headLimit

    this.getHeads(data)

    // PUSHER CODE 
    this.whatsapp.getChannelHead().bind('new', data => {
      data.new = true;
      if (data.company == 'Surisha') {

        if (data.chat_type == 'newChat') { // For new chat (new chat key)
          if (this.heads.length == 0) {
            if (this.datepipe.transform(data.modified_date, 'dd-MM-yy') == this.datepipe.transform(new Date(), 'dd-MM-yy')) {
              data.time = this.datepipe.transform(data.modified_date, 'shortTime')
            } else {
              data.time = this.datepipe.transform(data.modified_date, 'MMM d, y h:mm a')
            }

            this.heads.push(data);

          } else { // when heads are present

            if (this.datepipe.transform(data.modified_date, 'dd-MM-yy') == this.datepipe.transform(new Date(), 'dd-MM-yy')) {
              data.time = this.datepipe.transform(data.modified_date, 'shortTime')
            } else {
              data.time = this.datepipe.transform(data.modified_date, 'MMM d, y h:mm a')
            }


            this.heads.unshift(data)
          }
        } else if (data.chat_type == "oldChat") { // for old chat (old chat key)
          var index = this.heads.findIndex(function (item, i) {
            return item.chat_key === data.chat_key
          });



          if (index > -1) {//for data load in pagination
            let time = this.datepipe.transform(data.modified_date, 'MMM d, y h:mm a');
            if (this.datepipe.transform(data.modified_date, 'dd-MM-yy') == this.datepipe.transform(new Date(), 'dd-MM-yy')) {
              time = this.datepipe.transform(data.modified_date, 'shortTime')
            } else {
              time = this.datepipe.transform(data.modified_date, 'MMM d, y h:mm a')
            }
            this.heads[index].time = time
            this.heads[index].modified_date = data.modified_date



            this.heads = this.heads.sort((a, b) => new Date(b.modified_date).getTime() - new Date(a.modified_date).getTime());
          } else { // For Data not loaded in pagignation 


            if (this.datepipe.transform(data.modified_date, 'dd-MM-yy') == this.datepipe.transform(new Date(), 'dd-MM-yy')) {
              data.time = this.datepipe.transform(data.modified_date, 'shortTime')
            } else {
              data.time = this.datepipe.transform(data.modified_date, 'MMM d, y h:mm a')
            }



            this.heads.unshift(data)
          }




        }
      }




    });


  }

  getHeads(data) {

    this.whatsapp.getChatHeads('api/whatsapp/getChatHeadsSurisha', data).subscribe(response => {

      response.map(item => {

        if (this.datepipe.transform(item.modified_date, 'dd-MM-yy') == this.datepipe.transform(new Date(), 'dd-MM-yy')) {
          item.time = this.datepipe.transform(item.modified_date, 'shortTime')
        } else {
          item.time = this.datepipe.transform(item.modified_date, 'MMM d, y h:mm a')
        }
        return item;
      })
      this.heads = response;
      this.heads = this.heads.sort((a, b) => new Date(b.modified_date).getTime() - new Date(a.modified_date).getTime());


    })
  }

  backToHeads() {
    if (window.innerWidth < 658) {
      this.addclass = false
      this.addclassDet = true;
    } else {
      this.addclass = false;
      this.addclassDet = false;
    }
  }

  getChatDetails(item) {
    this.scrollToBottom();
    this.stopscroll = false
    this.isLoading = true;

    if (window.innerWidth < 658) {
      this.addclass = true;
      this.addclassDet = false;

    } else {
      this.addclass = false
      this.addclassDet = true;
    }



    this.target = false;
    this.selected = item.chat_key;
    this.contact_number = item.contact_number;
    this.contact_name = item.header;
    this.limit = 10


    this.whatsapp.getChatDetails('api/whatsapp/getchatDetails', { chat_key: item.chat_key, limit: 10 }).subscribe(response => {
      this.isLoading = false;
      if (response.length) {
        response.map(item => {
          if (this.datepipe.transform(item['created_date'], 'dd-MM-yy') == this.datepipe.transform(new Date(), 'dd-MM-yy')) {
            item['time'] = this.datepipe.transform(item['created_date'], 'shortTime')
          } else {
            item['time'] = this.datepipe.transform(item['created_date'], 'MMM d, y h:mm a')
          }

          item['contact_name'] = item['whatsapp_chat_detail']['contact_name']

          if (item['template_name'] != null && item['template_name'] != 'quick_button_image') {
            let data = this.templates.find(det => det['template_name'] == item['template_name'])
            if (data) {
              var newStr = ''
              let body = data['body'].toString()
              for (let i = 0; i < item['params'].length; i++) {


                body = body.replace(`{{${i + 1}}}`, item['params'][i]);


              }

              item['templateBody'] = body

              if (item['status'] == 'seen') {
                item['statusColorClass'] = 'badge badge-success';
              } else if (item['status'] == 'failed') {
                item['statusColorClass'] = 'badge badge-danger';
              } else if (item['status'] == 'delivered') {
                item['statusColorClass'] = 'badge badge-primary';
              } else {
                item['statusColorClass'] = 'badge badge-primary';
              }






            }
          }
          return item;
        })
        this.detailChat = response;
        setTimeout(() => {
          this.scrollToBottom();
        }, 1);
      }

    })
    this.whatsapp.getChannel().bind('new', data => {
      data.new = true;

      if (this.detailChat[0].chat_key == data.chat_key) {
        if (this.datepipe.transform(data['created_date'], 'dd-MM-yy') == this.datepipe.transform(new Date(), 'dd-MM-yy')) {
          data['time'] = this.datepipe.transform(data['created_date'], 'shortTime')
        } else {
          data['time'] = this.datepipe.transform(data['created_date'], 'MMM d, y h:mm a')
        }

        if (data['template_name'] != null && data['template_name'] != 'quick_button_image') {
          let data = this.templates.find(det => det['template_name'] == data['template_name'])
          if (data) {
            var newStr = ''
            let body = data['body'].toString()
            for (let i = 0; i < data['params'].length; i++) {


              body = body.replace(`{{${i + 1}}}`, data['params'][i]);


            }

            data['templateBody'] = body

            if (data['status'] == 'seen') {
              data['statusColorClass'] = 'badge badge-success';
            } else if (data['status'] == 'failed') {
              data['statusColorClass'] = 'badge badge-danger';
            } else if (data['status'] == 'delivered') {
              data['statusColorClass'] = 'badge badge-primary';
            } else {
              data['statusColorClass'] = 'badge badge-primary';
            }

          }
        }

        let result = this.detailChat.filter(item => item.message_id == data.message_id)

        if (result.length == 0) {
          this.detailChat.push(data)
        }


        setTimeout(() => {
          this.scrollToBottom();

        }, 1);
      }


    });
  }




  scrollToBottom(): void {
    this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;

  }

  sendMsg() {
    if (this.message) {
      this.target = false;
      this.whatsapp.sendMsg('api/whatsapp/sendChatMessage', { message: this.message, to: this.contact_number, userId: this.userId, company_id: 3 }).subscribe(response => {
        this.message = null

      })
    }



  }

  scrollToTarget(val) {
    document.getElementById(val).scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest"
    });


  }

  getTemplates() {
    this.whatsapp.getChatDetails('api/whatsapp/gettemplateDet', {}).subscribe(response => {
      this.templates = response

    })
  }

  isActive(item) {
    return this.selected === item;
  }

  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  onScroll() {



    let element = this.myScrollContainer.nativeElement

    let atBottom = Math.floor(element.scrollHeight - element.scrollTop) === element.clientHeight

    if (!atBottom && element.scrollTop == 0 && !this.stopscroll) {

      this.limit = this.limit + 5
      this.getChatOnscroll()
    }

  }

  getChatOnscroll() {


    this.isLoading = true;
    this.stopscroll = false;
    if (window.innerWidth < 658) {
      this.addclass = true;
      this.addclassDet = false;

    } else {
      this.addclass = false
      this.addclassDet = true;
    }





    this.whatsapp.getChatDetails('api/whatsapp/getchatDetails', { chat_key: this.selected, limit: this.limit }).subscribe(response => {
      this.isLoading = false;
      if (response.length) {

        response.map(item => {
          if (this.datepipe.transform(item['created_date'], 'dd-MM-yy') == this.datepipe.transform(new Date(), 'dd-MM-yy')) {
            item['time'] = this.datepipe.transform(item['created_date'], 'shortTime')
          } else {
            item['time'] = this.datepipe.transform(item['created_date'], 'MMM d, y h:mm a')
          }

          item['contact_name'] = item['whatsapp_chat_detail']['contact_name']

          if (item['template_name'] != null && item['template_name'] != 'quick_button_image') {
            let data = this.templates.find(det => det['template_name'] == item['template_name'])
            if (data) {
              var newStr = ''
              let body = data['body'].toString()
              for (let i = 0; i < item['params'].length; i++) {


                body = body.replace(`{{${i + 1}}}`, item['params'][i]);


              }

              item['templateBody'] = body

              if (item['status'] == 'seen') {
                item['statusColorClass'] = 'badge badge-success';
              } else if (item['status'] == 'failed') {
                item['statusColorClass'] = 'badge badge-danger';
              } else if (item['status'] == 'delivered') {
                item['statusColorClass'] = 'badge badge-primary';
              } else {
                item['statusColorClass'] = 'badge badge-primary';
              }

            }
          }
          return item;
        })
        this.detailChat = response;
        if (this.detailChat.length < this.limit) {
          this.stopscroll = true
        }

        if (this.stopscroll == false) {
          setTimeout(() => {
            if (this.detailChat.length && this.detailChat.length > 5) {

              this.scrollToTarget(this.detailChat[4].message_id);
            } else if (this.detailChat.length && this.detailChat.length < 5) {
              this.scrollToTarget(this.detailChat[2].message_id);
            } else {
              this.scrollToBottom()
            }


          }, 10);
        }








      }

    })


  }

  onScrollHeads() {
    let element = this.myScrollHead.nativeElement

    let atBottom = Math.floor(element.scrollHeight - element.scrollTop) === element.clientHeight

    let nearheight = Math.floor(element.scrollHeight - element.scrollTop) - element.clientHeight


    if (atBottom || nearheight <= 1) {
      this.headLimit = this.headLimit + 100
      let data = {}
      if (!this.show_all_chats) {
        data['user_id'] = this.userId
      }

      data['limit'] = this.headLimit
      this.getHeads(data)
    }


  }

  searchHead(val) {
    let data = {}
    if (!this.show_all_chats) {
      data['user_id'] = this.userId
    }
    if (val != '') {
      data['searchkey'] = val
      this.getHeads(data)
    } else {
      data['limit'] = this.headLimit
      this.getHeads(data)
    }

  }




}
