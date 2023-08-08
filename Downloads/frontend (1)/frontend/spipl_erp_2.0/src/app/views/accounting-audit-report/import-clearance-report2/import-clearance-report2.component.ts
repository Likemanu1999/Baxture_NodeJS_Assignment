import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { billOfEntry, billOfLading, logistics_charges, account_audit_reports } from '../../../shared/apis-path/apis-path';
import { UserDetails } from '../../login/UserDetails.model';
import { ExportService } from '../../../shared/export-service/export-service';
import { staticValues } from '../../../shared/common-service/common-service';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-import-clearance-report2',
  templateUrl: './import-clearance-report2.component.html',
  styleUrls: ['./import-clearance-report2.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    PermissionService,
    LoginService,
    DatePipe,
    ExportService,
    CrudServices
  ]
})
export class ImportClearanceReport2Component implements OnInit {
  cols: { field: string; header: string; style: string; total: string }[];
  @ViewChild('dt', { static: false }) table: Table;
  @ViewChild('dt2', { static: false }) table2: Table;
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
  selectedItem: any[];
  isLoading: boolean;
  load_cross_complete: string;
  lookup = {};
  port_list = [];

  lookup_cha = {};
  cha_list = [];

  lookup_shipping = {};
  shipping_list = [];

  lookup_terminal = {};
  terminal_list = [];

  lookup_bond = {};
  bond_list = [];

  lookup_cfs = {};
  cfs_list = [];
  typeWiseList = [];
  cols2: { field: string; header: string; style: string; total: string; type: boolean }[];
  filteredValuess2 = [];
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
  gst_s: any = [];

  clearanceData: [];
  expences: any = staticValues.Expences_TYPE;
  colorArr: any = staticValues.job_reference_status;
  colorSet: any = ['text-success', 'text-warning', 'text-primary', 'text-secondary', 'text-danger', 'text-info'];

  constructor(
    private permissionService: PermissionService,
    private loginService: LoginService,
    public datepipe: DatePipe,
    private crudServices: CrudServices, private exportService: ExportService,) {

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
    this.columInitialize();
    this.fromArrivalDate = this.datepipe.transform(this.bsRangeValue2[0], 'yyyy-MM-dd');
    this.toArrivalDate = this.datepipe.transform(this.bsRangeValue2[1], 'yyyy-MM-dd');

    this.getData();

  }

  columInitialize() {

    this.cols2 = [
      // { field: 'port_name', header: 'Date Of Booking', style: '100',total : '' },
      { field: 'party_name', header: 'Party Name', style: '100', total: '', type: null },
      { field: 'expences', header: 'Expenses Head', style: '100', total: '', type: null },
      { field: 'port', header: 'Port', style: '200', total: '', type: null },
      { field: 'party_name', header: 'Import Supplier Name', style: '200', total: '', type: null },
      { field: 'invoice_no', header: 'Import Inv.No', style: '200', total: '', type: null },
      { field: 'invoice_date', header: 'Import Inv.Date', style: '200', total: '', type: null },
      { field: 'be_no', header: 'BE no', style: '200', total: '', type: null },
      { field: 'quantity', header: 'Quantity', style: '200', total: '', type: null },
      // { field: 'port_name', header: 'Division Name', style: '200' , total : '',type: null},
      // { field: 'port_name', header: 'TDS Applicable', style: '200' , total : ''},type: null,
      { field: 'spipl_state', header: 'SPIPL State', style: '200', total: '', type: null },
      { field: 'spipl_gst', header: 'SPIPL GST', style: '200', total: '', type: null },
      { field: 'party_state', header: 'Party State', style: '200', total: '', type: null },
      { field: 'party_pan', header: 'PAN (service Provider)', style: '200', total: '', type: null },
      { field: 'port_name', header: 'GSTIN/UIN', style: '200', total: '', type: null },
      { field: 'port_name', header: 'Invoice No.', style: '200', total: '', type: null },
      { field: 'port_name', header: 'Invoice Date.', style: '200', total: '', type: null },
      { field: 'port_name', header: 'Basic Amount.', style: '200', total: '', type: null },
      { field: 'gst_percent', header: 'GST Rate', style: '200', total: '', type: null },
      { field: 'cgst', header: 'CGST.', style: '200', total: '', type: true },
      { field: 'sgst', header: 'SGST', style: '200', total: '', type: true },
      { field: 'igst', header: 'IGST', style: '200', total: '', type: true },
      { field: 'charges', header: 'Invoice Total', style: '200', total: '', type: true },
      { field: 'remark_auditor', header: 'Remark Auditor', style: '200', total: '', type: null },


    ];
  }

  onSelect(event) {
    if (event == null) {
      this.fromblDate = '';
      this.toblDate = '';
    }
    if (event) {
      this.fromblDate = this.datepipe.transform(event[0], 'yyyy-MM-dd');
      this.toblDate = this.datepipe.transform(event[1], 'yyyy-MM-dd');
    }

    // this.getList();

  }

  onSelect2(event) {
    if (event == null) {
      this.fromArrivalDate = '';
      this.toArrivalDate = '';
    }
    if (event) {
      this.fromArrivalDate = this.datepipe.transform(event[0], 'yyyy-MM-dd');
      this.toArrivalDate = this.datepipe.transform(event[1], 'yyyy-MM-dd');
    }

    this.getData();

  }

  getData() {
    this.isLoadingList = true;
    this.crudServices.getOne<any>(account_audit_reports.getTypeWiseCharges, { fromArrivalDate: this.fromArrivalDate, toArrivalDate: this.toArrivalDate }).subscribe(response => {
      this.isLoadingList = false;
      console.log("RESULT >>", response);

      if (response) {
        response.queryResult.forEach(element => {
          console.log("HELLO ");

          element.quantity = (Number(element.covered_bl_qty) != 0) ? element.covered_bl_qty : element.original_qty;
          response.state.forEach(state => {
            if (state.tin == element.tin) {
              element.spipl_state = state.name;
            }
          });

          // for cha
          if (element.cha_cgst != null && element.cha_sgst != null) {
            let gst_total = element.cha_cgst + element.cha_sgst;
            if (element.cha_charges != null) {
              if ((element.cha_charges * 0.18) == gst_total)
                element.chaGstPerc = 18;
              else if ((element.cha_charges * 0.12) == gst_total)
                element.chaGstPerc = 12;
              else if ((element.cha_charges * 0.09) == gst_total)
                element.chaGstPerc = 9;
            }
          }
          else {
            element.chaGstPerc = null;
          }

          // for bond 
          if (element.bond_cgst != null && element.bond_sgst != null) {
            let gst_total = element.bond_cgst + element.bond_sgst;
            if (element.bond_charges != null) {
              if ((element.bond_charges * 0.18) == gst_total)
                element.bondGstPerc = 18;
              else if ((element.bond_charges * 0.12) == gst_total)
                element.bondGstPerc = 12;
              else if ((element.bond_charges * 0.09) == gst_total)
                element.bondGstPerc = 9;
            }
          }
          else {
            element.bondGstPerc = null;
          }

          // for shipping 
          if ((element.shipping_cgst != null && element.shipping_sgst != null) || element.shipping_igst != null) {
            let gst_total = (element.shipping_cgst == 0 || null) ? element.shipping_igst : (element.shipping_cgst + element.shipping_sgst);
            if (element.shipping_charges != null) {
              if ((element.shipping_charges * 0.18) == gst_total)
                element.shippingGstPerc = 18;
              else if ((element.shipping_charges * 0.12) == gst_total)
                element.shippingGstPerc = 12;
              else if ((element.shipping_charges * 0.09) == gst_total)
                element.shippingGstPerc = 9;
            }
          }
          else {
            element.shippingGstPerc = null;
          }


          // for terminal
          if ((element.terminal_cgst != null && element.terminal_sgst != null) || element.terminal_igst != null) {
            let gst_total = (element.terminal_cgst == 0 || null) ? element.terminal_igst : (element.terminal_cgst + element.terminal_sgst);
            if (element.shipping_charges != null) {
              if ((element.terminal_charges * 0.18) == gst_total)
                element.terminalGstPerc = 18;
              else if ((element.terminal_charges * 0.12) == gst_total)
                element.terminalGstPerc = 12;
              else if ((element.terminal_charges * 0.09) == gst_total)
                element.terminalGstPerc = 9;
            }
          }
          else {
            element.terminalGstPerc = null;
          }

          // for cfs

          if (element.cfs_cgst != null && element.cfs_sgst != null) {
            let gst_total = element.cfs_cgst + element.cfs_sgst;
            if (element.cfs_charges != null) {
              if ((element.cfs_charges * 0.18) == gst_total)
                element.cfsGstPerc = 18;
              else if ((element.cfs_charges * 0.12) == gst_total)
                element.cfsGstPerc = 12;
              else if ((element.cfs_charges * 0.09) == gst_total)
                element.cfsGstPerc = 9;
            }
          }
          else {
            element.cfsGstPerc = null;
          }
          
          // for storage
          if (element.cha_cgst != null && element.cha_sgst != null) {
            let gst_total = element.cha_cgst + element.cha_sgst;
            if (element.cha_charges != null) {
              if ((element.cha_charges * 0.18) == gst_total)
                element.chaGstPerc = 18;
              else if ((element.cha_charges * 0.12) == gst_total)
                element.chaGstPerc = 12;
              else if ((element.cha_charges * 0.09) == gst_total)
                element.chaGstPerc = 9;
            }
          }
          else {
            element.chaGstPerc = null;
          }


         


          //   element.sgst = [];
          // element.sgst.push(element.cha_cgst, element.fob_cgst, element.shipping_cgst, element.storage_cgst, element.terminal_cgst)
          // element.cgst = [];
          // element.cgst.push(element.cha_cgst, element.fob_charges, element.element.shipment, element.storage, element.terminal)
          // element.igst = [];
          // element.igst.push(element.cha_cgst, element.fob_charges, element.element.shipment, element.storage, element.terminal)

          // this.gst_s.push(cgst: {}, sgst: {}, igst: {})

        });


        //   this.colorSet.forEach(
        //     element=>{

        //       console.log("My Color >>",element);
        // })

        //   console.log("My Color >>",this.colorSet);


        console.log("DATA >>", response.queryResult);
        console.log("States >>", response.state)
        this.clearanceData = response.queryResult;
        // this.global_list = response.queryResult;

      }
    })


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

    // this.calculateTotal(this.filteredValuess);


  }

  onFilter2(event, dt) {


    this.filteredValuess2 = [];

    this.filteredValuess2 = event.filteredValue;
    console.log(this.filteredValuess2);

    this.totalCharges = this.filteredValuess2.reduce((sum, item) => sum + Number(item.totalcharges)
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


