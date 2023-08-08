import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { ToasterConfig, ToasterService } from 'angular2-toaster/angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { GodownMaster, LiveInventory, StaffMemberMaster } from '../../../shared/apis-path/apis-path';
import { staticValues } from '../../../shared/common-service/common-service';

@Component({
  selector: 'app-godown-staff-link',
  templateUrl: './godown-staff-link.component.html',
  styleUrls: ['./godown-staff-link.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ToasterService, PermissionService, CrudServices],
})
export class GodownStaffLinkComponent implements OnInit {

  @ViewChild('myModal', { static: false }) public myModal: ModalDirective;
  godownEmpForm: FormGroup;



  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });
  isLoading = false;
  error: any;

  public popoverTitle: string = 'Warning';
  public popoverMessage: string = 'Are you sure, you want to delete?';
  public confirmClicked: boolean = false;
  public cancelClicked: boolean = false;
  public confirmText: string = 'Yes';
  public cancelText: string = 'No';
  public placement: string = 'left';
  public closeOnOutsideClick: boolean = true;
  public filterQuery = '';

  godown_arr = [];
  emp_arr = [];
  data = [];
  all_allocate_arr = staticValues.all_or_allocate;
  zone_godown_arr = staticValues.zone_goodwn;

  constructor(private toasterService: ToasterService,
    private CrudServices: CrudServices,
    private permissionService: PermissionService) {

    this.godownEmpForm = new FormGroup({
      'godown_id': new FormControl(null, Validators.required),
      'emp_id': new FormControl(null, Validators.required),
      'show_all': new FormControl(null, Validators.required),
      'zone_godown': new FormControl(null, Validators.required),
    });

  }

  ngOnInit() {

    this.CrudServices.getAll<any>(GodownMaster.getAllHeadGodown).subscribe((response) => {
      this.godown_arr = response;
    });

    this.CrudServices.getAll<any>(StaffMemberMaster.getAllStaffMembers).subscribe((response) => {
      this.emp_arr = response.data;
    });

    this.getData();


  }


  getData() {
    this.CrudServices.getAll<any>(LiveInventory.getGodownStaff).subscribe((response) => {
      this.data = response;

      for (let elem of this.data) {
        elem.godown_name = elem.godown.godown_name;
        elem.employee_name = elem.staff_member_master.first_name + ' ' + elem.staff_member_master.last_name;

        elem.show_all_label = this.get_all_allocate(elem.show_all);
        elem.godown_marketing_person = this.get_godown_marketing(elem.zone_godown);
      }
    });
  };

  get_all_allocate(show_all) {
    if (show_all == 1) {
      return 'All Godown';
    } else {
      return 'Allocated Godown';
    }
  }

  get_godown_marketing(zone_godown) {
    if (zone_godown == 1) {
      return 'Godown Incharge';
    } else {
      return 'Marketing Person';
    }
  }

  onSubmit() {
    //this.submitted = true;
    if (this.godownEmpForm.invalid) {
      return;
    } else {
      let body = {
        godown_id: this.godownEmpForm.value.godown_id,
        emp_id: this.godownEmpForm.value.emp_id,
        show_all: this.godownEmpForm.value.show_all,
        zone_godown: this.godownEmpForm.value.zone_godown
      }
      this.CrudServices.addData<any>(LiveInventory.addGodownStaff, body).subscribe((response) => {
        this.onReset();
        this.getData();
        this.toasterService.pop(response.message, response.message, response.data);
      });
    }
  }

  onReset() {
    // this.submitted = false;
    this.godownEmpForm.reset();
  }

  onDelete(id) {
    this.CrudServices.postRequest<any>(LiveInventory.deleteGodownStaff, { id: id }).subscribe((response) => {
      this.onReset();
      this.getData();
      this.toasterService.pop(response.message, response.message, response.data);
    });
  }

}
