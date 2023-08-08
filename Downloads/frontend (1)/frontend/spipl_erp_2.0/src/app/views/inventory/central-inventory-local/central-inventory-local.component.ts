import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { Table } from 'primeng/table';
import { UserDetails } from '../../login/UserDetails.model';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import { forexReports, inventoryRedis, LiveInventory } from '../../../shared/apis-path/apis-path';

@Component({
  selector: 'app-central-inventory-local',
  templateUrl: './central-inventory-local.component.html',
  styleUrls: ['./central-inventory-local.component.scss'],
  providers: [CrudServices, ToasterService, PermissionService, LoginService, ExportService]

})
export class CentralInventoryLocalComponent implements OnInit {


  @ViewChild("centralModel", { static: false }) public inventoryModal: ModalDirective;
  @ViewChild('myHoldModel', { static: false }) public myHoldModel: ModalDirective;
  @ViewChild('dt', { static: false }) table: Table;

  cols: any = [];
  isLoading: Boolean = false;
  data: any = [];


  _selectedColumns: any[];

  grades = [];
  lookup_grade = {};

  godowns = [];
  lookup_godowns = {};

  mainGrades = [];
  lookup_main_grade = {};


  links: string[] = [];
  user: UserDetails;

  tot_local_purchase_intransite_local = 0;
  tot_stock_tranfer_local = 0;
  tot_physical_stock_local = 0;
  tot_sales_pending_local = 0;
  tot_available_local = 0;
  tot_hold_local = 0;
  inventory_after_hold_local = 0;
  tot_unsold_local = 0;
  filteredValuess: any[];
  newData = [];
  hold_qty_input: any;
  main_godown_id_set: any;
  grade_id_set: any;
  cal_central_stock: any;
  arrival_date: any;
  bsValue: Date;

  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });

  add_opt: boolean = false;
  edit_opt: boolean = false;
  view_opt: boolean = false;
  del_opt: boolean = false;

  exportColumns: any[];
  export_list: any[];
  hold_column: any;

  constructor(private CrudServices: CrudServices, private toasterService: ToasterService,
    private permissionService: PermissionService, private loginService: LoginService,
    private exportService: ExportService) {

    this.cols = [

      { field: "godown_name", header: "Godown", permission: true, style: '100px' },
      { field: "main_grade_name", header: "Main Grade", permission: true, style: '100px' },
      { field: "grade_name", header: "Grade", permission: true, style: '100px' },
      { field: "local_purchase_local_intransite", header: "Local Intransite", permission: true, style: '100px' },
      { field: "stock_transfer_intransite_local", header: "Intransite Stock Transfer Local", permission: true, style: '100px' },
      { field: "inventory_local", header: "Physical Stock Local", permission: true, style: '100px' },
      { field: "total_unsold_local", header: "Total Unsold Local", permission: true, style: '100px' },
      { field: "sales_pending_local", header: "Sales Pending Local", permission: true, style: '100px' },
      { field: "available_local", header: "Available Stock Local", permission: true, style: '100px' },
      { field: "action", header: "Action", permission: true, style: '100px' },
      { field: "hold_qty_local", header: "Hold stock Local", permission: true, style: '100px' },
      { field: "stock_after_hold_local", header: "Inventory After Hold Local", permission: true, style: '100px' }

    ];
    this._selectedColumns = this.cols;

    this.loadData();
  }

  ngOnInit() {
    //15, 1  6,45  ,39,16
    // this.CrudServices.postRequest<any>(LiveInventory.getGodownWiseGradeImportLocal, {
    //   main_godown_id: 39,
    //   zone_id: 16
    // }).subscribe((response) => {
    //   console.log(response,"allocation")
    // })

    this.CrudServices.postRequest<any>(LiveInventory.getDispatchGrades, {
      main_grade_id: 6,
      godown_id: 39,
      import_local_flag: 2,
      company_id: 2,
    }).subscribe((response) => {
      console.log(response, "allocation")
    })

  }
  loadData() {

    this.arrival_date = this.bsValue;

    this.isLoading = true;
    this.data = [];
    this.CrudServices.postRequest<any>(LiveInventory.getcentrallivestockImportLocal, {
      arrival_date: this.arrival_date
    }).subscribe((response) => {
      console.log(response);
      this.isLoading = false;
      if (response.length > 0) {
        console.log(response, "response.data");
        this.data = response;

        this.tot_local_purchase_intransite_local = 0;
        this.tot_stock_tranfer_local = 0;
        this.tot_physical_stock_local = 0;
        this.tot_sales_pending_local = 0;
        this.tot_available_local = 0;
        this.tot_hold_local = 0;
        this.tot_unsold_local = 0;
        this.inventory_after_hold_local = 0;
        this.newData = [];
        for (let item, i = 0; item = this.data[i++];) {
          console.log(item, "stage 1")


          let godown_name = item.godown_name;
          let main_godown_id = item.main_godown_id;


          if (!(godown_name in this.lookup_godowns)) {
            this.lookup_godowns[godown_name] = 1;
            this.godowns.push({ 'godown_name': godown_name });
          }
          if (item.grade_details.length) {

            for (let sub_item, j = 0; sub_item = item.grade_details[j++];) {
              console.log(sub_item, "stage 2")

              let grade_name = sub_item.grade_master.grade_name;
              let grade_id = sub_item.grade_master.grade_id;

              if (item.arrival) {
                for (let arrival_item, k = 0; arrival_item = item.arrival[k++];) {
                  if (arrival_item.grade_id == grade_id) {
                    sub_item.arrival_grade = arrival_item.non_received_cntr;
                  }
                }

              }


              let main_grade_name = sub_item.grade_master.main_grade.name;

              sub_item.grade_name = grade_name;
              sub_item.main_grade_name = main_grade_name;
              sub_item.godown_name = godown_name;
              sub_item.main_godown_id = main_godown_id;
              sub_item.grade_id = grade_id;
              sub_item.stock_transfer_intransite_local_num = Number(sub_item.stock_transfer_intransite_local);
              sub_item.local_purchase_local_intransite = Number(sub_item.local_purchase_local_intransite);

              if (!(grade_name in this.lookup_grade)) {
                this.lookup_grade[grade_name] = 1;
                this.grades.push({ 'grade_name': grade_name });
              }

              if (!(main_grade_name in this.lookup_main_grade)) {
                this.lookup_main_grade[main_grade_name] = 1;
                this.mainGrades.push({ 'main_grade_name': main_grade_name });
              }



              this.tot_local_purchase_intransite_local = this.tot_local_purchase_intransite_local + Number(sub_item.local_purchase_local_intransite);

              this.tot_stock_tranfer_local = this.tot_stock_tranfer_local + Number(sub_item.stock_transfer_intransite_local);

              this.tot_physical_stock_local = this.tot_physical_stock_local + (sub_item.inventory_local);

              // sub_item.reg_intransite +
              this.tot_unsold_local = this.tot_unsold_local + (Number(sub_item.local_purchase_local_intransite) + Number(sub_item.stock_transfer_intransite_local) + sub_item.inventory_local);

              // sub_item.reg_intransite + 
              sub_item.total_unsold = (Number(sub_item.local_purchase_local_intransite) + Number(sub_item.stock_transfer_intransite_local) + sub_item.inventory_local);


              this.tot_sales_pending_local = this.tot_sales_pending_local + sub_item.sales_pending_local;

              // sub_item.reg_intransite +
              this.tot_available_local = this.tot_available_local + ((Number(sub_item.local_purchase_local_intransite) + Number(sub_item.stock_transfer_intransite_local) + sub_item.inventory_local) - (sub_item.sales_pending_local));

              //sub_item.reg_intransite + 
              sub_item.available_local = ((Number(sub_item.local_purchase_local_intransite) + Number(sub_item.stock_transfer_intransite_local) + sub_item.inventory_local) - (sub_item.sales_pending_local));

              this.tot_hold_local = this.tot_hold_local + Number(sub_item.hold_qty_local);

              //sub_item.reg_intransite +
              this.inventory_after_hold_local = this.inventory_after_hold_local + (((Number(sub_item.local_purchase_local_intransite) + Number(sub_item.stock_transfer_intransite_local) + sub_item.inventory_local) - (sub_item.sales_pending_local)) - Number(sub_item.hold_qty_local));

              //sub_item.reg_intransite + 
              sub_item.stock_after_hold_local = (((Number(sub_item.local_purchase_local_intransite) + Number(sub_item.stock_transfer_intransite_local) + sub_item.inventory_local) - (sub_item.sales_pending_local)) - Number(sub_item.hold_qty_local));



              this.newData.push(sub_item);
            }

          }
        }
        console.log(this.newData, "this.newData")



      }
    });
  }

  getColumnPresent(name) {
    if (this._selectedColumns.find(ob => ob['field'] === name)) {
      return true;
    } else {
      return false;
    }
  }

  OnCheckGodownAllocationLocal(checked, item) {
    console.log(checked, item);
    let is_allocate_local = 0;
    if (checked) {
      is_allocate_local = 1;
    }

    let allocate_condition = { is_allocate_local: is_allocate_local }
    this.CrudServices.postRequest<any>(LiveInventory.updateAllocationCheckImportLocal, {
      grade_id: item.grade_id,
      main_godown_id: item.main_godown_id,
      allocate_condition: allocate_condition
    }).subscribe((response) => {
      if (response.code == 100) {
        this.toasterService.pop(response.message, response.message, response.data);
        //this.loadData();
      } else {
        this.toasterService.pop(response.message, response.message, 'Something Went Wrong');
      }
    });

		this.CrudServices.postRequest<any>(inventoryRedis.updateAllocationCheckImportLocal, {
			grade_id: item.grade_id,
			main_godown_id: item.main_godown_id,
			allocate_condition: allocate_condition,
			field_name: "is_allocate_local"
		}).subscribe((response) => {
		});

  }

  holdQtyUpdate(main_godown_id, grade_id, hold_qty) {
    this.hold_column = hold_qty;
    this.main_godown_id_set = main_godown_id;
    this.grade_id_set = grade_id;
    this.CrudServices.postRequest<any>(forexReports.getHoldQty, {
      main_godown_id: main_godown_id,
      grade_id: grade_id
    }).subscribe((response) => {
      console.log(response, "Grade Wise Unsold");
      this.hold_qty_input = response[0].hold_qty_local;
      this.myHoldModel.show();
    });
  }


  submitHold() {

    let condition_hold_local = {
      hold_qty_local: Number(this.hold_qty_input)
    }
    this.CrudServices.postRequest<any>(forexReports.updateHoldQtyLocalImport, {
      main_godown_id: this.main_godown_id_set,
      grade_id: this.grade_id_set,
      hold_qty: condition_hold_local
    }).subscribe((response) => {
      if (response.code == 100) {
        this.toasterService.pop(response.message, response.message, response.data);
        console.log(response, "response")

        this.newData.map((element) => {
          console.log(this.main_godown_id_set, element.main_godown_id, this.grade_id_set, element.grade_id, "nnn");
          if (this.main_godown_id_set == element.main_godown_id && this.grade_id_set == element.grade_id) {
            element.hold_qty_local = this.hold_qty_input;
            console.log(element, "elemm")
          }
          return element;
        });

        //	this.table.reset();
        //  this.loadData();
      } else {
        this.toasterService.pop(response.message, response.message, 'Something Went Wrong');
      }
      this.myHoldModel.hide();
    });


    //For Redis Inventory
    this.CrudServices.postRequest<any>(inventoryRedis.addUpdateHoldLocal, {
      main_godown_id: this.main_godown_id_set,
      grade_id: this.grade_id_set,
      hold_qty: condition_hold_local
    }).subscribe((response) => {
    });

  }

  closeModal() {
    this.myHoldModel.hide();
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

  onFilter(event, dt) {

    console.log(event, "eventevent")
    this.filteredValuess = [];
    this.filteredValuess = event.filteredValue;

    if (this.filteredValuess) {
      this.tot_local_purchase_intransite_local = 0;
      this.tot_stock_tranfer_local = 0;
      this.tot_physical_stock_local = 0;
      this.tot_sales_pending_local = 0;
      this.tot_available_local = 0;
      this.tot_hold_local = 0;
      this.tot_unsold_local = 0;
      this.inventory_after_hold_local = 0;

      for (const val of this.filteredValuess) {

        this.tot_local_purchase_intransite_local = this.tot_local_purchase_intransite_local + Number(val.local_purchase_local_intransite);

        this.tot_stock_tranfer_local = this.tot_stock_tranfer_local + Number(val.stock_transfer_intransite_local);

        this.tot_physical_stock_local = this.tot_physical_stock_local + (val.inventory_local);

        //val.reg_intransite +
        this.tot_unsold_local = this.tot_unsold_local + (Number(val.local_purchase_local_intransite) + Number(val.stock_transfer_intransite_local) + val.inventory_local);
        this.tot_sales_pending_local = this.tot_sales_pending_local + val.sales_pending_local;
        //val.reg_intransite +
        this.tot_available_local = this.tot_available_local + ((Number(val.local_purchase_local_intransite) + Number(val.stock_transfer_intransite_local) + val.inventory_local) - (val.sales_pending_local));
        this.tot_hold_local = this.tot_hold_local + Number(val.hold_qty_local);
        //val.reg_intransite + 
        this.inventory_after_hold_local = this.inventory_after_hold_local + (((Number(val.local_purchase_local_intransite) + Number(val.stock_transfer_intransite_local) + val.inventory_local) - (val.sales_pending_local)) - val.hold_qty_local);


      }

    }


  }


  exportData() {
    this.export_list = [];
    let arr = [];
    const foot = {};
    if (this.filteredValuess === undefined) {
      arr = this.newData;
    } else {
      arr = this.filteredValuess;
    }

    for (let i = 0; i < arr.length; i++) {
      const exportList = {};
      for (let j = 0; j < this.cols.length; j++) {
        exportList[this.cols[j]['header']] = arr[i][this.cols[j]['field']];

      }
      this.export_list.push(exportList);
    }

    for (let j = 0; j < this._selectedColumns.length; j++) {


      if (this._selectedColumns[j]['field'] === 'local_purchase_local_intransite') {
        foot[this._selectedColumns[j]['header']] = this.tot_local_purchase_intransite_local;
      }
      else
        if (this._selectedColumns[j]['field'] === 'stock_transfer_intransite_local') {
          foot[this._selectedColumns[j]['header']] = this.tot_stock_tranfer_local;
        }
        else if (this._selectedColumns[j]['field'] === 'inventory_local') {
          foot[this._selectedColumns[j]['header']] = this.tot_physical_stock_local;
        }
        else if (this._selectedColumns[j]['field'] === 'total_unsold_local') {
          foot[this._selectedColumns[j]['header']] = this.tot_unsold_local;
        }

        else if (this._selectedColumns[j]['field'] === 'sales_pending_local') {
          foot[this._selectedColumns[j]['header']] = this.tot_sales_pending_local;
        }

        else if (this._selectedColumns[j]['field'] === 'available_local') {
          foot[this._selectedColumns[j]['header']] = this.tot_available_local;
        }

        else if (this._selectedColumns[j]['field'] === 'hold_qty_local') {
          foot[this._selectedColumns[j]['header']] = this.tot_hold_local;
        }

        else if (this._selectedColumns[j]['field'] === 'stock_after_hold_local') {
          foot[this._selectedColumns[j]['header']] = this.inventory_after_hold_local;
        }





    }


    this.export_list.push(foot);


  }

  exportExcel() {
    this.exportData();
    this.exportService.exportExcel(this.export_list, 'Central-Inventory-Local');
  }

}
