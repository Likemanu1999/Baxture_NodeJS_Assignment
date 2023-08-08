import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { FileUpload, ssurishaTDSChargesForm, tdsChargesForm } from '../../../shared/apis-path/apis-path';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-add-form-spipl-ssurisha',
  templateUrl: './add-form-spipl-ssurisha.component.html',
  styleUrls: ['./add-form-spipl-ssurisha.component.css'],
  providers: [CrudServices, ToasterService]
})
export class AddFormSpiplSsurishaComponent implements OnInit {

  addformspiplssurisha: FormGroup;
  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });

  declrForm: Array<File> = [];
  id: number;
  defaultDate: any;

  showTan: any;
  PreviousofPreviousFinacialYear: any;
  PreviousFinacialYear: any;
  constructor(private CrudServices: CrudServices, private toasterService: ToasterService, private route: ActivatedRoute,) {
    this.addformspiplssurisha = new FormGroup({

      'org_name': new FormControl(null),
      'gst_no': new FormControl(null, [
        Validators.required,
        Validators.pattern("^[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}[0-9A-Za-z]{3}$"),
      ]),
      'vendor_customer': new FormControl(null, Validators.required),
      'spipl_ssurisha': new FormControl(null, Validators.required),
      'pan_number': new FormControl(null),
      'turnover_20_21_status': new FormControl(null, Validators.required),
      // 'roi_18_19_status': new FormControl(null, Validators.required),
      'roi_19_20_status': new FormControl(null),
      'tds_declation_form': new FormControl(null),
      'incorporation_date': new FormControl(null, Validators.required),
      'tan_no': new FormControl(null),

    });
    this.defaultDate = '2017-04-01';

    let PreviousOfPreviousYear = ((new Date()).getFullYear() - 2);
    let PreviousYear = ((new Date()).getFullYear() - 1);
    let CurrentYear = (new Date()).getFullYear();
    // this.PreviousofPreviousFinacialYear = `${PreviousOfPreviousYear}-${PreviousYear}`;
    //this.CurrentYear = `${PreviousYear}-${CurrentYear}`;
    // this.PreviousFinacialYear = `${PreviousOfPreviousYear}-${PreviousYear}`;
    // this.PreviousofPreviousFinacialYear = `${(PreviousOfPreviousYear - 1)}-${(PreviousYear - 1)}`;

    let currentFinacialYearDStartDate = '';
    let currentFinacialYearEndDate = '';

    if (((new Date()).getMonth() + 1) > 3) {

      currentFinacialYearDStartDate = `${(CurrentYear - 1)}-04-01`;
      currentFinacialYearEndDate = `${((CurrentYear) + 1)}-03-31`;

    } else {
      currentFinacialYearDStartDate = `${CurrentYear}-04-01`;
      currentFinacialYearEndDate = `${(CurrentYear + 1)}-03-31`;
    }






    // let PreviousFinacialYearDStartDate = `${PreviousYear}'-04-01'`;
    // let PreviousFinacialYearEndDate = `${(PreviousYear + 1)}'-03-31'`;

    // let PreviousofPreviousFinacialYearDStartDate = `${PreviousOfPreviousYear}'-04-01'`;
    // let PreviousofPreviousFinacialYearEndDate = `${(PreviousOfPreviousYear + 1)}'-03-31'`;
    let TodaysDate = ((new Date()).toISOString()).substring(0, 10);

    if (TodaysDate >= currentFinacialYearDStartDate && TodaysDate <= currentFinacialYearEndDate) {
      this.PreviousFinacialYear = `${PreviousYear}-${CurrentYear}`;
      this.PreviousofPreviousFinacialYear = `${PreviousOfPreviousYear}-${PreviousYear}`;

    } else {
      this.PreviousFinacialYear = `${(PreviousYear - 1)}-${(CurrentYear - 1)}`;
      this.PreviousofPreviousFinacialYear = `${(PreviousOfPreviousYear - 1)}-${(PreviousYear - 1)}`;

    }



  }

  ngOnInit() {

  }

  get f() {
    return this.addformspiplssurisha.controls;
  }

  declaration(event: any) {
    this.declrForm = <Array<File>>event.target.files;
  }

  onSubmit() {
    if (!this.addformspiplssurisha.invalid) {
      let spipl_ssurisha = this.addformspiplssurisha.value.spipl_ssurisha;

      let formData = {

        org_name: this.addformspiplssurisha.value.org_name,
        gst_no: this.addformspiplssurisha.value.gst_no,
        vendor_customer: this.addformspiplssurisha.value.vendor_customer,
        pan_number: this.addformspiplssurisha.value.pan_number,
        turnover_20_21_status: this.addformspiplssurisha.value.turnover_20_21_status,
        //  roi_18_19_status: this.addformspiplssurisha.value.roi_18_19_status,
        roi_19_20_status: this.addformspiplssurisha.value.roi_19_20_status,
        incorporation_date: this.addformspiplssurisha.value.incorporation_date,
        tan_no: this.addformspiplssurisha.value.tan_no,

      };

      const fileData = new FormData();
      const declaration_from: Array<File> = this.declrForm;

      if (declaration_from.length > 0) {
        for (let i = 0; i < declaration_from.length; i++) {
          fileData.append('tds_declation_form', declaration_from[i], declaration_from[i]["name"]);
        }

        this.CrudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
          let tds_declare = [];
          let tds_declareList = res.uploads.tds_declation_form;
          if (tds_declareList != null) {
            if (tds_declareList.length > 0) {
              for (let i = 0; i < tds_declareList.length; i++) {
                tds_declare.push(tds_declareList[i].location);
              }
              formData['tds_declation_form'] = JSON.stringify(tds_declare);
            }
          }


          this.saveData(formData, spipl_ssurisha);
        });

      } else {

        if (spipl_ssurisha == 'spipl') {
          this.CrudServices.postRequest<any>(tdsChargesForm.add, {
            data: formData
          }).subscribe((response) => {
            this.toasterService.pop(response.message, response.message, response.data);
            this.onReset();
          });
        } else if (spipl_ssurisha == 'ssurisha') {
          this.CrudServices.postRequest<any>(ssurishaTDSChargesForm.add, {
            data: formData
          }).subscribe((response) => {
            this.toasterService.pop(response.message, response.message, response.data);
            this.onReset();
          });

        }


      }
    }

  }


  saveData(formData, spipl_ssurisha) {

    if (spipl_ssurisha == 'spipl') {

      this.CrudServices.postRequest<any>(tdsChargesForm.add, {
        data: formData
      }).subscribe((response) => {
        this.toasterService.pop(response.message, response.message, response.data);
        this.onReset();
      });

    } else if (spipl_ssurisha == 'ssurisha') {
      this.CrudServices.postRequest<any>(ssurishaTDSChargesForm.add, {
        data: formData
      }).subscribe((response) => {
        this.toasterService.pop(response.message, response.message, response.data);
        this.onReset();
      });

    }


  }

  onReset() {
    this.addformspiplssurisha.reset();
  }

  CheckTurnOver($event) {
    if ($event.target.value == 'yes') {
      this.showTan = true;
    } else if ($event.target.value == 'no') {
      this.showTan = false;
    } else {
      this.showTan = false;
    }
  }

}
