
import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, ViewChildren, NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { FileUpload, insuranceClaim, SubOrg } from '../../../shared/apis-path/apis-path';
import { ItemsList } from '@ng-select/ng-select/lib/items-list';
import { element } from 'protractor';
import { Router } from '@angular/router';

@Component({
  selector: 'app-insurance-claim',
  templateUrl: './insurance-claim.component.html',
  styleUrls: ['./insurance-claim.component.scss'],
  encapsulation: ViewEncapsulation.None,
	providers: [
		ToasterService,
		DatePipe,
		CrudServices
	
	]
})
export class InsuranceClaimComponent implements OnInit {
  data = [];
  cols: { field: string; header: string; style: string; }[];
  list = [];
  insuranceCompany: any;
  public toasterconfig: ToasterConfig =
  new ToasterConfig({
    tapToDismiss: true,
    timeout: 5000
  });
  isLoading: boolean;
  constructor(private crudServices : CrudServices , private router: Router,  private toasterService: ToasterService,private datePipe:DatePipe) {
    this.cols = [

			{ field: 'port_master.port_name', header: 'Port', style: '200' },
			{ field: 'non_received_date', header: 'Received Date Non', style: '150' },
			{ field: 'spipl_bank.ad_code', header: 'AD CoDe', style: '200' },
			{ field: 'sub_org_master.sub_org_name', header: 'Name of Supplier', style: '200' },
			{ field: 'tot_non_qty', header: 'Total Non Qty', style: '150' },
			{ field: 'rate', header: 'Rate', style: '150' },
			{ field: 'CurrencyName', header: 'Currency', style: '100' },
			{ field: 'shortDmgQty', header: 'Short/Damage Qty', style: '150' },
			{ field: 'invoice_no', header: 'Invoice No', style: '150' },
			{ field: 'bl_no', header: 'BL Number', style: '150' },
			{ field: 'be_no', header: 'BE Number', style: '150' },
			{ field: 'insurance_doc', header: 'Document', style: '150' },
			{ field: 'total_inc_amount_rcv', header: 'Paid Date', style: '150' },
      { field: 'insurance_payment_date', header: 'Paid Amount', style: '150' },
      { field: 'policy_number', header: 'Policy Number', style: '150' },

		];

    this.crudServices.getOne<any>(SubOrg.getSubOrgByCategory, { category_id: 65 }).subscribe(response => {
      this.insuranceCompany = response.map((i) => { i.sub_org_name = i.sub_org_name + ' (' + i.org_address + ' )'; return i; });
    })
   }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.list = []
      this.isLoading = true;
     this.crudServices.getOne<any>(insuranceClaim.getData , {}).subscribe(response => {
      this.isLoading = false;
      this.data =  response.filter(item => item.container_details.length > 0 || item.exbond_details.length > 0 );

      for(let val of this.data) {
        let totShotDamage = 0;
        let bl_no = '';
        let be_no = '';
        let tot_non_qty = 0;
				let rate = 0;
				let pitype = '';
				let eta = '';

        if(val.container_details.length) {
          totShotDamage =val.container_details.reduce((sum , item)=> sum + Number(item.short_material_qty + item.damage_material_qty) , 0 ) 
          
        }

        if(val.exbond_details.length) {
          totShotDamage =val.exbond_details.reduce((sum , item)=> sum + Number(item.short_qty + item.damage_qty) , 0 ) 
          
        }

        if(val.bill_of_ladings != null) {
         
          bl_no =val.bill_of_ladings.reduce((sum , item)=> sum + item.bill_lading_no+ " " , " " ) 
        }

        if(val.bill_of_entries != null) {
          be_no =val.bill_of_entries.reduce((sum , item)=> sum + item.be_no+ " " , " " )
        
        }
        val.shortDmgQty = totShotDamage;
        val.bl_no = bl_no;
        val.be_no = be_no;

        if (val.rel_non_pis != null) {
					tot_non_qty = val.rel_non_pis.reduce((sum, item) => sum + Number(item.pi_qty), 0);
					let pi_rate = val.rel_non_pis.reduce((sum, item) => sum + Number(item.flc_proforma_invoice.pi_rate), 0);
					rate = pi_rate / val.rel_non_pis.length;
					pitype = val.rel_non_pis[0].flc_proforma_invoice.pi_flag;
					val.eta = val.rel_non_pis[0].flc_proforma_invoice.tentitive_arrival_date;
					val.UnitName = val.rel_non_pis[0].flc_proforma_invoice.unit_mt_drum_master.unitName;
					val.CurrencyName = val.rel_non_pis[0].flc_proforma_invoice.currency_master.currName;

					val.tot_non_qty = tot_non_qty;
					val.pi_type = pitype;
					val.rate = rate;
					val.eta = eta;

				}

        val.insurance_payment_date = val.insurance_payment_date ? new Date( val.insurance_payment_date ) : ''



        this.list.push(val)

      }
      // this.data =  this.data.map(item => {
      //   if(item.container_details.length > 0) {
      //     item.totalQty = item.container_details.reduce((sum,data)=> sum+ data.short_material_qty + data.damage_material_qty , 0)
      //     return item;
      //   } else {
      //     return  item;
      //   }
      
      // })

    

     })
  }

  sendMail(id , type) {
   
		this.router.navigate([]).then(result => { window.open('/#/logistics/insurance-claim-editor/' + id +'/' +type, '_blank'); });
	}
  updateData(val , field , id) {

    
    if(val && field!= null && id ) {
      let data = {};
      data[field] = val;
      data['id'] = id; 
 
      if(field == 'insurance_company_id') {
       data[field] = val.sub_org_id;
      }
 
      if(field == 'insurance_payment_date') {
       data[field] = this.datePipe.transform(val,"yyyy-MM-dd");
      }
 
      if(field == 'insurance_status') {
        data[field] = val ? 1 : 0;
      }
   
       
      this.crudServices.updateData<any>(insuranceClaim.updateDataInsurance, data).subscribe(response => {
       this.toasterService.pop(response.message, response.message, response.data);
      })
    }
    
  }

  addInsuranceDocs(event: any , id) {
   
		let incdoc = <Array<File>>event.target.files;
    let fileData: FormData = new FormData();
    
    if (incdoc.length > 0) {
      for (let i = 0; i < incdoc.length; i++) {
        fileData.append('insurance_doc', incdoc[i], incdoc[i]['name']);
      }
    }


    this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {

      let fileDealDocs1 = [];
      let filesList1 = [];
      

      if (res.uploads.insurance_doc) {
        
     
        filesList1 = res.uploads.insurance_doc;
        for (let i = 0; i < filesList1.length; i++) {
          fileDealDocs1.push(filesList1[i].location);
        }

        if(fileDealDocs1.length) {
          let data = {
            insurance_doc : fileDealDocs1,
            id : id
          }
          this.crudServices.updateData<any>(insuranceClaim.updateDataInsurance, data).subscribe(response => {
            this.getData()
            this.toasterService.pop(response.message, response.message, response.data);
           })
        }
       
      }

     ;
      

    })


	}

}
