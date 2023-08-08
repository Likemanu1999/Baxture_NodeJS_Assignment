


import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import htmlDocx from 'html-docx-js/dist/html-docx';
import { saveAs } from 'file-saver';
import { AppointmentMail, EmailTemplateMaster, FileUpload, insuranceClaim, IntroductionMail, NonNegotiable, nonNegotiable } from '../../../shared/apis-path/apis-path';
import { DatePipe } from '@angular/common';
import { InrCurrencyPipe } from '../../../shared/currency/currency.pipe';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AmountToWordPipe } from '../../../shared/amount-to-word/amount-to-word.pipe';
import { NullReplacePipe } from '../../../shared/null-replace/null-replace.pipe';

@Component({
  selector: 'app-insurance-mail-editor',
  templateUrl: './insurance-mail-editor.component.html',
  styleUrls: ['./insurance-mail-editor.component.css'],
  providers: [CrudServices, ToasterService, DatePipe, InrCurrencyPipe, AmountToWordPipe, NullReplacePipe],
  encapsulation: ViewEncapsulation.None
})
export class InsuranceMailEditorComponent implements OnInit {
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
  id: number;
  typeName: any;
  non_copy = [];
  non_revised_copy = [];
  be_copy = [];
  container_doc = [];
  insurancedocs: Array<File> = [];
  listfilesData = [];
  progress: number;
  progress_bar: boolean;
  constructor(
    private crudServices: CrudServices,
    toasterService: ToasterService,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private AmountToWordPipe : AmountToWordPipe,
    private NullReplacePipe: NullReplacePipe
  ) {

    this.addForm = new FormGroup({

      'emailto': new FormControl(null, Validators.required),
      'emailcc': new FormControl(null),
      'lc_insurance_copy': new FormControl(null),

    });

    this.ckeConfig = {
      'editable': true, 'spellcheck': true, 'height': '700px', // you can also set height 'minHeight': '100px',
    };


  }



  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.id = params['id'];
      this.typeName = params['type']
    });
   
    if (this.typeName == 'intimation') {
      this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Insurance Intimation Mail' }).subscribe(response => {
        this.templateData = response;
        // console.log(response.custom_html);

        this.mycontent = response[0].custom_html;
        this.subject = response[0].subject;

      })


    }

    if (this.typeName == 'monetary') {
      this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Monetary Claim' }).subscribe(response => {
        this.templateData = response;
        // console.log(response.custom_html);

        this.mycontent = response[0].custom_html;
        this.subject = response[0].subject;

      })

     

    }

    if (this.typeName == 'damage') {
      this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Damage Ceritificate Letter' }).subscribe(response => {
        this.templateData = response;
        // console.log(response.custom_html);

        this.mycontent = response[0].custom_html;
        this.subject = response[0].subject;

      })
    }

    if (this.typeName == 'claim') {
      this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Claim Bill' }).subscribe(response => {
        this.templateData = response;
        // console.log(response.custom_html);

        this.mycontent = response[0].custom_html;
        this.subject = response[0].subject;

      })
    }
    this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Footer' }).subscribe(response => {
      this.foot = response[0].custom_html;

    })

    this.getData();

  }

  
	addInsuranceDocs(event: any) {
    this.listfilesData = [];
    this.progress_bar = false;
    this.progress = 0;
		this.insurancedocs = <Array<File>>event.target.files;
    let fileData: FormData = new FormData();
    
    if (this.insurancedocs.length > 0) {
      for (let i = 0; i < this.insurancedocs.length; i++) {
        fileData.append('additional_material_insurance_doc', this.insurancedocs[i], this.insurancedocs[i]['name']);
      }
    }

    this.progress_bar = true;
    this.progress = 20;

    this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {

      let fileDealDocs1 = [];
      let filesList1 = [];
      

      this.progress = 40;
      if (res.uploads.additional_material_insurance_doc) {
        
        this.progress = 60;
        filesList1 = res.uploads.additional_material_insurance_doc;
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

  getData() {

    this.crudServices.getOne<any>(insuranceClaim.getData, { n_id: this.id }).subscribe(response => {
     
      let data = response[0];
      let bl_no = '';
      let be_no = '';
      let godown_address = '';
      let godown_gst = '';
      let godown_incharge_name = '';
      let godown_incharge_contact = '';
      let html = '';
      let tot_non_qty = 0;
      let rate = 0;
      let totShotDamage = 0;
      let bag_size = 25;
      let bank_name = '';
      let bank_address  = '';
      let account_no  = '';
      let swift_code  = '';
      let ifsc_code  ='';
      let product = "";

      product = data.grade_master.main_grade.product_master.name;

      if(data.non_copy != null) {
        this.non_copy = JSON.parse(data.non_copy);
      }

      if(data.non_revised_copy) {
        this.non_revised_copy = JSON.parse(data.non_revised_copy);
      }

      if (data.bill_of_ladings != null) {

        bl_no = data.bill_of_ladings.reduce((sum, item) => sum + item.bill_lading_no + " ", " ")

      
        //let html : 
      }

      if (data.rel_non_pis != null) {
        tot_non_qty = data.rel_non_pis.reduce((sum, item) => sum + Number(item.pi_qty), 0);
        let pi_rate = data.rel_non_pis.reduce((sum, item) => sum + Number(item.flc_proforma_invoice.pi_rate), 0);
        bag_size = data.rel_non_pis[0].flc_proforma_invoice.material_pack_master.value;
        rate = pi_rate / data.rel_non_pis.length;


      }

      if (data.container_details.length) {

        totShotDamage = data.container_details.reduce((sum, item) => sum + Number(item.short_material_qty + item.damage_material_qty), 0)



        godown_address = data.container_details[0].godown ? data.container_details[0].godown.godown_address : '';
        godown_gst = data.container_details[0].godown ? data.container_details[0].godown.gst_no : '';
        godown_incharge_name = data.container_details[0].godown ? data.container_details[0].godown.godown_incharge_name : '';
        godown_incharge_contact = data.container_details[0].godown ? data.container_details[0].godown.godown_incharge_contact : '';
        html = `<table class="table table-bordered">
      <thead>
      <tr>
      <td>Container Number </td>
      <td> Short/Damage Qty</td>
      <td> Remark </td>

      </tr>
      </thead>  <tbody> `

        for (let val of data.container_details) {
          if (val.short_material_qty || val.damage_material_qty) {
            if(val.short_damage_doc != null) {
              this.container_doc = [];
              let doc = JSON.parse(val.short_damage_doc);
              for(let cdoc of doc) {
                this.container_doc.push(cdoc)
              }
            }
            html = html + `<tr> 
          <td> ${val.container_number}</td>
          <td> ${val.short_material_qty + val.damage_material_qty}</td>
          <td> ${this.NullReplacePipe.transform(val.damage_remark) + ' ' + this.NullReplacePipe.transform(val.short_remark)}</td>
           </tr>`
          }
        }
        html = html + `</tbody> 
      </table>`


      }

      if (data.exbond_details.length) {

        totShotDamage = data.exbond_details.reduce((sum, item) => sum + Number(item.short_qty + item.damage_qty), 0)



        godown_address = data.exbond_details[0].godown ? data.exbond_details[0].godown.godown_address : '' ;
        godown_gst = data.exbond_details[0].godown ? data.exbond_details[0].godown.gst_no : '';
        godown_incharge_name = data.exbond_details[0].godown ? data.exbond_details[0].godown.godown_incharge_name : '';
        godown_incharge_contact = data.exbond_details[0].godown ? data.exbond_details[0].godown.godown_incharge_contact : '';
        html = `<table class="table table-bordered">
    <thead>
    <tr>
    <td>EXBOND QTY </td>
    <td> REMARK </td>

    </tr>
    </thead>  <tbody> `

        for (let val of data.exbond_details) {
          if (val.short_qty || val.damage_qty) {
            html = html + `<tr> 
     
        <td> ${val.short_qty + val.damage_qty}</td>
        <td> ${this.NullReplacePipe.transform(val.damage_remark) + ' ' + this.NullReplacePipe.transform(val.short_remark)}</td>
         </tr>`
          }
        }
        html = html + `</tbody> 
    </table>`


      }





      if (data.bill_of_entries != null) {
        this.be_copy = [];
        be_no = data.bill_of_entries.reduce((sum, item) => sum + item.be_no + " ", " ")
        for(let val of data.bill_of_entries) {
           if(val.be_copy !== null) {
            let doc = JSON.parse(val.be_copy);
            for(let d of doc) {
               this.be_copy.push(d);
            }
           }
        }

      }

      if(data.insuranceCmp) {
        if( data.insuranceCmp.org_bank_masters.length) {
           bank_name = data.insuranceCmp.org_bank_masters[0].bank_name;
           bank_address  = data.insuranceCmp.org_bank_masters[0].bank_address;
           account_no  = data.insuranceCmp.org_bank_masters[0].account_no;
           swift_code  = data.insuranceCmp.org_bank_masters[0].swift_code;
           ifsc_code  = data.insuranceCmp.org_bank_masters[0].ifsc_code;
        } 
      }

      let amt = ((totShotDamage * rate  ) * 0.2 )+ (totShotDamage * rate);
      let torn_bags =  ( totShotDamage * 1000 ) / bag_size;
      let myDate = new Date();

      let add_per_amt = totShotDamage * rate * (data.additional_inc_percent / 100);
      let sum = Number(totShotDamage * rate) + Number(add_per_amt) - Number(data.total_inc_amount)
      let rep_arr = {
        INVOICE_NO: data.invoice_no,
        MATERIAL_RECEIVED_DT: data.invoice_no,
        BL_NO: bl_no,
        BE_NO: be_no,
        GODOWN_ADDRESS: godown_address,
        GODOWN_GST: godown_gst,
        GODOWN_INCHARGE_NAME: godown_incharge_name,
        GODOWN_INCHARGE_CONTACT: godown_incharge_contact,
        CONTAINER_LIST: html,
        POLICY_NO: data.policy_number,
        VESSEL_NAME: data.policy_number,
        SALVAGE: data.salvage_value,
        INSURANCE_COMPANY: data.insuranceCmp ? data.insuranceCmp.sub_org_name : "",
        BANK_NAME: bank_name,
        BANK_ADD: bank_address,
        BANK_ACC_NO: account_no,
        BANK_SWIFT: swift_code,
        BANK_IFSC : ifsc_code,
        SHIPPING_LINE: data.shippingLine ? data.shippingLine.sub_org_name : "",
        ETA: data.arrival_date ? this.datePipe.transform(data.arrival_date, 'dd/MM/yyyy') : "",
        QTY_KG: totShotDamage * 1000,
        AMOUNT_LOSS : amt,
        BAGS : torn_bags,
        BAG_CONT: bag_size,
        QTY_MT: totShotDamage,
        AMOUNT:Number (totShotDamage * rate),
        RATE: rate,
        DATE: this.datePipe.transform(myDate ,'dd.MM.yyyy'),
        ADD_PER: Number(data.additional_inc_percent),
        AMT_PERCENT:Number( totShotDamage * rate * (data.additional_inc_percent / 100)),
        ADDITIONAL_AMOUNT: Number(data.total_inc_amount),
        SUM : sum,
        IN_WORDS : this.AmountToWordPipe.transform(sum) ,
        PRODUCT_NAME: product,
        CLAIM_NO: this.NullReplacePipe.transform(data.claim_note_number)

      }
      console.log(rep_arr);
      
      this.replaceStr(rep_arr)
    })

  }
  replaceStr(data) {

    for (const key in data) {
      this.mycontent = this.mycontent.replace(new RegExp('{' + key + '}', 'g'), data[key]);
      this.subject = this.subject.replace(new RegExp('{' + key + '}', 'g'), data[key]);
    }

  }

  sendMail() {
    let emailto = [];
    let emailcc = [];
    let attachment = [];

    console.log(this.listfilesData);
    

    let content = this.mycontent + this.foot;
    if (this.addForm.value.emailto) {
      emailto = this.addForm.value.emailto.split(',');
    }

    if (this.addForm.value.emailcc) {
      emailcc = this.addForm.value.emailcc.split(',');
    }

    if(this.typeName == 'intimation') {
      for (let j = 0; j < this.non_copy.length; j++) {
        const test = this.non_copy[j].split('/');
  
        attachment.push({ 'filename': test[4], 'path': this.non_copy[j] });
      }
  
      for (let j = 0; j < this.non_revised_copy.length; j++) {
        const test = this.non_revised_copy[j].split('/');
  
        attachment.push({ 'filename': test[4], 'path': this.non_revised_copy[j] });
      }
  
      for (let j = 0; j < this.be_copy.length; j++) {
        const test = this.be_copy[j].split('/');
  
        attachment.push({ 'filename': test[4], 'path': this.be_copy[j] });
      }
  
      for (let j = 0; j < this.container_doc.length; j++) {
        const test = this.container_doc[j].split('/');
  
        attachment.push({ 'filename': test[4], 'path': this.container_doc[j] });
      }
  
    }

   
    if(this.listfilesData.length) {
      for (let j = 0; j < this.listfilesData.length; j++) {
        const test = this.listfilesData[j].split('/');
  
        attachment.push({ 'filename': test[4], 'path': this.listfilesData[j] });
      }
    }

   
    


    // const document: Array<File> = this.insurancedocs;
    // if (document.length > 0) {
    //   for (let i = 0; i < document.length; i++) {
    //      console.log(document[i]);
         
    //     attachment.push({ 'filename':  document[i]['name'], 'path': document[i]['name'] });
    //   }
    // }

    let data = {id : this.id}
    let date = new Date();
    if(this.typeName == 'intimation') {
      data['intimation_mail_send_date'] = date;
    }

    if(this.typeName == 'monetory') {
      data['monetory_mail_send_date'] = date;
    }

    if(this.typeName == 'damage') {
      data['damage_mail_send_date'] = date;
    }

    if(this.typeName == 'claim') {
      data['claim_mail_send_date'] = date;
    }



    const send = { 'to': emailto,  'cc': emailto, 'subject': this.subject, 'html': this.mycontent , 'attachments':attachment};
    console.log(send);
    

    this.isLoading = true;
    this.crudServices.postRequest<any>(insuranceClaim.sendMailInsurance, { mail_object: send , data : data}).subscribe(res => {
      this.isLoading = false;
      this.progress_bar = false;
      this.progress = 0;
      this.addForm.reset();
      this.listfilesData = [];
      if(res) {
        this.toasterService.pop(res.message, res.message, res.data);
      }
    
    

    })

  }

   toBase64(file) {
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
  });
   }

}
