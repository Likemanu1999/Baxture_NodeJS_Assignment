import { Component, OnInit , ViewEncapsulation} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { environment } from '../../../../environments/environment';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { SpiplBankService } from '../../masters/spipl-bank-master/spipl-bank-service';
import { MainSubOrgService } from '../../masters/sub-org-master/main-sub-org-service';
import { ProformaInvoiceService , ProformaInvoiceList} from '../proforma-invoice/proforma-invoice-service';
import { PaymentTermService } from '../../masters/payment-term-master/payment-term-service';
import { CreateLcService , CreateLcList} from '../lc-creation/create-lc-service';
import { OrgBankService } from '../../masters/sub-org-master/sub-org-detail/org-bank-service';

// import { Packer } from 'docx';
// import { saveAs } from 'file-saver';
// import { DocumentCreator } from '../lc-creation/doc-generator';
import { __await } from 'tslib';
// import { async } from '@angular/core/testing';

@Component({
  selector: 'app-edit-lc',
  templateUrl: './edit-lc.component.html',
  styleUrls: ['./edit-lc.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    ToasterService,
    PermissionService,
    LoginService,
    DatePipe,
    SpiplBankService,
    MainSubOrgService,
    ProformaInvoiceService,
    PaymentTermService,
    CreateLcService,
    OrgBankService
  ]
})
export class EditLcComponent implements OnInit {


  public popoverTitle: string = 'Warning';
  public popoverMessage: string = 'Are you sure, you want to delete?';
  public confirmClicked: boolean = false;
  public cancelClicked: boolean = false;
  public confirmText: string = 'Yes';
  public cancelText: string = 'No';
  public placement: string = 'left';
  public closeOnOutsideClick: boolean = true;
  serverUrl: string;
  public today = new Date();

  pi_flag = [];
  spipl_bank = [];
  status = [];
  sub_org = [];
  lc_data = [];
  checkedList = [];
  pi_id_list = [];
  paymentTerm = [];
  qtyRate = [];
  quantity = [];
  org_bank = [];
  one_pi = [];
  item = [];

  // lc form details
  buyerBankName: string;
  buyerBankAddress: string;
  buyerOrgAddress: string;
  buyerOrgName: string;
  suppierOrgName: string;
  suppierOrgAddress: string;
  currency: string;
  destinationPort: string;
  firstAdvBank: string;
  firstAdvBankAddress: string;
  material_load_port: string;
  adv_bank_swift_code: string;
  buyerBankSwiftCode: string;
  gradeName: string;
  piInsuranceType: string;
  payment_term: string;
  totamount = 0;
  totquantity = 0;
  expiry = 0;
  latest_date = '';
  exp_date = '';
  appDate:any;

  lcpaymentTerm:string;


  // addform
  addForm: FormGroup;
  supplier_id: Number;
  spipl_bank_id: Number;
  available_with_bank_name: string;
  tolarance = [];
  transship = [];
  confirm = [];





  public toasterconfig: ToasterConfig =
  new ToasterConfig({
    tapToDismiss: true,
    timeout: 5000
  });
  id: number;
  buyeriec: any;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toasterService: ToasterService,
    private permissionService: PermissionService,
    private loginService: LoginService,
    public datepipe: DatePipe,
    private SpiplService: SpiplBankService,
    private subOrgService: MainSubOrgService,
    private piService: ProformaInvoiceService,
    private paymentTermService: PaymentTermService,
    private createLcService: CreateLcService,
    private BankService: OrgBankService,
  ) {


    // 1 - For Our Spipl Bank
    this.SpiplService.getBankListType(1).subscribe((response) => {
      this.spipl_bank = response;
    });

    this.subOrgService.getSubOrg().subscribe((response) => {
      this.sub_org = response;

    });

    this.paymentTermService.getPaymentTerm().subscribe((response) => {
      this.paymentTerm = response;
    });

    this.status = [{'name': 'All', 'id': 3}, {'name': 'Available', 'id': 1}, {'name': 'Not Available', 'id': 2}];
    this.pi_flag = [{'name': 'LC PI', 'id': 1}, {'name': 'NON-LC PI', 'id': 2}, {'name': 'Indent PI', 'id': 3}];
    this.tolarance = [{'id': 0, 'name': 'Nill'}, {'id': 1, 'name': '+/-1%'}, {'id': 2, 'name': '+/-5%'},{'id': 3, 'name': '+/- 10%'}];
    this.transship = [{'id': 1, 'name': 'ALLOWED'}, {'id': 2, 'name': 'NOT ALLOWED'}];
    this.confirm = [{'id': 1, 'name': 'WITH'}, {'id': 2, 'name': 'WITHOUT'}];

    this.addForm = new FormGroup ({

      'payment_term_id': new FormControl(null, Validators.required),
      'lc_date': new FormControl(null, Validators.required),
      'date_of_shipment': new FormControl(null, Validators.required),
      'lc_expiry_date': new FormControl(null, Validators.required),
      'transhipment': new FormControl(null, Validators.required),
      'partial_shipment': new FormControl(null, Validators.required),
      'confirmation': new FormControl(null, Validators.required),
      'available_with_by': new FormControl(null, Validators.required),
      'annexe_6_date': new FormControl(null, Validators.required),
      'annexe_7_date': new FormControl(null, Validators.required),
      'bl_description': new FormControl(null),
      'tolerance': new FormControl(null, Validators.required),
      'place': new FormControl(null),
      'suppiler_id': new FormControl(null, Validators.required),
      'spipl_bank_id': new FormControl(null, Validators.required),
      'expiry_count': new FormControl(null),
      

    });

    this.route.params.subscribe((params: Params) => {
      this.id = +params['id'];
    });



    this.getDetailLc();
    console.log(this.item);
  }

  ngOnInit() {
  }

   getDetailLc() {
    this.createLcService.getOneLcInDetail(this.id).subscribe( async (result) => 
    {
      const lc_date =  result[0]['lc_date'];
      this.appDate =lc_date.substr(8,2)+'-'+lc_date.substr(5,2)+'-'+lc_date.substr(0,4);
      console.log(this.appDate ,"this.appDate")
      const lc_expiry_date =  result[0]['lc_expiry_date'];
      const payment_term_id =  result[0]['payment_term_id'];
      const spipl_bank_id =  result[0]['spipl_bank_id'];
      const suppiler_id =  result[0]['supplier_id'];
      const tolerance =  result[0]['tolerance'];
      const transhipment =  result[0]['transhipment'];
      const date_of_shipment =  result[0]['date_of_shipment'];
      const bl_description =  result[0]['bl_description'];
      const annexe_6_date =  result[0]['annexe_6_date'];
      const annexe_7_date =  result[0]['annexe_7_date'];
      const confirmation =  result[0]['confirmation'];
      const partial_shipment =  result[0]['partial_shipment'];
      const available_with_by =  result[0]['available_with_by'];
     

      

     const array = result[0]['Pi_details'];



      for (let i = 0 ; i < array.length ; i++) {
        const amount =  array[i].pi_quantity *  array[i].pi_rate;
        this.pi_id_list.push(array[i].id);
        this.qtyRate.push(amount);
        this.quantity.push( array[i].pi_quantity);
        this.item.push( array[i]);

      }


      for (let i = 0 ; i < this.qtyRate.length ; i++) {
        this.totamount = this.totamount + this.qtyRate[i];
     }

     for (let i = 0 ; i < this.quantity.length ; i++) {
      this.totquantity = this.totquantity + this.quantity[i];
   }

       this.buyerBankName = array[0]['buyerBankName'];
       this.buyerBankAddress = array[0]['buyerBankAddress'];
       this.buyerOrgName = array[0]['buyerOrgName'];
       this.buyerOrgAddress = array[0]['buyerOrgAddress'];
       this.suppierOrgName = array[0]['suppierOrgName'];
       this.suppierOrgAddress = array[0]['suppierOrgAddress'];
       this.currency = array[0]['currency'];
       this.destinationPort = array[0]['destinationPort'];
       this.firstAdvBank = array[0]['firstAdvBank'];
       this.firstAdvBankAddress = array[0]['firstAdvBankAddress'];
       this.material_load_port = array[0]['material_load_port'];
       this.adv_bank_swift_code =  array[0]['adv_bank_swift_code'];
       this.buyerBankSwiftCode = array[0]['buyerBankSwiftCode'];
       this.gradeName = array[0]['gradeName'];
       this.piInsuranceType = array[0]['piInsuranceType'];
       this.supplier_id = array[0]['supplier_id'];
       this.spipl_bank_id = array[0]['buyer_bank_id'];
       this.payment_term = array[0]['paymentTerm'];
       this.buyeriec = array[0]['iec'];
       

       const bankname  = await this.getBank(this.supplier_id, available_with_by);



     const date1: any = new Date(date_of_shipment);
     const date2: any = new Date(lc_expiry_date);
    this.expiry = Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));



     this.addForm.controls['lc_date'].setValue(lc_date);
     this.addForm.controls['lc_expiry_date'].setValue(lc_expiry_date);
     this.addForm.controls['payment_term_id'].setValue(payment_term_id);
     this.addForm.controls['spipl_bank_id'].setValue(spipl_bank_id);
     this.addForm.controls['suppiler_id'].setValue(suppiler_id);
     this.addForm.controls['tolerance'].setValue(tolerance);
     this.addForm.controls['transhipment'].setValue(transhipment);
     this.addForm.controls['date_of_shipment'].setValue(date_of_shipment);
     this.addForm.controls['bl_description'].setValue(bl_description);
     this.addForm.controls['annexe_6_date'].setValue(annexe_6_date);
     this.addForm.controls['annexe_7_date'].setValue(annexe_7_date);
     this.addForm.controls['available_with_by'].setValue(available_with_by);
     this.addForm.controls['partial_shipment'].setValue(partial_shipment);
     this.addForm.controls['confirmation'].setValue(confirmation);
   




    });


  }

  getBank(supp_id , available_with_by) {

    // console.log()

    this.BankService.getOrgBank(supp_id)
    .subscribe( (bank) => {
     this.org_bank =  bank;
     this.org_bank.push({'bank_id': 0, 'bank_name': 'Any Bank'});
     this.setSelectedOnEdit(available_with_by, this.org_bank, 'bank_name', 'available_with_bank_name', 'bank_id');
    });


  }


  onSubmitLc() {


console.log(this.addForm,'this.addForm');


    if (!this.addForm.invalid) {
  
      // const formData: any = new FormData();
      // formData.append('payment_term_id', this.addForm.value.payment_term_id);
      // formData.append('lc_date', this.convert(this.addForm.value.lc_date));
      // formData.append('date_of_shipment', this.convert(this.addForm.value.date_of_shipment));
      // formData.append('lc_expiry_date', this.convert(this.addForm.value.lc_expiry_date));
      // formData.append('transhipment', this.addForm.value.transhipment);
      // formData.append('partial_shipment', this.addForm.value.partial_shipment);
      // formData.append('confirmation', this.addForm.value.confirmation);
      // formData.append('annexe_6_date', this.convert(this.addForm.value.annexe_6_date));
      // formData.append('annexe_7_date', this.convert(this.addForm.value.annexe_7_date));
      // formData.append('bl_description', this.addForm.value.bl_description);
      // formData.append('tolerance', this.addForm.value.tolerance);
      // formData.append('suppiler_id', this.addForm.value.suppiler_id);
      // formData.append('spipl_bank_id', this.addForm.value.spipl_bank_id);
      // formData.append('available_with_by', this.addForm.value.available_with_by);
      // formData.append('lc_id', this.id);


      let formData = {
       payment_term_id: this.addForm.value.payment_term_id,
       lc_date: this.convert(this.addForm.value.lc_date),
       date_of_shipment: this.convert(this.addForm.value.date_of_shipment),
       lc_expiry_date: this.convert(this.addForm.value.lc_expiry_date),
       transhipment: this.addForm.value.transhipment,
       partial_shipment: this.addForm.value.partial_shipment,
       confirmation: this.addForm.value.confirmation,
       annexe_6_date: this.convert(this.addForm.value.annexe_6_date),
       annexe_7_date: this.convert(this.addForm.value.annexe_7_date),
       bl_description: this.addForm.value.bl_description,
       tolerance: this.addForm.value.tolerance,
       suppiler_id: this.addForm.value.suppiler_id,
       spipl_bank_id: this.addForm.value.spipl_bank_id,
       available_with_by: this.addForm.value.available_with_by,
       app_date:this.addForm.value.app_date,
       lc_id: this.id
      }





      this.createLcService.updateLc(formData).subscribe((response) => {
        this.toasterService.pop(response.message, response.message, response.data);
        if (response.code === '100') {
          setTimeout(() => {
            this.router.navigate(['forex/lc-in-operation']);
       }, 3000);
       }
       });


    }
    else{
      console.log('Error');
      
    }

  }



  convert(date) {
  	if(date != null) {
			return this.datepipe.transform(date ,'yyyy-MM-dd');
		} else {
			return null;
		}
  }

  lastDateCalculate(val, date) {
    if (date) {
    this.latest_date = this.convert(date);
    const someDate = new Date(this.latest_date);
someDate.setDate(someDate.getDate() + val); // number  of days to add, e.x. 15 days
const dateFormated = someDate.toISOString().substr(0, 10);
this.addForm.controls['lc_expiry_date'].setValue(dateFormated);
// console.log(dateFormated);
    }
  }



  public setSelectedStatus($e) {
    this.available_with_bank_name = $e['bank_name'];
   }

   public setSelectedOnEdit(value, dataarr, name, htmlname, id) {
    if (dataarr && value) {
       const status = [] = dataarr.find(s => s[id] === value);
       if (status) {
        this[htmlname]  = status[name];
       }
     }
   }

   onBackToLc() {
     this.router.navigate(['forex/lc-in-operation']);
   }


  getMonth(month: Number) {
    switch (month) {
      case 1: {
         return 'jan';
         break;
      }
      case 2: {
        return 'Feb';
        break;
      }
      case 3: {
        return 'March';
        break;
      }
      case 4: {
        return 'April';
        break;
      }
      case 5: {
        return 'May';
        break;
      }
      case 6: {
        return 'June';
        break;
      }
      case 7: {
        return 'July';
        break;
      }
      case 8: {
        return 'Aug';
        break;
      }
      case 9: {
        return 'Sept';
        break;
      }
      case 10: {
        return 'Oct';
        break;
      }
      case 11: {
        return 'Nov';
        break;
      }
      case 12: {
        return 'Dec';
        break;
      }

   }
   }


   
	onchange_payterm(e)
	{
		console.log(e.pay_term,"incoterm");
		this.lcpaymentTerm =e.pay_term;
	}


}
