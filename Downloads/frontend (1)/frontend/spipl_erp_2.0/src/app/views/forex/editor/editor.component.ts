import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';


import htmlDocx from 'html-docx-js/dist/html-docx';
import { saveAs } from 'file-saver';
import { CommonService } from '../../../shared/common-service/common-service';
import { CreateLcService } from '../lc-creation/create-lc-service';
import { SpiplBankService } from '../../masters/spipl-bank-master/spipl-bank-service';
import { OrgBankService } from '../../masters/sub-org-master/sub-org-detail/org-bank-service';


@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    PermissionService,
    LoginService,
    CommonService,
    CreateLcService,
    SpiplBankService,
    OrgBankService,
    DatePipe
  ]
})
export class EditorComponent implements OnInit {
  converted: Blob;
  name = 'ng2-ckeditor';
  ckeConfig: any;
  mycontent: string;
  log: string = '';
  arr = {};
  tot_quantity = 0;
  // @ViewChild('myckeditor', {static: false}) ckeditor: any;

  // ViewChild('ckeditor', {static: false}) public ckeditor: any;
  @ViewChild('myEditor', { static: false }) myEditor: any;
  id: number;
  pi: any;
  response: any;
  buyer_bank_id: any;
  org_bank = [];
  avi_bank_name: any;


  constructor(private route: ActivatedRoute,
    private router: Router,
    private spiplBank: SpiplBankService,
    private lcService: CreateLcService,
    public datepipe: DatePipe,
  ) {

    this.ckeConfig = {
      'editable': true, 'spellcheck': true, 'height': '700px', // you can also set height 'minHeight': '100px',
    };

  }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.id = +params['lc_id'];
    });

    this.getDetails();

  }

  getDetails() {

    this.lcService.getOneLcInDetail(this.id)
      .subscribe(Response => {
        console.log(Response, "doc")
        const response = Response[0]['Pi_details'];
        this.buyer_bank_id = Response[0]['spipl_bank_id'];
        let totalamount = 0;
        let destPort = '';
        let tolerance = '';
        let confirmation = '';
        let transhipment = '';
        let partial_shipment = '';
        let availableBank = '';
        let avail_swift_code = '';


        for (const val of response) {
          totalamount = totalamount + val.total_pi_amount;
          destPort = destPort + val.destinationPort + ',';
        }
        if (Response[0]['tolerance'] === 0) {
          tolerance = 'Nill';
        } else if (Response[0]['tolerance'] === 1) {
          tolerance = '+/-1%';
        } else if (Response[0]['tolerance'] === 2) {
          tolerance = '+/-5%';
        }
        else if (Response[0]['tolerance'] === 3) {
          tolerance = '+/-10%';
        }

        if (Response[0]['confirmation'] === 1) {
          confirmation = 'WITH';
        } else if (Response[0]['confirmation'] === 2) {
          confirmation = 'WITHOUT';
        }

        if (Response[0]['transhipment'] === 1) {
          transhipment = 'ALLOWED';
        } else if (Response[0]['transhipment'] === 2) {
          transhipment = 'NOT ALLOWED';
        }
        if (Response[0]['partial_shipment'] === 1) {
          partial_shipment = 'ALLOWED';
        } else if (Response[0]['partial_shipment'] === 2) {
          partial_shipment = 'NOT ALLOWED';
        }


        if (Response[0]['org_bank_available'] != null) {
          availableBank = Response[0]['org_bank_available'];
          avail_swift_code = Response[0]['orgBankSwiftCode'];
        } else {
          availableBank = 'Any Bank';
          avail_swift_code = 'Any Bank';
        }


        let textval3 = '';
        let textval = '';
        let textval2 = '';
        this.tot_quantity = 0;
        let grade_name = '';
        response.forEach(element => {
          textval = textval + 'QTY ' + element['pi_quantity'] + '  ' + element['unit'] + ' , GRADE – ' + element['gradeName'] + ' PORT ' + element['destinationPort'] + ' AS PER PI NO: ' + element['proform_invoice_no'] + ' DATED ' + this.datepipe.transform(new Date(element['tentitive_departure_date']), 'dd/MM/yyyy') + '. <br> ';
          textval2 = textval2 + 'FOR QTY ' + element['pi_quantity'] + '  ' + element['unit'] + ' (GRADE ' + element['gradeName'] + '):- DISCHARGE PORT ' + element['destinationPort'] + '  For PI REF No.' + element['proform_invoice_no'] + '  DTD: ' + element['tentitive_departure_date'] + ', <br>';
          textval3 = textval3 + ' KINDLY MENTION THE GST NO. ' + element['gstNo'] + ' ON THE BILL OF LADING FOR ' + element['destinationPort'] + ' PORT,  <br>';

          this.tot_quantity = this.tot_quantity + element['pi_quantity'];
          grade_name = grade_name + element['gradeName'];

        });



        this.arr = {
          buyerBankName: response[0]['buyerBankName'],
          buyerBankAddress: response[0]['buyerBankAddress'],
          buyerOrgName: response[0]['buyerOrgName'],
          buyerOrgAddress: response[0]['buyerOrgAddress'],
          suppierOrgName: response[0]['suppierOrgName'],
          suppierOrgAddress: response[0]['suppierOrgAddress'],
          currency: response[0]['currency'],
          buyerGst: response[0]['buyerGst'],
          firstAdvBank: response[0]['firstAdvBank'],
          firstAdvBankAddress: response[0]['firstAdvBankAddress'],
          material_load_port: response[0]['material_load_port'],
          adv_bank_swift_code: response[0]['adv_bank_swift_code'],
          buyerBankSwiftCode: response[0]['buyerBankSwiftCode'],
          gradeName: response[0]['gradeName'],
          productCategory: response[0]['productName'],
          piInsuranceType: response[0]['piInsuranceType'],
          supplier_id: response[0]['supplier_id'],
          spipl_bank_id: response[0]['buyer_bank_id'],
          buyeriec: response[0]['iec'],
          portOfShipment: response[0]['material_load_port'],
          buyerPan: response[0]['panNo'],
          paymentTerm: Response[0]['payment_term'],
          transhipment: transhipment,
          partialShipment: partial_shipment,
          dateOfExpiry: this.datepipe.transform(new Date(Response[0]['lc_expiry_date']), 'dd.MM.yyyy'),
          dateOfShipment: this.datepipe.transform(new Date(Response[0]['date_of_shipment']), 'dd.MM.yyyy'),
          confirmation: confirmation,
          tolarance: tolerance,
          totalAmount: totalamount,
          invoiceDate: this.datepipe.transform(new Date(Response[0]['lc_date']), 'dd.MM.yyyy'),
          portOfDischarge: destPort,
          itemsWithGst: textval3,
          decriptionOfItems: textval,
          descriptionOfItems2: textval2,
          bankAccountNo: response[0]['BuyerBankAcc'],
          billOfLanding: Response[0]['bl_description'],
          availableBank: availableBank,
          TotalQuantity: this.tot_quantity,
          GradeName: grade_name,
          annexture6: this.datepipe.transform(new Date(Response[0]['annexe_6_date']), 'dd.MM.yyyy'),
          annexture7: this.datepipe.transform(new Date(Response[0]['annexe_7_date']), 'dd.MM.yyyy'),
          place: response[0]['supOrgplace']
        };
        console.log(this.arr, "arr");

        this.getTemplate(this.buyer_bank_id);

      });
  }



  download() {

    const newstr = this.mycontent;
    let html_document = '<!DOCTYPE html><html><head><title></title>';
    html_document += '</head><body>' + newstr + '</body></html>';
    this.converted = htmlDocx.asBlob(html_document, { orientation: 'potrait' });
    saveAs(this.converted, 'Lc Application-' + this.tot_quantity + ' MT.docx');
  }
  getTemplate(bank_id) {
    console.log(bank_id);
    this.spiplBank.getOneBank(bank_id)
      .subscribe((response) => {
        console.log(response);
        this.mycontent = response[0]['lc_template'];
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

  onBack() {
    this.router.navigate(['forex/lc-in-operation']);
  }




}
