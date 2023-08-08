import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '../common-service/common-service';
import { TokenInterceptorService } from '../interceptors/token-interceptor-service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  providers: [
    CommonService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true
    }
    ],
})
export class SettingsComponent implements OnInit {
  @Input() key: string;
  dynamicForm: FormGroup;
  submitted = false;
  resultValues: any;
  dataKeys: any;
  postData: any;
  constructor(private commonService: CommonService, private formBuilder: FormBuilder) {
    this.dynamicForm = this.formBuilder.group({
      tickets: new FormArray([])
    });
   }

  ngOnInit() {
    this.commonService.getFromKey(this.key).subscribe((response) => {
      this.resultValues = response;
      this.dataKeys = Object.keys(response);
      for (let i = 0; i < this.dataKeys.length; i++) {
        this.t.push(
          this.formBuilder.group({
            name: [this.resultValues[this.dataKeys[i]], Validators.required]
          })
        );
      }
    });
  }
  get f() {
    return this.dynamicForm.controls;
  }
  get t() {
    return this.f.tickets as FormArray;
  }

  onSubmit() {
    this.submitted = true;
    if (this.dynamicForm.invalid) {
      return;
    }
   // const dataKeys = Object.keys(this.resultValues);
    const formJosn = this.dynamicForm.value;
    for (let i = 0; i < this.dataKeys.length; i++) {
      if (this.dataKeys[i] !== undefined) {
      const newkey = this.dataKeys[i];
      const newvalue = formJosn.tickets[i].name;
      this.resultValues[newkey] = newvalue;
      }
    }

    // display form values on success
    alert(
      'SUCCESS!! :-)\n\n' + JSON.stringify(this.dynamicForm.value, null, 4)
    );
  }
  onReset() {
    // reset whole form back to initial state
    this.submitted = false;
    this.dynamicForm.reset();
    this.t.clear();
  }

  onClear() {
    // clear errors and reset ticket fields
    this.submitted = false;
    this.t.reset();
  }
}
