import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ilcCharges, SpiplBankMaster } from '../../../../shared/apis-path/apis-path';
import { CrudServices } from '../../../../shared/crud-services/crud-services';

@Component({
  selector: 'app-add-edit-ilc-charges',
  templateUrl: './add-edit-ilc-charges.component.html',
  styleUrls: ['./add-edit-ilc-charges.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    ToasterService,
    CrudServices,
  ],
})
export class AddEditIlcChargesComponent implements OnInit {
  mode: string = "Add";
  box_title: string = "ILC Bank Charges";
  isLoading: boolean = false;
  editmode: boolean = false;
  ilcChargesForm: FormGroup;
  spipl_bank: any;
  public toasterconfig: ToasterConfig = new ToasterConfig({
    tapToDismiss: true,
    timeout: 5000,
  });

  ilc_charges_id: any;
  public today = new Date();

  constructor(private route: ActivatedRoute,
    private router: Router,
    private toasterService: ToasterService,
    private CrudServices: CrudServices) {
    this.ilcChargesForm = new FormGroup({

      bank_id: new FormControl(null, Validators.required),
      from_date: new FormControl(null, Validators.required),
      to_date: new FormControl(null),
      ilc_open_per_annum: new FormControl(null),
      ilc_bank_charges: new FormControl(null),
      ilc_ammend_clause: new FormControl(null),
      ilc_remittance: new FormControl(null),
      ilc_remittance_min: new FormControl(null),
      ilc_remittance_max: new FormControl(null),
      ilc_bill_acceptance: new FormControl(null),
      ilc_biil_accepatnce_min: new FormControl(null),
      ilc_biil_accepatnce_max: new FormControl(null),
      ilc_discrepancy: new FormControl(null),
      ilc_discrepancy_min: new FormControl(null),
      ilc_discrepancy_max: new FormControl(null),
      ilc_open_sfms: new FormControl(null),
      ilc_ammend_sfms: new FormControl(null),
      ilc_remittance_sfms: new FormControl(null),
      ilc_discounting: new FormControl(null)


    });


    this.route.params.subscribe((params: Params) => {
      if (params.ilc_charges_id !== undefined) {
        this.editmode = true;
        this.mode = "Edit";
        this.ilc_charges_id = params.ilc_charges_id;
        this.getilcData();
      } else {
        this.editmode = false;
        this.mode = "Add";
      }
    });

    this.CrudServices.getOne<any>(SpiplBankMaster.bankType, { bank_type: 1 }).subscribe((response) => {
      this.spipl_bank = response;
    });

  }

  ngOnInit() {
  }
  getilcData() {
    this.CrudServices.getOne(ilcCharges.getOne, {
      id: this.ilc_charges_id,
    }).subscribe(response => {

      this.ilcChargesForm.patchValue({

        bank_id: response[0].bank_id,
        from_date: response[0].from_date,
        to_date: response[0].to_date,
        ilc_open_per_annum: response[0].ilc_open_per_annum,
        ilc_bank_charges: response[0].ilc_bank_charges,
        ilc_ammend_clause: response[0].ilc_ammend_clause,
        ilc_remittance: response[0].ilc_remittance,
        ilc_remittance_min: response[0].ilc_remittance_min,
        ilc_remittance_max: response[0].ilc_remittance_max,
        ilc_bill_acceptance: response[0].ilc_bill_acceptance,
        ilc_biil_accepatnce_min: response[0].ilc_biil_accepatnce_min,
        ilc_biil_accepatnce_max: response[0].ilc_biil_accepatnce_max,
        ilc_discrepancy: response[0].ilc_discrepancy,
        ilc_discrepancy_min: response[0].ilc_discrepancy_min,
        ilc_discrepancy_max: response[0].ilc_discrepancy_max,
        ilc_open_sfms: response[0].ilc_open_sfms,
        ilc_ammend_sfms: response[0].ilc_ammend_sfms,
        ilc_remittance_sfms: response[0].ilc_remittance_sfms,
        ilc_discounting: response[0].ilc_discounting
      });
    });
  }


  onSubmit() {
    if (!this.ilcChargesForm.invalid) {

      const formData = {
        bank_id: this.ilcChargesForm.value.bank_id,
        from_date: this.ilcChargesForm.value.from_date,
        to_date: this.ilcChargesForm.value.to_date,
        ilc_open_per_annum: this.ilcChargesForm.value.ilc_open_per_annum,
        ilc_bank_charges: this.ilcChargesForm.value.ilc_bank_charges,
        ilc_ammend_clause: this.ilcChargesForm.value.ilc_ammend_clause,
        ilc_remittance: this.ilcChargesForm.value.ilc_remittance,
        ilc_remittance_min: this.ilcChargesForm.value.ilc_remittance_min,
        ilc_remittance_max: this.ilcChargesForm.value.ilc_remittance_max,
        ilc_bill_acceptance: this.ilcChargesForm.value.ilc_bill_acceptance,
        ilc_biil_accepatnce_min: this.ilcChargesForm.value.ilc_biil_accepatnce_min,
        ilc_biil_accepatnce_max: this.ilcChargesForm.value.ilc_biil_accepatnce_max,
        ilc_discrepancy: this.ilcChargesForm.value.ilc_discrepancy,
        ilc_discrepancy_min: this.ilcChargesForm.value.ilc_discrepancy_min,
        ilc_discrepancy_max: this.ilcChargesForm.value.ilc_discrepancy_max,
        ilc_open_sfms: this.ilcChargesForm.value.ilc_open_sfms,
        ilc_ammend_sfms: this.ilcChargesForm.value.ilc_ammend_sfms,
        ilc_remittance_sfms: this.ilcChargesForm.value.ilc_remittance_sfms,
        ilc_discounting: this.ilcChargesForm.value.ilc_discounting


      };

      let body = {
        ilcChargesData: formData
      }
      if (this.editmode) {
        body["id"] = this.ilc_charges_id;
        this.CrudServices.updateData<any>(ilcCharges.update, body).subscribe(response => {
          this.toasterService.pop(response['message'], "Success", response['data']);
          if (response.code === "100") {

            this.onBack();
          }
        });
      } else {
        this.CrudServices.addData<any>(ilcCharges.add, body).subscribe(response => {
          if (response.code === "100") {
            this.toasterService.pop(response.message, response.message, response.data);

            this.onBack();
          } else if (response.code === "101") {
            this.toasterService.pop(response.message, response.message, "Something Went Wrong");
          }
        }
        );
      }


    }
  }


  onBack() {

    this.router.navigate(["/masters/ilc-charges"]);
  }

}
