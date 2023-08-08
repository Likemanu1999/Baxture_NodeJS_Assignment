import { Component, EventEmitter, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { billOfEntry, billOfLading, logistics_charges} from '../../../shared/apis-path/apis-path';
import { UserDetails } from '../../login/UserDetails.model';
import { ExportService } from '../../../shared/export-service/export-service';
import { Table } from 'primeng/table';
import { staticValues } from '../../../shared/common-service/common-service';

@Component({
  selector: 'app-import-clearance-report',
  templateUrl: './import-clearance-report.component.html',
  styleUrls: ['./import-clearance-report.component.scss'],
  encapsulation: ViewEncapsulation.None,
	providers: [
		PermissionService,
		LoginService,
		DatePipe,
    ExportService,
		CrudServices
	]
})
export class ImportClearanceReportComponent implements OnInit {
  cols: { field: string; header: string; style: string; total : string }[];
  @ViewChild('dt', {static: false}) table: Table;
  @ViewChild('dt2', {static: false}) table2: Table;
  bsRangeValue: Date[];
  bsRangeValue2: Date[];
  currentYear: number;
  date = new Date();
  fromblDate: any;
  toblDate: any;
  be_list = [];
  total_inr: any;
  total_qty: any;
  total_usd: any;
  total_duty: any;
  filteredValuess = [];
  cha_complete_total: any;
  shipping_complete_total: any;
  terminal_complete_total: any;
  cfs_complete_total: any;
  bond_complete_total: any;
  transporter_complete_total: any;
  complete_total_charges: any;
  selectedItem : any[];
  isLoading: boolean;
  load_cross_complete: string;
  lookup = {};
  port_list = [];

  lookup_cha = {};
  cha_list = [];
  datePickerConfig: any = staticValues.datePickerConfigNew;
	maxDate: any = new Date();
  lookup_shipping = {};
  shipping_list = [];

  lookup_terminal = {};
  terminal_list = [];

  lookup_bond = {};
  bond_list = [];

  lookup_cfs = {};
  cfs_list = [];
  typeWiseList = [];
  cols2: { field: string; header: string; style: string; }[];
  filteredValuess2= [];
  totalCharges = 0;
  //global_list = [];
  global_list = {};
  lookup_agency = {};
  agency_list = [];
  lookup_port = {};
  portList = [];
  fromArrivalDate: any;
  toArrivalDate: any;
  isLoadingList: boolean;
  typeList: { type: string; value: string; }[];
  uploadSuccess: EventEmitter<boolean> = new EventEmitter();
	isRange: any;

  constructor(
		private permissionService: PermissionService,
		private loginService: LoginService,
		public datepipe: DatePipe,
		private crudServices: CrudServices,   private exportService: ExportService,) {

      this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
      if (this.datepipe.transform(this.date, 'MM') > '03') {
        this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
      } else {
        this.bsRangeValue = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];
      }

      if (this.datepipe.transform(this.date, 'MM') > '03') {
        this.bsRangeValue2 = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
      } else {
        this.bsRangeValue2 = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];
      }
      


     }

  ngOnInit() {
    this.columInitialize() ;
    this.fromArrivalDate = this.datepipe.transform( this.bsRangeValue2[0], 'yyyy-MM-dd');
    this.toArrivalDate = this.datepipe.transform( this.bsRangeValue2[1], 'yyyy-MM-dd');

    this.getData();
  
  }

  clearDropdown(){		
		if(JSON.stringify(this.isRange) != JSON.stringify(this.bsRangeValue2))
		this.uploadSuccess.emit(false);
	}

  receiveDate(dateValue: any){
		this.isRange = dateValue.range
		this.bsRangeValue2 = dateValue.range;
		// this.selected_date_range = dateValue.range;
		
	}

  columInitialize() {
    this.cols = [
      { field: 'port_name', header: 'Port', style: '200' , total : ''},
			{ field: 'non_invoice', header: 'NON Invoice No', style: '200' , total : ''},
			{ field: 'non_dt', header: 'Non Invoice Date', style: '200' ,  total : '' },
			{ field: 'bl_no', header: 'Bl Invoice No', style: '200' ,  total : '' },
			{ field: 'bl_date', header: 'Bl Invoice Date', style: '200' ,  total : ''},
			{ field: 'noc', header: 'Noc', style: '100' ,  total : '' },
			{ field: 'cha', header: 'Cha', style: '100' ,  total : '' },
			{ field: 'cha_charges', header: 'Cha Charges', style: '600' ,  total : ''},
      { field: 'cha_total', header: 'Total Cha', style: '100' ,  total : this.cha_complete_total},
		
      { field: 'shippingLine', header: 'Shipping', style: '100' ,  total : ''},
			{ field: 'shipping_charges', header: 'Shipping Charges', style: '100' ,  total : ''},
			{ field: 'shipping_cgst', header: 'Shipping cgst', style: '100' ,  total : '' },
			{ field: 'shipping_sgst', header: 'Shipping sgst', style: '100' ,  total : ''},
      { field: 'shipping_total', header: 'Total Shipping', style: '100' ,  total : this.shipping_complete_total},

      { field: 'cfs', header: 'cfs', style: '100' ,  total : ''},
			{ field: 'cfs_charges', header: 'cfs Charges', style: '100' ,  total : '' },
			{ field: 'scanning_charges', header: 'Scanning Charges', style: '100' ,  total : ''},
			{ field: 'examination_charges ', header: 'Examination', style: '100' ,  total : ''},
			{ field: 'cfs_grount_rent', header: 'Grount Rent', style: '100' ,  total : ''},
			{ field: 'cfs_cgst', header: 'cfs cgst', style: '100' ,  total : ''},
			{ field: 'cfs_sgst', header: 'cfs sgst', style: '100' ,  total : '' },
      { field: 'cfs_total', header: 'Total Cfs', style: '100' ,  total : this.cfs_complete_total },

      { field: 'terminal', header: 'Terminal', style: '100' ,  total : '' },
			{ field: 'first_shifting_terminal', header: '1st Shifting', style: '100' ,  total : '' },
			{ field: 'second_shifting_terminal', header: '2nt Shifting', style: '100' ,  total : '' },
			{ field: 'terminal_grount_rent', header: 'Terminal Grount Rent', style: '100' ,  total : '' },
			{ field: 'toll_charges', header: 'Toll Charges', style: '100' ,  total : '' },
			{ field: 'terminal_cgst', header: 'Terminal cgst', style: '100' ,  total : '' },
			{ field: 'terminal_sgst', header: 'Terminal sgst', style: '100' ,  total : ''},
			{ field: 'remark_terminal', header: 'Remark Terminal', style: '100' ,  total : '' },
      { field: 'terminal_total', header: 'Total Terminal', style: '100' ,  total : this.terminal_complete_total },

      { field: 'bondGodown', header: 'Bond', style: '100'  ,  total : ''},
      { field: 'bond_charges', header: 'Bond Charges', style: '500' ,  total : '' },

      { field: 'bond_total', header: 'Total Bond', style: '100'  ,total : this.bond_complete_total },

     
      { field: 'transporter_charges', header: 'Transporter Charges', style: '600' ,  total : '' },

      { field: 'transporter_total', header: 'Total Transporter', style: '100' ,  total : this.transporter_complete_total},
      { field: 'load_cross', header: 'Total Load/Cross', style: '100' ,  total : this.load_cross_complete},
      { field: 'total_charges', header: 'Total Charges', style: '100' ,  total : this.complete_total_charges },
		
		
		

		];

    // this.typeList = [{type:'cha_id' , value: 'CHA'} , {type:'cfs_dpd' , value: 'CFS'} , {type:'terminal_id' , value: 'TERMINAL'}  , {type:'shipping_line_id' , value: 'SHIPPING'} , {type:'transporter_id' , value: 'TRANSPORTER'} , {type:'bond_id' , value: 'BOND'} , {type:'fob_id' , value: 'FOB'} , {type:'storage_godown' , value: 'STORAGE'} , {type:'unload_cross' , value: 'UNLOAD/CROSS'}]

    this.typeList = [{type:'cha' , value: 'CHA'} , {type:'cfs' , value: 'CFS'} , {type:'terminal' , value: 'TERMINAL'}  , {type:'shipping' , value: 'SHIPPING'} , {type:'transporter' , value: 'TRANSPORTER'} , {type:'bond' , value: 'BOND'} , {type:'fob' , value: 'FOB'} , {type:'storage' , value: 'STORAGE'} , {type:'load' , value: 'UNLOAD/CROSS'}]

    


    this.cols2 =[ 
      { field: 'port_name', header: 'Port', style: '100' },
      { field: 'agency', header: 'Agency', style: '100' },
      { field: 'totalcharges', header: 'Total Charges', style: '100' }
     
     
  ]
  }

  onSelect(event) {
    if(event == null) {
      this.fromblDate = '';
      this.toblDate = '';
    }
    if(event) {
      this.fromblDate = this.datepipe.transform( event[0], 'yyyy-MM-dd');
      this.toblDate =this.datepipe.transform( event[1], 'yyyy-MM-dd');
    }

    this.getList();

  }

  onSelect2(event) {
    if(event == null) {
      this.fromArrivalDate = '';
      this.toArrivalDate = '';
    }
    if(event) {
      this.fromArrivalDate = this.datepipe.transform( event[0], 'yyyy-MM-dd');
      this.toArrivalDate = this.datepipe.transform( event[1], 'yyyy-MM-dd');
    }
   
    this.getData();

  }

  getData() {
    
    this.isLoadingList = true;
    this.crudServices.getOne<any>(logistics_charges.getTypeWiseCharges , {fromArrivalDate : this.fromArrivalDate , toArrivalDate: this.toArrivalDate }).subscribe(response => {
      this.isLoadingList = false;
      if(response) {

        if(response.total) {
          this.typeWiseList= response.total.filter(item => item.totalcharges!=null);
        }

        this.global_list =  response;

   
     
        for(let val of  this.typeWiseList) {
          if (!(val.agency in this.lookup_agency)) {
            if(val.agency != '') {
            this.lookup_agency[val.agency] = 1;
            this.agency_list.push({ 'agency': val.agency });
            }
          }
          if (!(val.port_name in this.lookup_port)) {
            if(val.port_name != '') {
            this.lookup_port[val.port_name] = 1;
            this.portList.push({ 'port_name': val.port_name });
            }
          }
        }
        this.totalCharges =  this.typeWiseList.reduce((sum,item) => 
              sum + Number(item.totalcharges)
        , 0)
  
        // this.global_list =  this.typeWiseList;

      }
     
  
      
      
    })

    

  

  

  }

  getDataType(val) {

    if(val != null) {
      this.typeWiseList = this.global_list[val.type];
     // this.typeWiseList = this.typeWiseList.filter(item =>  item['TotalCharges'] != null );
    } else {
      this.typeWiseList = this.global_list['total'];
    
    }

    console.log( this.typeWiseList );
    

    this.totalCharges =  this.typeWiseList.reduce((sum,item) =>  sum + Number(item.totalcharges)
    , 0)
  


   
  }



  getList() {
    this.isLoading = true;
    this.crudServices.getOne<any>(logistics_charges.getChargesList , {start_date : this.fromblDate , end_date : this.toblDate }).subscribe(response => {
      this.isLoading = false;
      if(response.length) {
        // 
        console.log("RESPONSE >>",response);
        
        // 
        let cha_total = 0;
        let shipping_total = 0;
        let cfs_total = 0;
        let terminal_total = 0;
        let bond_total = 0;
        let transporter_total = 0;
        let load_cross = 0;
        for(let element of response) {
          element.non_invoice = element.non_negotiable.invoice_no;
          element.non_dt = element.non_negotiable.invoice_date;
          if(element.bill_of_lading != null) {
            element.bl_invoice = element.bill_of_lading.bill_lading_no;
            element.noc = element.bill_of_lading.container_details.length;
            element.bl_date = element.bill_of_lading.bl_date;
            element.cfs = element.bill_of_lading.cfsDpd ? element.bill_of_lading.cfsDpd.sub_org_name : null;
            element.cha = element.bill_of_lading.cha ? element.bill_of_lading.cha.sub_org_name : null;
            element.terminal = element.bill_of_lading.terminal ? element.bill_of_lading.terminal.sub_org_name : null;
            element.bondGodown = element.bill_of_lading.bondGodown ? element.bill_of_lading.bondGodown.godown_name : null;
            element.bondArr = element.bill_of_lading.logistics_bond_charges ? element.bill_of_lading.logistics_bond_charges : [];
            element.transporterArr = element.bill_of_lading.transporter_charges ? element.bill_of_lading.transporter_charges : [];
            element.chaArr = element.bill_of_lading.cha_charges ? element.bill_of_lading.cha_charges : [];
            element.containerArr = element.bill_of_lading.container_details ? element.bill_of_lading.container_details : [];
            

            
            shipping_total = element.shipping_charges + element.shipping_cgst + element.shipping_sgst;
            cfs_total = element.cfs_charges + element.scanning_charges  + element.examination_charges  +  element.cfs_grount_rent + element.cfs_cgst + element.cfs_sgst;
            terminal_total = element.first_shifting_terminal + element.second_shifting_terminal + element.cfs_grount_rent + element.toll_charges  + element.terminal_cgst + element.terminal_sgst;
            if(element.bill_of_lading.logistics_bond_charges != null) {
              bond_total = element.bondArr.reduce((sum, item) => sum + item.charge_rate + item.cgst + item.sgst, 0); 
            }

            if(element.bill_of_lading.cha_charges != null) {
              cha_total = element.chaArr.reduce((sum, item) => sum +  item.cha_charges +  item.edi  +  item.general_stamp  + item.cha_other_charges+ item.cha_cgst + item.cha_sgst, 0); 
            }

            if(element.bill_of_lading.transporter_charges  != null) {
              transporter_total = element.transporterArr.reduce((sum, item) => sum + item.rate +item.detention + item.empty_lift_off+ item.cgst + item.sgst, 0); 
            }

            if(element.bill_of_lading.container_details  != null) {
             
              load_cross = element.bill_of_lading.container_details.reduce((sum, item) => sum + item.charges, 0); 
            }

            
          
          }
          

          if(element.non_negotiable != null) {
            
            element.shippingLine = element.non_negotiable.shippingLine ? element.non_negotiable.shippingLine.sub_org_name : null;
            element.port_name = element.non_negotiable.port_master ? element.non_negotiable.port_master.port_name : null;
          }
          let total_charges = Number(cha_total) + Number(shipping_total) + Number(cfs_total) + Number(terminal_total) + Number(bond_total) + Number(transporter_total) + Number(load_cross);
          element.cha_total = cha_total;
          element.load_cross = load_cross;
          element.shipping_total = shipping_total;
          element.cfs_total = cfs_total;
          element.terminal_total = terminal_total;
          element.bond_total = bond_total.toFixed(2);
          element.transporter_total = transporter_total.toFixed(2);
          element.total_charges = total_charges.toFixed(2);




          
      if (!(element.port_name in this.lookup)) {
        if(element.port_name != '') {
          this.lookup[element.port_name] = 1;
          this.port_list.push({ 'port_name': element.port_name });
        }
      
      }

      if (!(element.bondGodown in this.lookup_bond)) {
        if(element.bondGodown != '') {
        this.lookup_bond[element.bondGodown] = 1;
        this.bond_list.push({ 'bondGodown': element.bondGodown });
        }
      }

      if (!(element.cha in this.lookup_cha)) {
        if(element.cha != '') {
        this.lookup_cha[element.cha] = 1;
        this.cha_list.push({ 'cha': element.cha });
        }
      }

      if (!(element.cfs in this.lookup_cfs)) {
        if(element.cfs != '') {
        this.lookup_cfs[element.cfs] = 1;
        this.cfs_list.push({ 'cfs': element.cfs });
        }
      }

      if (!(element.terminal in this.lookup_terminal)) {
        if(element.terminal != '') {
        this.lookup_terminal[element.terminal] = 1;
        this.terminal_list.push({ 'terminal': element.terminal });
        }
      }

      if (!(element.shippingLine in this.lookup_shipping)) {
        if(element.shippingLine != '') {
        this.lookup_shipping[element.shippingLine] = 1;
        this.shipping_list.push({ 'shippingLine': element.shippingLine });
        }
      }

      
      
        
        
        
          this.be_list.push(element);
          this.table.reset();
          this.calculateTotal(this.be_list);

        }
      
    
      }
    })
  }

  calculateTotal(be_list) {
    
    this.cha_complete_total = be_list.reduce((sum, item) => sum + Number(item.cha_total), 0);
    this.shipping_complete_total = be_list.reduce((sum, item) => sum + Number(item.shipping_total), 0);
    this.terminal_complete_total = be_list.reduce((sum, item) => sum + Number(item.terminal_total), 0);
    this.cfs_complete_total = be_list.reduce((sum, item) => sum + Number(item.cfs_total), 0);
    this.bond_complete_total = be_list.reduce((sum, item) => sum + Number(item.bond_total), 0);
    this.transporter_complete_total = be_list.reduce((sum, item) => sum + Number(item.transporter_total), 0);
    this.load_cross_complete = be_list.reduce((sum, item) => sum + Number(item.load_cross), 0);
    this.complete_total_charges = be_list.reduce((sum, item) => sum + Number(item.total_charges), 0);

    this.columInitialize();

   
  }


  exportExcel() {
    let arr = [];
    const foot = {};
    let export_list = []
    if (this.filteredValuess.length) {
      arr = this.filteredValuess;
    } else {
      arr = this.be_list;
    }
    for (let i = 0; i < arr.length; i++) {
      const export_be = {};
      for (let j = 0; j < this.cols.length; j++) {
        if (this.cols[j]["header"] != "Action") {
          export_be[this.cols[j]["header"]] =
            arr[i][this.cols[j]["field"]];
        }
      }
      export_list.push(export_be);
    }

    console.log(export_list);
    

    	for (let j = 0; j < this.cols.length; j++) {
    		if (this.cols[j]["field"] === "cha_total") {
    			foot[this.cols[j]["header"]] = `Total:${this.cha_complete_total}`;
    		} 
        else if (this.cols[j]["field"] === "shipping_total") {
    			foot[this.cols[j]["header"]] = `Total:${this.shipping_complete_total}`;
    		} 
        else if (this.cols[j]["field"] === "terminal_total") {
    			foot[this.cols[j]["header"]] = `Total:${this.terminal_complete_total}`;
    		}
        else if (this.cols[j]["field"] === "cfs_total") {
    			foot[this.cols[j]["header"]] = `Total:${this.cfs_complete_total}`;
    		}
        else if (this.cols[j]["field"] === "bond_total") {
    			foot[this.cols[j]["header"]] = `Total:${this.bond_complete_total}`;
    		}
        else if (this.cols[j]["field"] === "transporter_total") {
    			foot[this.cols[j]["header"]] = `Total:${this.transporter_complete_total}`;
    		}
        else {
    			foot[this.cols[j]["header"]] = "";
    		}
    	}
     export_list.push(foot);
    this.exportService.exportExcel(
      export_list,
      "charges list"
    );
  }

  exportExcel2() {
    let arr = [];
    const foot = {};
    let export_list = []
    if (this.filteredValuess2.length) {
      arr = this.filteredValuess2;
    } else {
      arr = this.typeWiseList;
    }
    for (let i = 0; i < arr.length; i++) {
      const export_be = {};
      for (let j = 0; j < this.cols2.length; j++) {
      
          export_be[this.cols2[j]["header"]] =
            arr[i][this.cols2[j]["field"]];
        }
      
      export_list.push(export_be);
    }

    console.log(export_list);
    

    	for (let j = 0; j < this.cols2.length; j++) {
    		if (this.cols2[j]["field"] === "totalcharges") {
    			foot[this.cols2[j]["header"]] = `Total:${this.totalCharges}`;
    		} 
      
        else {
    			foot[this.cols2[j]["header"]] = "";
    		}
    	}
     export_list.push(foot);
    this.exportService.exportExcel(
      export_list,
      "charges list"
    );
  }


  
  onFilter(event, dt) {


		this.filteredValuess = [];

		this.filteredValuess = event.filteredValue;

     this.calculateTotal(this.filteredValuess);


	}

  onFilter2(event, dt) {


		this.filteredValuess2 = [];

		this.filteredValuess2 = event.filteredValue;
    console.log(	this.filteredValuess2);
    
    this.totalCharges =  this.filteredValuess2.reduce((sum,item) =>  sum + Number(item.totalcharges)
, 0)

    


	}

  // multiselect filter
  onchange(event, name) {
    const arr = [];
    if (event.value.length > 0) {
      for (let i = 0; i < event.value.length; i++) {
        arr.push(event.value[i][name]);
      }

      this.table.filter(arr, name, 'in');

    } else {
      this.table.filter('', name, 'in');
    }
  }

    // multiselect filter
    onchange2(event, name) {
      const arr = [];
      if (event.value.length > 0) {
        for (let i = 0; i < event.value.length; i++) {
          arr.push(event.value[i][name]);
        }
  
        this.table2.filter(arr, name, 'in');
  
      } else {
        this.table2.filter('', name, 'in');
      }
    }
  

 

 


}


