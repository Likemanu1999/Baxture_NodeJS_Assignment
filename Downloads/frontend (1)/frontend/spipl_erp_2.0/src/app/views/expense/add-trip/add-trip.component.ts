import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ToasterService, ToasterConfig } from 'angular2-toaster';

import { FormGroup, FormControl, Validators } from '@angular/forms';

import { Router, ActivatedRoute, Params } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { FileUpload, SubOrg, TripMaster } from '../../../shared/apis-path/apis-path';

@Component({
  selector: 'app-add-trip',
  templateUrl: './add-trip.component.html',
  styleUrls: ['./add-trip.component.css'],
  encapsulation : ViewEncapsulation.None,
  providers : [ ToasterService , CrudServices ]
})
export class AddTripComponent implements OnInit {
  card_title = 'Add New Trip';
  addTripForm: FormGroup;


  private toasterService: ToasterService;
  public toasterconfig: ToasterConfig =
  new ToasterConfig({
    tapToDismiss: true,
    timeout: 5000
  });

  sub_organisation: any[];
  filesToUpload: Array<File> = [];
  submitted: false;

  id: number;
  editMode = false;
  imageSrc: string;

  constructor(
    toasterService: ToasterService,
    private router: Router,
    private route: ActivatedRoute,
    private crudServices: CrudServices

  ) {
     this.toasterService = toasterService;
      this.addTripForm = new FormGroup({

      'trip_name': new FormControl(null, Validators.required),
      'agend_id': new FormControl(null, Validators.required),
      'description': new FormControl(null, Validators.required),
      'status': new FormControl(null, Validators.required),
      'credit_note': new FormControl(null)
    });

  }

  ngOnInit(): void {
      this.route.params.subscribe((params: Params) => {
        this.id = +params['id'];
        this.editMode = params['id'] != null;
      });
      this.crudServices.getAll<any>(SubOrg.get_sub_org).subscribe((response) => {
        this.sub_organisation = response;
      });

    this.initForm();
  }

  initForm() {
    if (this.editMode) {
      this.card_title = 'Update Trip';

      this.crudServices.getOne<any>(TripMaster.getOne , {id : this.id}).subscribe((response) => {

        this.imageSrc = response[0]['credit_note'];
        const responseArr = response[0];
        this.addTripForm.patchValue({
          trip_name: responseArr['trip_name'],
          agend_id: responseArr['agend_id'],
          status: responseArr['status'],
          description: responseArr['description'],
        });
      });
    }
  }

  fileChangeEvent(fileInput: any) {
    this.filesToUpload = <Array<File>>fileInput.target.files;
  }

  onReset() {
    this.submitted = false;
    this.addTripForm.reset();
  }

  onBack() {
    this.router.navigate(['expense/trip-list']);
  }

  onSubmit() {
    const invalid = [];
    const controls = this.addTripForm.controls;
    for (const name in controls) {
        if (controls[name].invalid) {
            invalid.push(name);
        }
    }
    let data = {
      trip_name: this.addTripForm.value.trip_name ,
      agend_id: this.addTripForm.value.agend_id ,
      status: this.addTripForm.value.status ,
      description: this.addTripForm.value.description

    }

    const fileData: any = new FormData();


      const files: Array<File> = this.filesToUpload;
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          fileData.append('trip_master_credit_note', files[i], files[i]['name']);
        }
      }

      this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {

        let fileDealDocs = [];
        let filesList = res.uploads.trip_master_credit_note;

        if (res.uploads.trip_master_credit_note) {
          for (let i = 0; i < filesList.length; i++) {
            fileDealDocs.push(filesList[i].location);
          }
          data['credit_note'] = JSON.stringify(fileDealDocs);
        }


        this.saveData(data);


      })




  }

  saveData(formData) {
    if (this.editMode) {
      formData['id'] = this.id;
      this.crudServices.updateData<any>(TripMaster.update , formData).subscribe((response) => {
         this.toasterService.pop(response.message, response.message, response.data);
         if (response.code === '100') {
           this.onBack();
         }
       });
    } else {
        this.crudServices.addData<any>(TripMaster.add , formData).subscribe((response) => {
          this.toasterService.pop(response.message, response.message, response.data);
          if (response.code === '100') {
          this.onBack();
        }
        });
    }

  }

}
