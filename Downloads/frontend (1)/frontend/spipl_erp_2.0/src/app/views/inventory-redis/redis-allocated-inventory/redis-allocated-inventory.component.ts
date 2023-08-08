import { Component, OnInit, ViewChild } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { Table } from 'primeng/table';
import { LiveInventory, StaffMemberMaster, FileUpload, LocalPurchase } from '../../../shared/apis-path/apis-path';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { ExportService } from '../../../shared/export-service/export-service';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { UserDetails } from '../../login/UserDetails.model';
import pdfMake from 'pdfmake/build/pdfmake';
import * as moment from 'moment';

@Component({
  selector: 'app-redis-allocated-inventory',
  templateUrl: './redis-allocated-inventory.component.html',
  styleUrls: ['./redis-allocated-inventory.component.scss'],
  providers: [CrudServices, PermissionService, LoginService, ExportService, ToasterService]

})
export class RedisAllocatedInventoryComponent implements OnInit {

  @ViewChild('dt', { static: false }) table: Table;
  cols: any = [];
  isLoading: Boolean = false;
  data: any = [];
  AllData: any = [];

  _selectedColumns: any[];

  grades = [];
  lookup_grade = {};

  godowns = [];
  lookup_godowns = {};

  main_lookup_grade = {};
  main_grades = [];

  lookup_import_local = {};
  import_local_arr = [];

  tot_inventory = 0;
  total_remain_inventory = 0;
  total_remain_inventory_import = 0;
  total_remain_inventory_local = 0;
  filteredValuess = [];
  selectedFile: File
  user: UserDetails;
  links: string[] = [];
  is_allocate_check: any;
  export_list: any[];
  fileData: FormData = new FormData();
  toasterconfig: ToasterConfig = new ToasterConfig({
    tapToDismiss: false,
    timeout: 5000,
  });

  zoneList: any = [];
  selectedZone: any
  allocated_inventory_send: any;

  constructor(private CrudServices: CrudServices, private permissionService: PermissionService, private loginService: LoginService, private exportService: ExportService,
    private toasterService: ToasterService) {
    this.cols = [
      { field: "local_import_flag_name", header: "Import Local Flag", permission: true },
      { field: "godown_name", header: "Godwon Name", permission: true },
      { field: "main_grade", header: "Main Grade", permission: true },
      { field: "grade_name", header: "Grade Name", permission: true },
      { field: "inventory", header: "Inventory", permission: true },
    ];
    this._selectedColumns = this.cols;

    this.loadData();

    const perms = this.permissionService.getPermission();

    this.user = this.loginService.getUserDetails();
    this.links = this.user.links;
    this.is_allocate_check = (this.links.indexOf('is_allocate_check') > -1);
    this.allocated_inventory_send = (this.links.indexOf('allocated_inventory_send') > -1);

    this.getMarketingPersons();
  }

  ngOnInit() {
  }

  getMarketingPersons() {
    this.CrudServices.getOne<any>(StaffMemberMaster.getMarketingPersons, {
      role_id: 5
    }).subscribe(response => {
      this.zoneList = response.data.map(zone => {
        zone.fullname = `${zone.title} ${zone.first_name} ${zone.middle_name}  ${zone.last_name}`;
        return zone;
      });
    });
  }

  loadData() {
    this.isLoading = true;
    this.data = [];
    this.AllData = [];
    this.CrudServices.getRequest<any>(LiveInventory.marketing_person_wise_stock_import_local_redis).subscribe((response) => {
      console.log(response, "Marketinperson");
      this.isLoading = false;


      if (response.length > 0) {

        this.total_remain_inventory = 0;
        this.total_remain_inventory_import = 0;
        this.total_remain_inventory_local = 0;
        for (let item, i = 0; item = response[i++];) {
          let godown_name = item.godown_name;

          let main_godown_id = item.main_godown_id;


          for (let grd_item, j = 0; grd_item = item.grade_details[j++];) {
            let grade_name = grd_item.grade_name
            let main_grade = grd_item.main_grade_name;


            if (!(main_grade in this.main_lookup_grade)) {
              this.main_lookup_grade[main_grade] = 1;
              this.main_grades.push({ 'main_grade': main_grade });
            }

            if (!(grade_name in this.lookup_grade)) {
              this.lookup_grade[grade_name] = 1;
              this.grades.push({ 'grade_name': grade_name });
            }

            if (!(godown_name in this.lookup_godowns)) {
              this.lookup_godowns[godown_name] = 1;
              this.godowns.push({ 'godown_name': godown_name });
            }


            let local_import_flag_name;
            if (grd_item.is_allocate_local == 1) {

              grd_item.local_import_flag_name = 'Local';
              local_import_flag_name = grd_item.local_import_flag_name;
            } else if (grd_item.is_allocate_import == 1) {

              grd_item.local_import_flag_name = 'Import';
              local_import_flag_name = grd_item.local_import_flag_name;
            } else {

            }

            console.log(grd_item.is_allocate_local, local_import_flag_name, "before")

            if (!(local_import_flag_name in this.lookup_import_local)) {
              this.lookup_import_local[local_import_flag_name] = 1;
              this.import_local_arr.push({ 'local_import_flag_name': local_import_flag_name });
            }

            console.log(this.import_local_arr, "after")

            //Number(grd_item.tot_reg_intransite) + 
            let remain_qty = ((Number(grd_item.bond_intransite_spipl) + (Number(grd_item.local_purchase_import_intransite) + Number(grd_item.local_purchase_local_intransite)) + (Number(grd_item.stock_transfer_import_instransite) + Number(grd_item.stock_transfer_local_instransite)) + (Number(grd_item.inventory_import) + Number(grd_item.inventory_local)) - (Number(grd_item.sales_pending_import) + Number(grd_item.sales_pending_local))) - (Number(grd_item.hold_qty_import) + Number(grd_item.hold_qty_local)));

            let import_allocated = ((Number(grd_item.local_purchase_import_intransite) + Number(grd_item.bond_intransite_spipl) + Number(grd_item.stock_transfer_import_instransite) + Number(grd_item.inventory_import) - Number(grd_item.sales_pending_import)) - Number(grd_item.hold_qty_import));

            let local_allocated = (Number(grd_item.local_purchase_local_intransite) + Number(grd_item.stock_transfer_local_instransite) + Number(grd_item.inventory_local) - Number(grd_item.sales_pending_local)) - Number(grd_item.hold_qty_local);

            console.log(import_allocated, local_allocated, "allocation")



            // if (grd_item.isAllocate == 1) {
            // 	this.total_remain_inventory = this.total_remain_inventory + remain_qty;
            // 	this.AllData.push({
            // 		godown_name: godown_name,
            // 		main_grade: main_grade,
            // 		grade_name: grade_name,
            // 		inventory: remain_qty,
            // 		is_allocate: grd_item.isAllocate,
            // 		main_godown_id: main_godown_id
            // 	});
            // }


            if (grd_item.is_allocate_import == 1) {
              this.total_remain_inventory_import = this.total_remain_inventory_import + import_allocated;

              this.total_remain_inventory = this.total_remain_inventory + Number(import_allocated);

              this.AllData.push({
                godown_name: godown_name,
                main_grade: main_grade,
                grade_name: grade_name,
                local_import_flag_name: 'Import',
                inventory: import_allocated,
                is_allocate: grd_item.is_allocate_import,
                main_godown_id: main_godown_id
              });
            }

            if (grd_item.is_allocate_local == 1) {

              this.total_remain_inventory = this.total_remain_inventory + Number(local_allocated);

              this.total_remain_inventory_local = this.total_remain_inventory_local + local_allocated;
              this.AllData.push({
                godown_name: godown_name,
                main_grade: main_grade,
                grade_name: grade_name,
                local_import_flag_name: 'Local',
                inventory: local_allocated,
                is_allocate: grd_item.is_allocate_local,
                main_godown_id: main_godown_id
              });
            }
          }
        }
      }


      console.log(this.AllData, "this.AllData")

    });


  }

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
  getColumnPresent(name) {
    if (this._selectedColumns.find(ob => ob['field'] === name)) {
      return true;
    } else {
      return false;
    }
  }

  onFilter(event, dt) {
    this.filteredValuess = [];
    this.filteredValuess = event.filteredValue;
    this.total_remain_inventory = 0;
    for (const val of this.filteredValuess) {

      // if (val.is_allocate == 1) {

      // 	this.total_remain_inventory = this.total_remain_inventory + Number(val.inventory);
      // 	this.total_remain_inventory_import = this.total_remain_inventory_import + Number(val.inventory);
      // 	this.total_remain_inventory_local = this.total_remain_inventory_local + Number(val.inventory);
      // }

      this.total_remain_inventory = this.total_remain_inventory + Number(val.inventory);
    }
  }

  exportData() {
    this.export_list = [];
    let arr = [];
    const foot = {};
    if (this.filteredValuess.length) {

      arr = this.filteredValuess;
    } else {
      arr = this.AllData;
    }

    console.log(this.filteredValuess, " this.filteredValuess");
    console.log(this.AllData, arr, "arrarr")
    //arr = this.AllData;
    for (let i = 0; i < arr.length; i++) {
      const exportList = {};
      for (let j = 0; j < this.cols.length; j++) {
        exportList[this.cols[j]['header']] = arr[i][this.cols[j]['field']];

      }
      this.export_list.push(exportList);
    }

    for (let j = 0; j < this._selectedColumns.length; j++) {

      if (this._selectedColumns[j]['field'] === 'inventory') {
        foot[this._selectedColumns[j]['header']] = this.total_remain_inventory;
      }
    }


    this.export_list.push(foot);


  }

  exportExcel() {
    this.exportData();
    this.exportService.exportExcel(this.export_list, 'Allocated-Inventory');
  }


  sendAllocateInventory() {
    console.log(this.AllData, "AllDatabb");
    this.CrudServices.postRequest<any>(LiveInventory.getZoneWiseGodownImportLocal, { zone_id: this.selectedZone }).subscribe(async (response) => {
      console.log(response, "rrs");
      if (response.length) {
        let pdfOBjFromData = await this.generatePdf(response);
        if (pdfOBjFromData) {
          await pdfMake.createPdf(pdfOBjFromData).getBlob(data => {
            if (data) {
              this.fileData.append('grade_allocation_pdf', data, 'grade_allocation_pdf.pdf')
              this.CrudServices.fileUpload(FileUpload.upload, this.fileData).subscribe(res => {
                let path = res.uploads.grade_allocation_pdf[0].location;
                console.log(path);
                this.sendWhatsApp(response, path);
              })
            }
          });
        }
      } else {

        this.toasterService.pop('error', 'No Data Found', 'No Data Found')

      }
    });
  }


  sendWhatsApp(element, path) {
    console.log(element, "element")
    let main_obj = {
      "locale": "en",
      "template_name": "grade_allocation",
      'attachment': [
        {
          "caption": "Grdae Allocation",
          "filename": 'Grade Allocation',
          "url": path
        }
      ]
    }
    let sendHeads = [
      element[0].contact_array[0].MarketingPersonName,
      moment(Date.now()).format('DD-MMM-YYYY')
    ];

    console.log(element[0].contact_array[0].MarketingPersonMobile, element[0].contact_array[0].MarketingPersonName, "nehaa");

    let contactNoArray = ["8956139358"];
    contactNoArray.push(element[0].contact_array[0].MarketingPersonMobile);
    console.log(contactNoArray, "contactNoArray")
    main_obj['numbers'] = contactNoArray;
    main_obj['params'] = sendHeads;
    this.CrudServices.postRequest<any>(LocalPurchase.sendSMS, [main_obj]).subscribe(res => {
      if (res) {
        console.log('WhatApp Send');
        this.toasterService.pop('success', 'WhatsApp  Notification !', 'WhatsApp Notification !')
      }
    });
  }


  async generatePdf(allocatedData) {
    console.log(allocatedData);

    let tdate = (new Date(Date.now())).toLocaleString();
    var docDefinition = {

      content: [

        {
          style: 'tableExample',
          table: {

            body: [

              [{
                width: '*',
                text: 'Grade Allocation Inventory Wise - ' + tdate,
                margin: [10, 5, 0, 0],
                bold: true,
                style: 'tableHeader',
                colSpan: 4,
                fillColor: 'black',
                color: 'white',
                alignment: 'center'
              }, {}, {}, {}],


              [
                { text: 'Godown', bold: true, fillColor: '#d3d3d3', border: [true, true, true, true] },
                { text: 'Grade', bold: true, fillColor: '#d3d3d3', border: [true, true, true, true] },
                { text: 'Allocated Inventory Import', bold: true, fillColor: '#d3d3d3', alignment: 'right', border: [true, true, true, true] },
                { text: 'Allocated Inventory Local', bold: true, fillColor: '#d3d3d3', alignment: 'right', border: [true, true, true, true] }
              ]

            ],
            styles: {
              header: {
                fontSize: 18,
                bold: true,
                margin: [0, 0, 0, 10]
              },
              tableExample: {
                margin: [20, 8, 0, 20]
              },
              tableHeader: {
                bold: true,
                fontSize: 13,
                color: 'black'
              }
            }


          },

          layout: {

            paddingLeft: function (i, node) { return 5; },
            paddingRight: function (i, node) { return 5; },
            paddingTop: function (i, node) { return 5; },
            paddingBottom: function (i, node) { return 5; },
          }

        },

      ]

    };




    let arrGradeDetails = [];
    for (let elemAllocate of allocatedData) {

      let GodownName = elemAllocate.godown_name;

      let grade_details = elemAllocate.grade_details;
      if (grade_details.length > 0) {
        let tot_godown_inventory_import = 0;
        let tot_godown_inventory_local = 0;
        for (let elemgrd of grade_details) {

          if (elemgrd.allocated_inventory_import == 0 && elemgrd.allocated_inventory_local == 0) { } else {
            tot_godown_inventory_import = tot_godown_inventory_import + elemgrd.allocated_inventory_import;
            tot_godown_inventory_local = tot_godown_inventory_local + elemgrd.allocated_inventory_local;

            arrGradeDetails = [
              { text: GodownName, border: [true, true, true, true] },
              { text: elemgrd.grade_name, border: [true, true, true, true] }, { text: elemgrd.allocated_inventory_import.toFixed(3), alignment: 'right', border: [true, true, true, true] },
              { text: elemgrd.allocated_inventory_local.toFixed(3), alignment: 'right', border: [true, true, true, true] }
            ];

            let arr = docDefinition.content[0].table.body;
            arr.push(arrGradeDetails)
            docDefinition.content[0].table.body = arr;

          }


        }

        arrGradeDetails = [{
          width: '*',
          text: '',
          margin: [10, 5, 0, 0],
          bold: true,
          fillColor: 'lightgray',
          alignment: 'right'
        }, {
          width: '*',
          text: '',
          margin: [10, 5, 0, 0],
          bold: true,
          fillColor: 'lightgray',
          alignment: 'right'
        }, {
          width: '*',
          text: tot_godown_inventory_import.toFixed(3),
          margin: [10, 5, 0, 0],
          bold: true,
          fillColor: 'lightgray',
          alignment: 'right'
        }, {
          width: '*',
          text: tot_godown_inventory_local.toFixed(3),
          margin: [10, 5, 0, 0],
          bold: true,
          fillColor: 'lightgray',
          alignment: 'right'
        }];

        let arr = docDefinition.content[0].table.body;
        arr.push(arrGradeDetails);
        docDefinition.content[0].table.body = arr;

      }
    }

    //pdfMake.createPdf(docDefinition).open();
    return docDefinition;
  }

}
