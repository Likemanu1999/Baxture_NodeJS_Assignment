import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import htmlDocx from 'html-docx-js/dist/html-docx';
import { saveAs } from 'file-saver';
import { AppointmentMail, EmailTemplateMaster, IntroductionMail } from '../../../shared/apis-path/apis-path';
import { DatePipe } from '@angular/common';
import { InrCurrencyPipe } from '../../../shared/currency/currency.pipe';

@Component({
  selector: 'app-introduction-mail',
  templateUrl: './introduction-mail.component.html',
  styleUrls: ['./introduction-mail.component.css'],
  providers: [CrudServices, ToasterService, DatePipe, InrCurrencyPipe],
  encapsulation: ViewEncapsulation.None
})
export class IntroductionMailComponent implements OnInit {
  addForm: FormGroup;
  templateData: any;
  mycontent: any;
  foot: any;
  ckeConfig: { editable: boolean; spellcheck: boolean; height: string; };
  subject: any;

  private toasterService: ToasterService;
  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });
  isLoading: boolean;
  constructor(
    private crudServices: CrudServices,
    toasterService: ToasterService,
    private datePipe: DatePipe,
  ) {

    this.addForm = new FormGroup({

      'email': new FormControl(null, Validators.required),

    });

    this.ckeConfig = {
      'editable': true, 'spellcheck': true, 'height': '700px', // you can also set height 'minHeight': '100px',
    };

    this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Introduction Mail' }).subscribe(response => {
      this.templateData = response;
      this.mycontent = response[0].custom_html;
      this.subject = response[0].subject;

    })

    this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Footer' }).subscribe(response => {
      this.foot = response[0].custom_html;

    })
  }

  ngOnInit() {
  }

  sendMail() {
    let email = [];

    let content = this.mycontent + this.foot;
    if (this.addForm.value.email) {
      email = this.addForm.value.email.split(',');
    }


    const send = { 'to': email, 'subject': this.subject, 'html': content };

    this.isLoading = true;
    this.crudServices.postRequest<any>(IntroductionMail.sendMail, { mail_object: send }).subscribe(res => {
      this.isLoading = false;
      if (res.code = '100') {
        this.toasterService.pop(res.message, res.message, res.data);
      } else {
        this.toasterService.pop('error', 'error', 'Not Sent');
      }

    })

  }

}
