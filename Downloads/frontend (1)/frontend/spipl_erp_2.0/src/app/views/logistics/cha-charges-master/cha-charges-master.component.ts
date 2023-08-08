import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { UserDetails } from '../../login/UserDetails.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { chacharges, GodownMaster, PortMaster, SubOrg } from '../../../shared/apis-path/apis-path';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-cha-charges-master',
  templateUrl: './cha-charges-master.component.html',
  styleUrls: ['./cha-charges-master.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    ToasterService,
    PermissionService,
    LoginService,
    DatePipe,
    CrudServices
  ]
})
export class ChaChargesMasterComponent implements OnInit {
  @ViewChild('dt', { static: false }) table: Table;
  addForm: FormGroup;
  agents = [];
  ratetype = [];
  statusType = [];
  ports = [];

  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });
  containers: { id: number; name: string; }[];
  cols: { field: string; header: string; }[];
  chargesList: any;
  isLoading: boolean;

  public popoverTitle: string = 'Warning';
  public popoverMessage: string = 'Are you sure, you want to Delete?';
  public confirmClicked: boolean = false;
  public cancelClicked: boolean = false;
  public confirmText: string = 'Yes';
  public cancelText: string = 'No';
  public placement: string = 'left';
  public closeOnOutsideClick: boolean = true;
  id: any;
  formEnable: boolean;
  lookup_port = {};
  portlist = [];
  lookup_cha = {};
  cha = [];
  lookup_type = {};
  lookup_rate_type = {};
  type = [];
  rate_type = [];
  lookup_container_type = {};
  container_type = [];
  charges_head: { id: number; name: string; }[];
  bond: boolean;
  transporter: boolean;


  constructor(
    private toasterService: ToasterService,
    private permissionService: PermissionService,
    private loginService: LoginService,
    public datepipe: DatePipe, private crudServices: CrudServices) {


    // this.crudServices.getAll<any>(chacharges.getchaRateType).subscribe(response => {
    //   this.ratetype = response;
    // })

    this.crudServices.getAll<any>(chacharges.getShipmentStatus).subscribe(response => {
      this.statusType = response;
    })

    this.crudServices.getAll<any>(PortMaster.getAll).subscribe(response => {
      this.ports = response;
    })

    this.containers = [{ id: 1, name: "20FT" }, { id: 2, name: "40FT" }];
    this.charges_head = [{ id: 1, name: "CHA" }, { id: 2, name: "Bond" }, { id: 3, name: "CFS" }, { id: 4, name: "Terminal" }, { id: 5, name: "Transporter" }]

    this.addForm = new FormGroup({
      'port_id': new FormControl(null, Validators.required),
      'charges_head_id': new FormControl(null, Validators.required),
      'shipping_agent_id': new FormControl(null),
      'bond_godown_id': new FormControl(null),
      'container_type': new FormControl(null, Validators.required),
      'from_date': new FormControl(null, Validators.required),
      'to_date': new FormControl(null, Validators.required),
      'rate': new FormControl(null, Validators.required),
      'bond_insurance_percent': new FormControl(null),
      'cgst_transporter': new FormControl(null),
      'sgst_transporter': new FormControl(null),
      //'rate_type': new FormControl(null, Validators.required),
    })


    this.cols = [
      { field: 'from_date', header: 'From Date' },
      { field: 'to_date', header: 'To Date' },
      { field: 'port_master.port_name', header: 'Port' },
      { field: 'charges_head_id', header: 'Charges Head' },
      { field: 'sub_org_master.sub_org_name', header: 'Agent Name' },
      { field: 'godown_name', header: 'Bond Godown' },
      { field: 'container_type', header: 'Container Type' },
      { field: 'rate', header: 'Rate' },

    ];
  }

  ngOnInit() {
    this.getData();

  }

  onSubmit() {


    let data = {
      port_id: this.addForm.value.port_id,
      shipping_agent_id: this.addForm.value.shipping_agent_id,
      container_type: this.addForm.value.container_type,
      from_date: this.datepipe.transform(this.addForm.value.from_date, 'yyyy-MM-dd'),
      to_date: this.datepipe.transform(this.addForm.value.to_date, 'yyyy-MM-dd'),
      rate: this.addForm.value.rate,
      sgst_transporter: this.addForm.value.sgst_transporter,
      cgst_transporter: this.addForm.value.cgst_transporter,
      charges_head_id: this.addForm.value.charges_head_id,
      bond_insurance_percent: this.addForm.value.bond_insurance_percent,
      bond_godown_id: this.addForm.value.bond_godown_id,
    }


    if (this.id != null && this.id) {
      data['id'] = this.id;
      this.crudServices.updateData<any>(chacharges.updateData, data).subscribe(response => {

        if (response.code == 100) {
          this.toasterService.pop(response.message, response.message, response.data);
          this.resetData();
        } else {
          this.toasterService.pop(response.message, response.message, 'something went wrong !!!');
        }
      })
    } else {
      this.crudServices.addData<any>(chacharges.add, data).subscribe(response => {

        if (response.code == 100) {
          this.toasterService.pop(response.message, response.message, response.data);
          this.resetData();
        } else {
          this.toasterService.pop(response.message, response.message, 'something went wrong !!!');
        }
      })
    }

  }

  resetData() {
    this.addForm.reset();
    this.id = 0;
    this.formEnable = false;
    this.getData();
  }

  getData() {
    this.isLoading = true;
    this.chargesList = [];
    this.crudServices.getAll<any>(chacharges.getData).subscribe(response => {
      this.isLoading = false;
      console.log(response);
      let newArr = [];


      for (let val of response) {
        val.port_name = val.port_master.port_name;
        if (val.sub_org_master) {
          val.sub_org_name = val.sub_org_master.sub_org_name;
        }

        if (val.godown) {
          val.godown_name = val.godown.godown_name;
        }




        newArr.push(val);

        if (!(val.port_name in this.lookup_port)) {
          this.lookup_port[val.port_name] = 1;
          this.portlist.push({ 'port_name': val.port_name });
        }

        if (!(val.sub_org_name in this.lookup_cha)) {
          this.lookup_cha[val.sub_org_name] = 1;
          this.cha.push({ 'sub_org_name': val.sub_org_name });
        }

        // if (!(val.godown_name in this.lookup_cha)) {
        //   this.lookup_cha[val.godown_name] = 1;
        //   this.cha.push({ 'godown_name': val.godown_name });
        // }



        if (!(val.container_type in this.lookup_container_type)) {
          this.lookup_container_type[val.container_type] = 1;
          this.container_type.push({ 'container_type': val.container_type });
        }

      }

      // console.log(this.chargesList);


      this.chargesList = newArr;
    })
  }

  getAgent(event, type) {
    let id = 0;
    this.transporter=false;
    this.addForm.patchValue({ shipping_agent_id: null, bond_godown_id: null })
    if (event) {
      id = event.id
    } else if (type) {
      id = type;
    }
    if (id) {
      this.bond = false;
      if (id == 1) {

        this.crudServices.getOne<any>(SubOrg.getSubOrgByCategory, { category_id: 16 }).subscribe(response => {
          this.agents = response.map((i) => { i.sub_org_name = i.sub_org_name + ' (' + i.org_address + ' )'; return i; });
        })

      } else if (id == 2) {
        this.bond = true;
        this.crudServices.getAll<any>(GodownMaster.getAll).subscribe(response => {
          this.agents = response.filter(data => data.head_godown == 2);
        })
      } else if (id == 3) {
        this.crudServices.getOne<any>(SubOrg.getSubOrgByCategory, { category_id: 110 }).subscribe(response => {
          this.agents = response.map((i) => { i.sub_org_name = i.sub_org_name + ' (' + i.org_address + ' )'; return i; });
        })

      } else if (id == 4) {
        this.crudServices.getOne<any>(SubOrg.getSubOrgByCategory, { category_id: 97 }).subscribe(response => {
          
          this.agents = response.map((i) => { i.sub_org_name = i.sub_org_name + ' (' + i.org_address + ' )'; return i; });

        })

      } else if (id == 5) {

        this.transporter = true;


        this.crudServices.getOne<any>(SubOrg.getSubOrgByCategory, { category_id: 111 }).subscribe(response => {
          this.agents = response.map((i) => { i.sub_org_name = i.sub_org_name + ' (' + i.org_address + ' )'; return i; });

        })
      }

    }

  }

  getContainer(val) {
    switch (val) {
      case 1: return '20 FT';
        break;
      case 2: return '40 FT';
        break;
    }
  }

  edit(item) {
    this.id = item.id;
    this.formEnable = true;
    this.getAgent(0, item.charges_head_id);


    let object = {};
    for (let key in item) {


      object[key] = item[key]

      if (key == 'from_date') {

        let date = item[key];
        object[key] = item[key] ? new Date(date) : null;

      }
      if (key == 'to_date') {
        let date = item[key];
        object[key] = item[key] ? new Date(date) : null;

      }


    }
    this.addForm.patchValue(object);
  }

  delete(id) {
    if (id) {
      this.crudServices.deleteData<any>(chacharges.deleteData, { id: id }).subscribe(response => {
        this.toasterService.pop(response.message, response.message, response.data);
        this.getData();
      })
    }
  }

  formShow() {
    this.formEnable = true;
  }

  copy(item) {


    let data = {
      port_id: item.port_id,
      shipping_agent_id: item.shipping_agent_id,
      container_type: item.container_type,
      from_date: this.datepipe.transform(item.from_date, 'yyyy-MM-dd'),
      to_date: this.datepipe.transform(item.to_date, 'yyyy-MM-dd'),
      rate: item.rate,
      sgst_transporter: item.sgst_transporter,
      cgst_transporter: item.cgst_transporter,
      charges_head_id: item.charges_head_id,
      bond_insurance_percent: item.bond_insurance_percent,
      bond_godown_id: item.bond_godown_id,
    }
    this.crudServices.addData<any>(chacharges.add, data).subscribe(response => {

      if (response.code == 100) {
        this.toasterService.pop(response.message, response.message, response.data);
        this.resetData();
      } else {
        this.toasterService.pop(response.message, response.message, 'something went wrong !!!');
      }
    })
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

  // date filter
  onDateSelect($event, name) {
    this.table.filter(this.datepipe.transform($event), name, 'equals');
  }

  getHeadName(val) {
   
    switch (val) {
      case 1: return 'CHA'
        break;
      case 2: return 'Bond'
        break;
      case 3: return 'CFS'
        break;

      case 4: return 'Terminal'
        break;
      case 5: return 'Transporter'
        break;

      default:
        break;
    }
  }

}
