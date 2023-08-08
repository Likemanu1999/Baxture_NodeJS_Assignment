

import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { billOfEntry, billOfLading, logistics_charges } from '../../../shared/apis-path/apis-path';
import { UserDetails } from '../../login/UserDetails.model';
import { ExportService } from '../../../shared/export-service/export-service';
import { Table } from 'primeng/table';
@Component({
  selector: 'app-logistics-charges-report',
  templateUrl: './logistics-charges-report.component.html',
  styleUrls: ['./logistics-charges-report.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    PermissionService,
    LoginService,
    DatePipe,
    ExportService,
    CrudServices
  ]
})
export class LogisticsChargesReportComponent implements OnInit {

  cols: { field: string; header: string; style: string; total: string }[];
  @ViewChild('dt', { static: false }) table: Table;

  bsRangeValue: Date[];
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

  totalCharges = 0;

  global_list = {};
  citpl_complete: any;
  export_list = [];
  exportColumns= [];
  storage_complete: any;
  fob_complete: string;



  constructor(private permissionService: PermissionService,
    private loginService: LoginService,
    public datepipe: DatePipe,
    private crudServices: CrudServices, private exportService: ExportService,) {
    this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));


    if (this.datepipe.transform(this.date, 'MM') > '03') {
      this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
    } else {
      this.bsRangeValue = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];
    }
  }

  ngOnInit() {
    this.columInitialize();

    //this.getList();

  }

  columInitialize() {


    this.cols = [
      { field: 'port_name', header: 'Port', style: '100', total: '' },
      { field: 'non_invoice', header: 'NON Invoice No', style: '100', total: '' },
      { field: 'bl_no', header: 'Bl Invoice No', style: '100', total: '' },
      { field: 'cha_total', header: 'Total Cha', style: '100', total: this.cha_complete_total },
      { field: 'shipping_total', header: 'Total Shipping', style: '100', total: this.shipping_complete_total },
      { field: 'cfs_total', header: 'Total Cfs', style: '100', total: this.cfs_complete_total },
      { field: 'terminal_total', header: 'Total Terminal', style: '100', total: this.terminal_complete_total },
      { field: 'bond_total', header: 'Total Bond', style: '100', total: this.bond_complete_total },
      { field: 'transporter_total', header: 'Total Transporter', style: '100', total: this.transporter_complete_total },
      { field: 'load_cross', header: 'Total Load/Cross', style: '100', total: this.load_cross_complete },
      { field: 'citpl_total', header: 'Total CITPL', style: '100', total: this.citpl_complete },
      { field: 'storage_total', header: 'Total Storage', style: '100', total: this.storage_complete },
      { field: 'fob_total', header: 'Total FOB', style: '100', total: this.fob_complete },
      { field: 'total_charges', header: 'Total Charges', style: '100', total: this.complete_total_charges }
    ];
  }





  getList() {
    this.be_list = [];
    this.isLoading = true;
    if (this.bsRangeValue) {
      this.fromblDate = this.datepipe.transform(this.bsRangeValue[0], 'yyyy-MM-dd');
      this.toblDate = this.datepipe.transform(this.bsRangeValue[1], 'yyyy-MM-dd');
    }



    this.crudServices.getOne<any>(logistics_charges.getChargesList, { from_date: this.fromblDate, to_date: this.toblDate }).subscribe(response => {

      console.log(response);

      this.isLoading = false;
      if (response.length) {
        let cha_total = 0;
        let shipping_total = 0;
        let cfs_total = 0;
        let terminal_total = 0;
        let bond_total = 0;
        let transporter_total = 0;
        let load_cross = 0;
        let citpl_total = 0;
        let storage_total = 0;
        let fob_total = 0;
        for (let element of response) {
          element.non_invoice = element.non_negotiable.invoice_no;

          if (element.bill_of_lading != null) {
            element.bl_invoice = element.bill_of_lading.bill_lading_no;
            element.bondArr = element.bill_of_lading.logistics_bond_charges ? element.bill_of_lading.logistics_bond_charges : [];
            element.transporterArr = element.bill_of_lading.transporter_charges ? element.bill_of_lading.transporter_charges : [];
            element.chaArr = element.bill_of_lading.cha_charges ? element.bill_of_lading.cha_charges : [];
            element.containerArr = element.bill_of_lading.container_details ? element.bill_of_lading.container_details : [];



            shipping_total = element.shipping_charges + element.shipping_cgst + element.shipping_sgst;
            citpl_total = element.citpl_cgst + element.citpl_charges + element.citpl_sgst;
            cfs_total = element.cfs_charges + element.scanning_charges + element.examination_charges + element.cfs_grount_rent + element.cfs_cgst + element.cfs_sgst;
            terminal_total = element.first_shifting_terminal + element.second_shifting_terminal + element.cfs_grount_rent + element.toll_charges + element.terminal_cgst + element.terminal_sgst;
           
            fob_total = element.fob_charges + element.fob_cgst+ element.fob_sgst;
            if (element.bill_of_lading.logistics_bond_charges != null) {
              bond_total = element.bondArr.reduce((sum, item) => sum + item.charge_rate + item.cgst + item.sgst, 0);
            }

            if (element.bill_of_lading.cha_charges != null) {
              cha_total = element.chaArr.reduce((sum, item) => sum + item.cha_charges + item.edi + item.general_stamp + item.cha_other_charges + item.cha_cgst + item.cha_sgst, 0);
            }

            if (element.bill_of_lading.transporter_charges != null) {
              transporter_total = element.transporterArr.reduce((sum, item) => sum + item.rate + item.detention + item.empty_lift_off + item.cgst + item.sgst, 0);
            }

            if (element.bill_of_lading.container_details != null) {

              load_cross = element.bill_of_lading.container_details.reduce((sum, item) => sum + item.charges, 0);
            }

            if(element.bill_of_lading.logistics_storage_charges  != null) {
             
              storage_total = element.bill_of_lading.logistics_storage_charges.reduce((sum, item) => sum + (Number(item.storage_charges) + Number(item.storage_sgst) + Number(item.storage_cgst)), 0);

          
            }



          }


          if (element.non_negotiable != null) {

            element.shippingLine = element.non_negotiable.shippingLine ? element.non_negotiable.shippingLine.sub_org_name : null;
            element.port_name = element.non_negotiable.port_master ? element.non_negotiable.port_master.port_name : null;
          }
          let total_charges = Number(cha_total) + Number(shipping_total) + Number(cfs_total) + Number(terminal_total) + Number(bond_total) + Number(transporter_total) + Number(load_cross) + Number(citpl_total) + Number(storage_total) + Number(fob_total);
          element.cha_total = cha_total;
          element.load_cross = load_cross;
          element.shipping_total = shipping_total;
          element.cfs_total = cfs_total;
          element.terminal_total = terminal_total.toFixed(2);
          element.bond_total = bond_total.toFixed(2);
          element.transporter_total = transporter_total.toFixed(2);
          element.citpl_total = citpl_total.toFixed(2);
          element.storage_total = storage_total.toFixed(2);
          element.fob_total = fob_total.toFixed(2);
          element.total_charges = total_charges.toFixed(2);





          if (!(element.port_name in this.lookup)) {
            if (element.port_name != '') {
              this.lookup[element.port_name] = 1;
              this.port_list.push({ 'port_name': element.port_name });
            }

          }


          this.be_list.push(element);
          this.table.reset();


        }
        this.calculateTotal(this.be_list);


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
    this.citpl_complete = be_list.reduce((sum, item) => sum + Number(item.citpl_total), 0);
    this.storage_complete = be_list.reduce((sum, item) => sum + Number(item.storage_total), 0);
    this.fob_complete = be_list.reduce((sum, item) => sum + Number(item.fob_total), 0);
    this.complete_total_charges = be_list.reduce((sum, item) => sum + Number(item.total_charges), 0);

    this.columInitialize();


  }


  exportData() {
    let arr = [];
    const foot = {};
    this.export_list = []
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
      this.export_list.push(export_be);
    }


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
      }else if (this.cols[j]["field"] === "load_cross") {
        foot[this.cols[j]["header"]] = `Total:${this.load_cross_complete}`;
      }else if (this.cols[j]["field"] === "citpl_total") {
        foot[this.cols[j]["header"]] = `Total:${this.citpl_complete}`;
      }else if (this.cols[j]["field"] === "storage_total") {
        foot[this.cols[j]["header"]] = `Total:${this.storage_complete}`;
      }else if (this.cols[j]["field"] === "fob_total") {
        foot[this.cols[j]["header"]] = `Total:${this.fob_complete}`;
      }

      else {
        foot[this.cols[j]["header"]] = "";
      }
    }
    this.export_list.push(foot);

  }
  exportExcel() {
    this.exportData();
    this.exportService.exportExcel(
      this.export_list,
      "charges list"
    );
  }

  exportPdf() {
    this.exportData();
    for (let col of this.cols) {
        this.exportColumns.push({ title: col.header, dataKey: col.header });
    
    }
   
    this.exportService.exportPdf(this.exportColumns, this.export_list, 'charges list');
  }



  onFilter(event, dt) {


    this.filteredValuess = [];

    this.filteredValuess = event.filteredValue;

    this.calculateTotal(this.filteredValuess);


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


}
