import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { LoginService } from '../../login/login.service';
import { FileUpload, StaffMemberMaster } from '../../../shared/apis-path/apis-path';
import { DatePipe } from '@angular/common';
import { InrCurrencyPipe } from '../../../shared/currency/currency.pipe';
import { UserDetails } from '../../login/UserDetails.model';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-mail-to-customers',
  templateUrl: './mail-to-customers.component.html',
  styleUrls: ['./mail-to-customers.component.scss'],
  providers: [CrudServices, ToasterService, DatePipe, InrCurrencyPipe, LoginService, MessageService],
  encapsulation: ViewEncapsulation.None
})
export class MailToCustomersComponent implements OnInit {
  private toasterService: ToasterService;
  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });
  isLoading: boolean;
  ckeConfig: { editable: boolean; spellcheck: boolean; height: string; };
  zone: any;
  addForm: FormGroup;
  user: UserDetails;
  company_id: any;
  show_mail_list: boolean;
  listfilesData = [];
  progress_bar: boolean;
  progress: number;
  attachmentDoc: File[];
  constructor(
    private crudServices: CrudServices,
    toasterService: ToasterService,
    private datePipe: DatePipe,
    private loginService: LoginService,
    private messageService: MessageService
  ) {
    this.toasterService = toasterService;
    this.user = this.loginService.getUserDetails();
    this.company_id = this.user.userDet[0].company_id;
    this.ckeConfig = {
      'editable': true, 'spellcheck': true, 'height': '500px', // you can also set height 'minHeight': '100px',
    };

    this.addForm = new FormGroup({

      'zone': new FormControl(null, Validators.required),
      'from_mail': new FormControl(null, Validators.required),
      'app_pass_mail': new FormControl(null),
      'to_mail': new FormControl(null),
      'attachment': new FormControl(null),
      'subject': new FormControl(null, Validators.required),
      'my_content': new FormControl(null, Validators.required),

    });


    this.crudServices.postRequest<any>(StaffMemberMaster.getMarketingPersonsNew, { company_id: this.company_id }).subscribe((response) => {
      response['data'].map(item => item.first_name = `${item.first_name} ${item.last_name}`)
      this.zone = response['data'].filter(item => item.active_status == 1);
    });





  }

  ngOnInit() {
  }


  onZoneChange(event) {

    if (event) {
      this.addForm.patchValue({ from_mail: event.email_office, app_pass_mail: event.app_pass_mail })
      this.crudServices.postRequest<any>(StaffMemberMaster.getEmailZoneCustomers, { id: event.id }).subscribe(response => {

        if (response) {
          const result = response.map(({ email_id: email }) => email);
          this.addForm.patchValue({ to_mail: result })

        }

      })
    } else {
      this.addForm.patchValue({ from_mail: null, to_mail: null })
    }


  }

  onChangeToggle(event) {

    if (event.checked == true) {
      this.show_mail_list = true
    } else if (event.checked == false) {
      this.show_mail_list = false
    }

  }

  addDocs(event: any) {
    this.listfilesData = [];
    this.progress_bar = false;
    this.progress = 0;
    this.attachmentDoc = <Array<File>>event.target.files;
    let fileData: FormData = new FormData();

    if (this.attachmentDoc.length > 0) {
      for (let i = 0; i < this.attachmentDoc.length; i++) {
        fileData.append('Zone_to_customer_mail_attachment', this.attachmentDoc[i], this.attachmentDoc[i]['name']);
      }
    }

    this.progress_bar = true;
    this.progress = 20;

    this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {

      let fileDealDocs1 = [];
      let filesList1 = [];


      this.progress = 40;
      if (res.uploads.Zone_to_customer_mail_attachment) {

        this.progress = 60;
        filesList1 = res.uploads.Zone_to_customer_mail_attachment;
        for (let i = 0; i < filesList1.length; i++) {
          fileDealDocs1.push(filesList1[i].location);
        }


        //let fileData = JSON.stringify(fileDealDocs1);

        this.listfilesData = fileDealDocs1;
        this.progress = 100;


      }

      ;


    })


  }

  send() {
    this.messageService.clear();
    this.messageService.add({ key: 'c', sticky: true, severity: 'success', summary: 'Are you sure?', detail: 'Confirm to proceed' });
  }
  onConfirm() {

    this.messageService.clear('c');
    let attachment = [];
    if (this.listfilesData.length) {
      for (let j = 0; j < this.listfilesData.length; j++) {
        const test = this.listfilesData[j].split('/');

        attachment.push({ 'filename': test[4], 'path': this.listfilesData[j] });
      }
    }

    let data = {
      from: this.addForm.value.from_mail,
      to: this.addForm.value.to_mail,
      subject: this.addForm.value.subject,
      app_pass: this.addForm.value.app_pass_mail,
      html: this.addForm.value.my_content,
      attachments: attachment
    }


    this.isLoading = true;
    this.crudServices.postRequest<any>(StaffMemberMaster.sendMail, data).subscribe(res => {

      this.isLoading = false;
      this.addForm.reset();
      this.show_mail_list = false;
      this.listfilesData = [];
      this.progress_bar = false;
      this.progress = 0;
      if (res.code = '100') {
        this.toasterService.pop(res.message, res.message, res.data);
      } else {
        this.toasterService.pop('error', 'error', 'Not Sent');
      }

    })

  }
  onReject() {
    this.messageService.clear('c');
    this.addForm.reset();
    this.show_mail_list = false;
  }
  clearEmail() {
    this.addForm.patchValue({ to_mail: null })
  }

}
