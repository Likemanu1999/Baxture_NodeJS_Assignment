import { Component, OnInit , ViewEncapsulation, ViewChild, Input} from '@angular/core';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../../login/login.service';
import { DatePipe } from '@angular/common';


import htmlDocx from 'html-docx-js/dist/html-docx';
import { saveAs } from 'file-saver';
import { CommonService } from '../../../shared/common-service/common-service';
import { SpiplBankService } from '../../masters/spipl-bank-master/spipl-bank-service';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { SpiplBankMaster } from '../../../shared/apis-path/apis-path';



@Component({
  selector: 'app-ilc-editor',
  templateUrl: './ilc-editor.component.html',
  styleUrls: ['./ilc-editor.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    PermissionService,
    LoginService,
    CommonService,
    SpiplBankService,
    DatePipe,
    CrudServices
  ]
})
export class IlcEditorComponent implements OnInit {
  @Input() ilc_arr: any[];
  converted: Blob;
  ckeConfig: any;
  mycontent: string;
  arr: {};
  buyerBankId: number;

  constructor(private route: ActivatedRoute, private router: Router, private spiplBank: SpiplBankService ,
    public datepipe: DatePipe , private crudServices: CrudServices) { }

  ngOnInit() {
    console.log(this.ilc_arr);

    this.buyerBankId = this.ilc_arr[0]['spipl_bank_id'];
    this.ckeConfig = {
      'editable': true, 'spellcheck': true, 'height': '700px', // you can also set height 'minHeight': '100px',
     };
     this.getDetails();
  }


  getDetails() {

    let transhipment = '';
    let partial_shipment = '';
    let PiDetail = '';
    const PiDetailArray = this.ilc_arr[0]['pi_details'];

    PiDetailArray.forEach(element => {
      PiDetail += PiDetail + element.product + 'QTY' + element.pi_quantity + 'MT (GRADE ' + element.grade + '):- DISCHARGE PORT ' + element.placeofdestination + ' AS PER PI REF. NO.' + element.proformarefno + ' DTD:' + element.pi_date + '<br> ' ;

     });

          if (this.ilc_arr[0]['transhipment'] === 1) {
            transhipment = 'ALLOWED';
      } else if (this.ilc_arr[0]['transhipment'] === 2) {
            transhipment = 'NOT ALLOWED';
      }
      if (this.ilc_arr[0]['partial_shipment'] === 1) {
            partial_shipment = 'ALLOWED';
      } else if (this.ilc_arr[0]['partial_shipment'] === 2) {
            partial_shipment = 'NOT ALLOWED';
      }


    const IlcDate =  this.datepipe.transform(new Date(this.ilc_arr[0]['ilc_date']), 'dd.MM.yyyy');
    const SupplierName = this.ilc_arr[0]['Supplier_Name'];
    const IlcAmount = this.ilc_arr[0]['lcAmount'];
    const SupplierAddress = this.ilc_arr[0]['Supplier_Address'];
    const PaymentTerms = this.ilc_arr[0]['paymentterm'];
    const LatestDateOfShipment = this.datepipe.transform(new Date(this.ilc_arr[0]['latest_date_of_shipment']), 'dd/MM/yyyy');
    const ExpiryDate = this.datepipe.transform(new Date(this.ilc_arr[0]['ilc_expiry_date']), 'dd/MM/yyyy');
    const AdvisingBankName = this.ilc_arr[0]['advising_bank_name'];
    const AdvisingBankAddress = this.ilc_arr[0]['advising_bank_address'];
    const NegotiatingBankName = this.ilc_arr[0]['negotiating_bank_name'];
    const NegotiatingBankAddress = this.ilc_arr[0]['negotiating_bank_address'];
    const PIDetails = PiDetail;
    const PlaceOfLoading = PiDetailArray[0]['placeofloading'];
    const PlaceOfDestination = PiDetailArray[0]['placeofdestination'];
    const Transhipment = transhipment;
    const PartialShipment = partial_shipment;



     this.arr = {
      IlcDate : IlcDate,
      IlcAmount : IlcAmount,
      ExpiryDate : ExpiryDate,
      SupplierName : SupplierName,
      SupplierAddress : SupplierAddress,
      PaymentTerm : PaymentTerms,
      LatestDateOfShipment : LatestDateOfShipment,
      AdvisingBankName : AdvisingBankName,
      AdvisingBankAddress : AdvisingBankAddress,
      NegotiatingBankName : NegotiatingBankName,
      NegotiatingBankAddress : NegotiatingBankAddress,
      PIDetails : PIDetails,
      PlaceOfLoading : PlaceOfLoading,
      PlaceOfDestination : PlaceOfDestination,
      Transhipment : Transhipment,
      PartialShipment : PartialShipment,

     };

     this.getTemplate(this.buyerBankId);

  }


  download() {

    const newstr = this.mycontent;
    let html_document = '<!DOCTYPE html><html><head><title></title>';
    html_document  += '</head><body>' + newstr + '</body></html>';
    this.converted = htmlDocx.asBlob(html_document, {orientation: 'potrait'});
     saveAs(this.converted, 'ILc Application');
  }

  onBack() {
    this.router.navigate(['local-purchase/ilc-pi-list']);
  }

  getTemplate(bank_id) {
    // console.log(bank_id);
    this.crudServices.getOne<any>(SpiplBankMaster.getOne, {id : bank_id}).subscribe((response) => {
        this.mycontent = response[0]['ilc_template'];
        // console.log(this.mycontent);
        this.replaceStr();
      });

  }

  replaceStr() {
    for (const key in this.arr) {
      if (!this.arr.hasOwnProperty(key)) {
          continue;
      }

      this.mycontent = this.mycontent.replace(new RegExp('{' + key + '}', 'g'), this.arr[key]);
    }
      }


}





