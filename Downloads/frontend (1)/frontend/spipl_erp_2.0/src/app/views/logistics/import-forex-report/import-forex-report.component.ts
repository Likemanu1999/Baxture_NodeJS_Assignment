import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { EmailTemplateMaster, Ilc_Loc, NonNegotiable, nonNegotiable, percentage_master, SpiplBankMaster } from '../../../shared/apis-path/apis-path';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { ExportService } from '../../../shared/export-service/export-service';
import { Table } from 'primeng/table';
import { staticValues } from '../../../shared/common-service/common-service';

import htmlDocx from 'html-docx-js/dist/html-docx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-import-forex-report',
  templateUrl: './import-forex-report.component.html',
  styleUrls: ['./import-forex-report.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    ExportService,
    CrudServices,
    DatePipe
  ]
})
export class ImportForexReportComponent implements OnInit {
  cols: { field: string; header: string; style: string; class?: string }[];
  @ViewChild('dt', { static: false }) table: Table;
  @ViewChildren("inputs") public inputs: ElementRef<HTMLInputElement>[];
  data = [];
  isLoading: boolean;
  premiumArr = [];
  supplier_list: any = [];
  lookupOrg: any = {};
  lookupport: any = {};
  port: any = [];
  bsRangeValue: any = [];
  bsRangeValue2: any = [];
  datePickerConfig = staticValues.datePickerConfig;
  currentYear: number;
  date = new Date();
  fromPurchaseDate: string;
  toPurchaseDate: string;
  lookupbank: any = {};
  bankList: any = [];
  tot_be_qty: any;
  tot_accessable: any;
  tot_bcd_lic: any;
  tot_bcd_cash: any;
  tot_sws: any;
  tot_anti_dumping: any;
  tot_taxable: any;
  tot_igst: any;
  amountINR: any;
  tot_non_qty: any;
  totalAmountUsd: any;
  paymentAmountNon_Lc: any;
  paymentAmountLc: any;
  TotalPayment: any;
  difference: any;
  total_clearing_charges: any;
  ckeConfig: { editable: boolean; spellcheck: boolean; height: string; };
  myContent: string;
  checkedList = [];
  filteredValuess = [];
  getLabel: boolean;


  

  constructor(private exportService: ExportService,
    private crudServices: CrudServices,
    private datepipe: DatePipe) {

    this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
    if (this.datepipe.transform(this.date, 'MM') > '03') {
      this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
    } else {
      this.bsRangeValue = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];
    }


    this.cols = [
      { field: 'file_no', header: 'File No', style: '100px', class: 'first' },
      { field: 'purchase_date', header: 'Purchase Date', style: '100px', class: 'second' },
      { field: 'sub_org_name', header: 'Party Name', style: '100px', class: 'third' },
      { field: 'product_name', header: 'Product ', style: '150px' },
      { field: 'grade_name', header: 'Grade', style: '150px' },
      { field: 'country', header: 'Country', style: '150px' },
      { field: 'port', header: 'Port', style: '150px' },
      { field: 'invoice_no', header: 'Invoice No', style: '150px' },
      { field: 'invoice_date', header: 'Invoice Date', style: '150px' },
      { field: 'tot_non_qty', header: 'Quantity(MT)', style: '150px' },
      { field: 'rate', header: 'Rate(USD)(p/mt)', style: '150px' },
      { field: 'totalAmountUsd', header: 'Amount(USD)', style: '150px' },
      { field: 'rbi_rate', header: 'RBI Rate', style: '150px' },
      { field: 'premium', header: 'Premium', style: '150px' },
      { field: 'rbiRate_premium', header: 'RBI Rate + Premium', style: '150px' },
      { field: 'amountINR', header: 'Purchase Value (Rs)', style: '150px' },
      { field: 'pi_details', header: 'PI Details', style: '600px' },
      { field: 'be_details', header: 'Duty Details', style: '2500px' },
      { field: 'total_clearing_charges', header: 'Total Clearing Charges', style: '150px' },
      { field: 'payment_due_date', header: 'Payment Due Date', style: '100px' },
      { field: 'bank_name', header: 'Bank Name', style: '100px' },
      { field: 'paymentAmountLc', header: 'Payment Amount LC(INR)', style: '150px' },
      { field: 'paymentAmountNon_Lc', header: 'Payment Non-LC(INR)', style: '150px' },
      { field: 'TotalPayment', header: 'Payment Total(INR)', style: '150px' },
      { field: 'difference', header: 'Forex Gain/(Loss)', style: '150px' },
    


    ];

    this.getPremium();

    this.ckeConfig = {
      'editable': true, 'spellcheck': true, 'height': '700px', // you can also set height 'minHeight': '100px',
    };
  }

  ngOnInit() {

    this.getDetails();

  }


  clearDate() {
    this.bsRangeValue = [];
    this.getDetails()
  }

 



  getDetails() {
    this.data = [];
    this.difference = 0;
    this.fromPurchaseDate = this.datepipe.transform(this.bsRangeValue[0], 'yyyy-MM-dd');
    this.toPurchaseDate = this.datepipe.transform(this.bsRangeValue[1], 'yyyy-MM-dd');
    
    this.isLoading = true
    this.crudServices.getOne<any>(NonNegotiable.getImportForexReport, { fromPurchaseDate: this.fromPurchaseDate, toPurchaseDate: this.toPurchaseDate }).subscribe(response => {
      this.isLoading = false;
      console.log(response);
      for (let val of response) {
        let rate = 0;
        let tot_non_qty = 0;
        let premium = [];
        val['sub_org_name'] = val.sub_org_master.sub_org_name;
        val['country'] = val.sub_org_master.country_master != null ? val.sub_org_master.country_master.name : '';
        val['grade_name'] = val.grade_master.grade_name;
        val['product_name'] = val.grade_master.main_grade.product_master.name;
        val['port'] = val.port_master.port_name;
        val['non_copy'] = val.non_copy != null ? JSON.parse(val.non_copy) : [];
        val['non_revised_copy'] = val.non_revised_copy != null ? JSON.parse(val.non_revised_copy) : [];

        let arr = this.premiumArr;





        arr = arr.filter(item => (new Date(item.from_date) <= new Date(val.purchase_date)) && (new Date(item.to_date) >= new Date(val.purchase_date)))

        if (arr.length > 1) {

          arr = arr.sort((a, b) => new Date(b.from_date).getTime() - new Date(a.from_date).getTime())

        }




        val['rbiRate_premium'] = Number(val.rbi_rate)
        if (arr.length) {
          val['premium'] = arr[0].percent_value;
          val['rbiRate_premium'] = Number(val.rbi_rate + arr[0].percent_value);
        }


        if (val.rel_non_pis != null && val.rel_non_pis) {
          tot_non_qty = val.rel_non_pis.reduce((sum, item) => sum + Number(item.pi_qty), 0);
          let pi_rate = val.rel_non_pis.reduce((sum, item) => sum + Number(item.flc_proforma_invoice.pi_rate), 0);
          rate = pi_rate / val.rel_non_pis.length;
          

          // val.eta = val.rel_non_pis[0].flc_proforma_invoice.tentitive_arrival_date;
          // val.UnitName = val.rel_non_pis[0].flc_proforma_invoice.unit_mt_drum_master.unitName;
          // val.CurrencyName = val.rel_non_pis[0].flc_proforma_invoice.currency_master.currName;

          val.tot_non_qty = tot_non_qty;

          val.rate = rate;
          val.totalAmountUsd = tot_non_qty * rate;
          // check for the status of the PI - LC or NON-LC
          let pi_type_arr = val.rel_non_pis.find(item => item.lc_id != null)

          if (pi_type_arr != undefined) {
            val.pi_type = 1  //LC
          } else {
            val.pi_type = 2  //NON - LC
          }





        }
        val['amountINR'] = Number(val.totalAmountUsd) * Number(val['rbiRate_premium']);
        val['bank_name']= val.spipl_bank ? val.spipl_bank.bank_name: "";
        let piArr = []
        if (val.rel_non_pis) {
          for (let pi of val.rel_non_pis) {
          
            piArr.push(pi.flc_proforma_invoice);
          }
        }

        val['piArr'] = piArr;
        let paymentAdvance = 0;
        let lc_number = '';
        let pi_number = '';
        for(let pi of piArr) {

          lc_number += pi.letter_of_credit?  pi.letter_of_credit.bank_lc_no : '' + ' ';
          pi_number += pi.proform_invoice_no + ' ';
         
          if(pi.paymentArr.length) {
            for(let pay of pi.paymentArr ) {
              paymentAdvance+= Number(pay.paymentAmt)

            }
          }
        }

        val['paymentAdvance'] = paymentAdvance;
        val['lc_number'] = lc_number;
        val['pi_number'] = pi_number;

      
      

        let paymentAmount = 0;
        // condition for LC TYPE PAYMENT--------------------------------------------------------------------------
        if (val.pi_type == 1) {
          if (val.rel_non_hedges.length) {
            let paymentStatusComplete = val.rel_non_hedges.filter(item => item.payment_status == 1);

            let totalAmount = paymentStatusComplete.reduce((sum, item) => sum + Number(item.hedge_amount), 0)



            if (totalAmount >= val.totalAmountUsd) {
              let diff = totalAmount - val.totalAmountUsd;
              // console.log(diff , 'DIFFEREFCE' , val.id , 'ID' , val.totalAmountUsd , 'AMOUNT',totalAmount , 'TOTALAMOUNT');
              let arrPrincipleAmount = paymentStatusComplete.filter(item => Math.round(item.hedge_amount) != Math.round(diff));
             
              if (arrPrincipleAmount != undefined) {
                for (let amount of arrPrincipleAmount) {
                  paymentAmount += amount.hedge_amount * amount.forward_book.final_rate
                }
              }



            }



          }
          val['paymentAmount'] = paymentAmount
        }

        val['paymentAmountLc'] = paymentAmount
        //----------------------------------------------------------------------------------------------------------

           // condition for NON-LC Credit TYPE PAYMENT--------------------------------------------------------------------------
           let paymentAmountNonLCCredit = 0
           if (val.pi_type == 2) {
           
             
            if (val.rel_non_hedges.length) {
         
              let paymentStatusComplete = val.rel_non_hedges.filter(item => item.payment_status == 1 );

             

              if (paymentStatusComplete != undefined) {
                for (let amount of paymentStatusComplete) {
                  paymentAmountNonLCCredit += amount.hedge_amount * amount.forward_book.final_rate
                  console.log(paymentAmountNonLCCredit);
                  
                }
              }

  
            }
           
          }

          val['paymentAmountNon_Lc'] = Number(paymentAmountNonLCCredit) +   Number(paymentAdvance) ;

          // console.log(paymentAmountNonLCCredit);

          val['TotalPayment'] = Number(paymentAmountNonLCCredit) +  Number(paymentAdvance) + Number(paymentAmount)

       

          if( val['TotalPayment']  > 0) {
            val['differnce'] = val.amountINR - val.TotalPayment  
          }

          if( val['differnce'] > 0) {
            this.difference += val['differnce'] 
          } else if(val['differnce'] < 0) {
            this.difference = this.difference - val['differnce']
          }
         
          
          
          //----------------------------------------------------------------------------------------------------------
  



        let blBeArr = [];
        let tot_be_qty = 0;
        let tot_accessable = 0;
        let tot_bcd_lic=0;
        let tot_bcd_cash=0;
        let tot_sws=0;
        let tot_anti_dumping = 0;
        let tot_taxable = 0;
        let tot_igst = 0;
        let bl_number  =  '';
        let be_number  =  '';
        if (val.non_be_bls) {
          for (let bl of val.non_be_bls) {
            let exchage_amt = 0;
            exchage_amt = bl.bill_of_entry.exchange_rate;
            
            if(bl.bill_of_entry.deleted == 0) {
              let  taxable_value = Number(bl.bill_of_entry.accessable_val) + Number(bl.bill_of_entry.bcd_cash_val) + Number(bl.bill_of_entry.sws_val)+ Number(bl.bill_of_entry.anti_dumping_val) + Number(bl.bill_of_entry.bcd_license_val);

               tot_be_qty += Number( bl.covered_bl_qty);
               tot_accessable += Number( bl.bill_of_entry.accessable_val);
               tot_bcd_lic+=Number( bl.bill_of_entry.bcd_license_val);
               tot_bcd_cash+=Number( bl.bill_of_entry.bcd_cash_val);
               tot_sws+=Number( bl.bill_of_entry.sws_val);
               tot_anti_dumping += Number( bl.bill_of_entry.anti_dumping_val);
               tot_taxable += taxable_value;
               tot_igst += Number( bl.bill_of_entry.igst_amt);


               bl_number += bl.bill_of_lading.bill_lading_no + ' ';
               be_number += bl.bill_of_entry.be_no + ' ';
              blBeArr.push({ bl_no: bl.bill_of_lading.bill_lading_no, bl_date: bl.bill_of_lading.bl_date, be_no: bl.bill_of_entry.be_no, be_date: bl.bill_of_entry.be_dt, accessable_val: bl.bill_of_entry.accessable_val, qty: bl.covered_bl_qty, rate: val.rate, amountUsd: Number(val.rate) * Number(bl.covered_bl_qty), exchange_amount: exchage_amt, freight_inc_highseas: (bl.bill_of_entry.insurance + bl.bill_of_entry.freight + bl.bill_of_entry.high_seas_commision), bcd_cash_val: bl.bill_of_entry.bcd_cash_val, bcd_lic_val: bl.bill_of_entry.bcd_license_val, bcd_percent: bl.bill_of_entry.bcd_percent, sws_val: bl.bill_of_entry.sws_val, anti_dumping_rate: bl.bill_of_entry.anti_dumping_rate, anti_dumping_val: bl.bill_of_entry.anti_dumping_val, igst_amt: bl.bill_of_entry.igst_amt, custom_duty_amt: bl.bill_of_entry.custom_duty_amt , be_copy : bl.bill_of_entry.be_copy , tr6_copy : bl.bill_of_entry.tr6_copy , taxable_value : taxable_value});
            }

             val['bl_number'] = bl_number;
             val['be_number'] = be_number;
           
          }
        }

        val['tot_be_qty'] = tot_be_qty;
        val['tot_accessable'] = tot_accessable;
        val['tot_bcd_lic']=tot_bcd_lic;
        val['tot_bcd_cash']=tot_bcd_cash;
        val['tot_sws']=tot_sws;
        val['tot_anti_dumping'] = tot_anti_dumping;
        val['tot_taxable'] = tot_taxable;
        val['tot_igst'] = tot_igst;

        val['blBeArr'] = blBeArr;


        let total_cha_cfs_shipping_terminal = 0;
        let storage = 0;
        let storageQty = 0;

        if (val.logistics_charges.length > 0) {


          let cfscharge = val.logistics_charges.reduce((sum, item) => sum + (Number(item.cfs_charges) + Number(item.cfs_grount_rent) + Number(item.scanning_charges) + Number(item.examination_charges) + Number(item.cfs_sgst) + Number(item.cfs_cgst)), 0);
          let terminal = val.logistics_charges.reduce((sum, item) => sum + (Number(item.first_shifting_terminal) + Number(item.second_shifting_terminal) + Number(item.terminal_grount_rent) + Number(item.toll_charges) + Number(item.terminal_cgst) + Number(item.terminal_sgst) + Number(item.terminal_igst)), 0);

          let shipping = val.logistics_charges.reduce((sum, item) => sum + (Number(item.shipping_charges) + Number(item.shipping_grount_rent) + Number(item.shipping_other_charges) + Number(item.shipping_igst) + Number(item.shipping_sgst) + Number(item.shipping_cgst)), 0);

          let fob = val.logistics_charges.reduce((sum, item) => sum + (Number(item.fob_charges) + Number(item.fob_cgst) + Number(item.fob_sgst)), 0);
          let citpl = val.logistics_charges.reduce((sum, item) => sum + (Number(item.citpl_charges) + Number(item.citpl_cgst) + Number(item.citpl_sgst)), 0);

          storage = val.logistics_charges.reduce((sum, item) => sum + (Number(item.storage_charges) + Number(item.storage_sgst) + Number(item.storage_cgst)), 0);

          storageQty = val.logistics_charges.reduce((sum, item) => sum + (Number(item.storage_qty)), 0);

          total_cha_cfs_shipping_terminal = cfscharge + terminal + shipping + fob + citpl;
        }
        let transportercharges = 0;
        let bondCharges = 0;
        let chacharge = 0;
        let load_cross = 0;
        if (val.logistics_bond_charges.length > 0) {
          bondCharges = val.logistics_bond_charges.reduce((sum, item) => sum + (Number(item.charge_rate) + Number(item.sgst) + Number(item.cgst)), 0);


        }

        if (val.transporter_charges.length > 0) {
          transportercharges = val.transporter_charges.reduce((sum, item) => sum + (Number(item.rate) + Number(item.sgst) + Number(item.cgst) + Number(item.empty_lift_off) + Number(item.detention)), 0);


        }

        if (val.cha_charges.length > 0) {
          chacharge = val.cha_charges.reduce((sum, item) => sum + (Number(item.cha_charges) + Number(item.cha_other_charges) + Number(item.edi) + Number(item.general_stamp) + Number(item.cha_sgst) + Number(item.cha_cgst)), 0);


        }

        if (val.container_details.length > 0) {

          for (let charge of val.container_details) {
            load_cross += Number(charge.charges)
          }

          //	load_cross =val.container_details.reduce((sum, item) => sum + (Number(item.charges) , 0))


        }




        total_cha_cfs_shipping_terminal += transportercharges + bondCharges + chacharge + load_cross;

        val['total_clearing_charges'] = total_cha_cfs_shipping_terminal

        if (!(val['sub_org_name'] in this.lookupOrg)) {
          this.lookupOrg[val['sub_org_name']] = 1;
          this.supplier_list.push({ 'sub_org_name': val['sub_org_name'] });
        }

        if (!(val['port'] in this.lookupport)) {
          this.lookupport[val['port']] = 1;
          this.port.push({ 'port': val['port'] });
        }

        if (!(val['bank_name'] in this.lookupbank)) {
          this.lookupbank[val['bank_name']] = 1;
          this.bankList.push({ 'bank_name': val['bank_name'] });
        }






        this.data.push(val)
      }

      if(this.data.length) {
        this.filteredValuess = this.data;
        this.calculateTotal(this.data)
      }

    })
  }

  calculateTotal(data) {

    this.tot_be_qty =  data.reduce((sum,item) => sum + item.tot_be_qty , 0);
    this.tot_accessable = data.reduce((sum,item) => sum + item.tot_accessable , 0);
    this.tot_bcd_lic = data.reduce((sum,item) => sum + item.tot_bcd_lic , 0);
    this.tot_bcd_cash =  data.reduce((sum,item) => sum + item.tot_bcd_cash , 0);
    this.tot_sws =  data.reduce((sum,item) => sum + item.tot_sws , 0);
    this.tot_anti_dumping =  data.reduce((sum,item) => sum + item.tot_anti_dumping , 0);
    this.tot_taxable =  data.reduce((sum,item) => sum + item.tot_taxable , 0);
    this.tot_igst = data.reduce((sum,item) => sum + item.tot_igst , 0);
    this.amountINR =  data.reduce((sum,item) => sum + item.amountINR , 0);
    this.tot_non_qty =  data.reduce((sum,item) => sum + item.tot_non_qty , 0);
    this.totalAmountUsd =  data.reduce((sum,item) => sum + item.totalAmountUsd , 0);
    this.paymentAmountNon_Lc =  data.reduce((sum,item) => sum + item.paymentAmountNon_Lc , 0);
    this.paymentAmountLc =  data.reduce((sum,item) => sum + item.paymentAmountLc , 0);
    this.TotalPayment =  data.reduce((sum,item) => sum + item.TotalPayment , 0);
   // this.difference =  data.reduce((sum,item) => sum + item.difference , 0);
    this.total_clearing_charges =  data.reduce((sum,item) => sum + item.total_clearing_charges , 0);
   
 
  }

  getPremium() {
    this.crudServices.getOne<any>(percentage_master.getByType, { type: "Logistics Premium" }).subscribe(response => {
      this.premiumArr = response;

      console.log(response);


    })
  }

  onCheck(checked, item) {
		if (checked) {
			this.checkedList.push(item);
		} else {
			this.checkedList.splice(this.checkedList.indexOf(item), 1);
		}

  
	}


  onCheckAll(checked) {
    let arr = [];
    this.checkedList = [];
    arr = this.filteredValuess;
    console.log(arr , 'DATA');
    

    if (checked) {
      this.inputs.forEach(check => {
        check.nativeElement.checked = true;
      });
      for (const val of arr) {
        // this.item.push(val);
        this.onCheck(true, val);
      }

    } else {
      this.inputs.forEach(check => {
        check.nativeElement.checked = false;
      });
      for (const val of arr) {
        // this.item.splice(this.item.indexOf(val), 1);
        this.onCheck(false, val);
      }
    }



  }





  // multiselect filter
  onchange(event, name) {


    const arr = [];
    if (event.value.length > 0) {
      for (let i = 0; i < event.value.length; i++) {
        arr.push(event.value[i][name]);
      }
      // console.log(arr);
      this.table.filter(arr, name, 'in');

    } else {
      this.table.filter('', name, 'in');
    }
  }

  getDocsArr(val) {
    return JSON.parse(val);
  }

  onFilter(event, dt) {
    this.difference = 0;
   
    this.filteredValuess = event.filteredValue;
    for(let val of this.filteredValuess) {
      
      if( val['differnce'] > 0) {
        this.difference += val['differnce'] 
      } else if(val['differnce'] < 0) {
        this.difference = this.difference - val['differnce']
      }
    }
    this.calculateTotal(this.filteredValuess);
    
  }

  backFromEditor() {
    this.getLabel = false;
    this.checkedList = [];
    this.myContent = '';
  }


  download() {

    let FY = `${this.datepipe.transform(this.bsRangeValue[0], 'yyyy')} - ${this.datepipe.transform(this.bsRangeValue[1], 'yyyy')}`;

    if(this.checkedList.length) {
      this.getLabel = true;
      let newstr = `
      <html>
  <head>
    <style type="text/css">#rcorners2 {
    
      border: 2px solid black;
       padding-top:15px;
      width: 100px;
      height: 40px; 
      position: relative;
     
  }
  
  #box1 {
    
      border: 2px solid black;
     
      height: 720px; 
      width : 168px;
      position: relative;
     
  }
  
  .grid {
    
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-gap: 2px;
    counter-reset: div;
  }
  
  .grid div {
   
    text-align: center;
  }
  
  .grid div:before {
    counter-increment: div;
    content: '';
  }
  
  .grid div[class]:after {
    display: block;
    text-align: center;
    background: lightblue;
    content: "";
   
  }
  
  
  /* spanning cols, complete values missing */
  
  .col-2 {
    grid-column: auto/span 2;
  }
  
  .col-3 {
    grid-column: auto/span 3;
  }
  .col-4 {
    grid-column: auto/span 4;
  }
  
  .col-6 {
    grid-column: auto/span 6;
  }
  
  .col-8 {
    grid-column: auto/span 8;
  }
  
  
  /* spanning rows , complete values missing*/
  
  .row-2 {
    grid-row: auto/span 2;
  }
    </style>
    <title></title>
  </head>
  <body>
  <div class="grid"> `;
  
  for(let val of this.checkedList){
    let lc_no = '';
    let lc_open_date = '';
    for(let LC of val.piArr) {
      lc_no += LC.letter_of_credit!= null? LC.letter_of_credit.bank_lc_no+ ' '  : '';
      lc_open_date += LC.letter_of_credit!= null? this.datepipe.transform(LC.letter_of_credit.lc_opening_da , 'dd/MM/yyyy')+ ' '  : '';
    }
  
    newstr +=`<div class="col-4" style="margin-bottom:255px;">
  <div id="box1">
  <div id="rcorners2" style="float:right">&nbsp; &nbsp;<strong>${val.file_no}</strong></div>
  
  <p>&nbsp;</p>
  
  <p>&nbsp;</p>
  
  <p style="text-align:center"><span style="font-size:medium"><strong><u><strong>F.Y. ${FY}</strong></u><br />
  <br />
  SUSHILA PARMAR INTERNATIONAL PVT.LTD.<br />
  <br />
  Self Import Purchase From:<br />
  ${val.sub_org_name}<br />
  <br />
  ${val.grade_name}<br />
  <br />
  ${val.tot_non_qty}MT<br />
  <br />
  Inv.No. ${val.invoice_no}<br />
  <br />
  @ USD  ${val.rate}<br />
  Total USD ${val.totalAmountUsd}<br />
  <br />
  LC No<br />
  ${lc_no}<br />
  <br />
  Bank Name:<br />
  ${val.bank_name}<br />
  <br />
  LC Open dt<br />
  ${lc_open_date} </strong><br />
  <br />
  <strong>(Purchase Inward Dt.)</strong> </span><br />
  <span style="font-size:medium"><strong>${this.datepipe.transform(val.purchase_date , 'dd/MM/yyyy') }</strong></span></p>
  </div>
  </div>` ;
  }
  
  
  
  newstr +=`</div>
  </body>
  </html>
      `;
  
    this.myContent = newstr;
    }

  
  }



}



