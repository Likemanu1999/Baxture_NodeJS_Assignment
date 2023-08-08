import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { LoginService } from '../../login/login.service';
import { UserDetails } from '../../login/UserDetails.model';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { ExpenseCategoryMaster, ExpenseMaster, FileUpload, StaffMemberMaster, SubOrg, TripMaster } from '../../../shared/apis-path/apis-path';

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.css'],
  providers: [ToasterService, CrudServices],
  encapsulation: ViewEncapsulation.None
})
export class AddExpenseComponent implements OnInit {
  card_title = 'Add New Expense';
  addExpenseForm: FormGroup;

  user: UserDetails;
  links: string[] = [];
  bsValue: Date = new Date();
  dateInputFormat = 'Y-m-d';
  filesToUpload: Array<File> = [];
  category: any[];
  sub_organisation: any[];
  empData: any[];
  tripData: any[];
  submitted: false;
  id: number;
  editMode = false;
  imageSrc: string;
  fileData: FormData = new FormData();

  private toasterService: ToasterService;
  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });

  public selectedEmp: Array<number> = [];
  expense_list_all: boolean = false;
  companyList: { id: number; value: string; }[];
  importLocalList: { id: number; value: string; }[];
  company_id: any;

  constructor(

    toasterService: ToasterService,
    private route: ActivatedRoute,
    private router: Router,
    private loginService: LoginService,
    private crudServices: CrudServices,
  ) {
    this.user = this.loginService.getUserDetails();
    this.links = this.user.links;
    this.expense_list_all = (this.links.indexOf('All Expense List') > -1);
    this.company_id = this.user.userDet[0].company_id;
    this.toasterService = toasterService;
    this.addExpenseForm = new FormGroup({
      'expense_date': new FormControl(this.bsValue, Validators.required),
      'category_id': new FormControl(null, Validators.required),
      'company_id': new FormControl(null),
      'amount': new FormControl(null, Validators.required),
      'service_provider': new FormControl(null),
      'description': new FormControl(null,Validators.required),
      'expense_copy': new FormControl(null),
      'emp_id': new FormControl(null),
      'trip_id': new FormControl(null),
      'status': new FormControl(0),
      'division_type': new FormControl(this.company_id,Validators.required),
      'import_local_flag': new FormControl(3),
      'invoice_no':new FormControl(null, Validators.required)
    });
  }

  ngOnInit(): void {

    this.route.params.subscribe((params: Params) => {
      this.id = +params['id'];
      this.editMode = params['id'] != null;
    });


    this.crudServices.getAll<any>(ExpenseCategoryMaster.getAll).subscribe((response) => {
      this.category = response.data;

    });

    this.crudServices.getAll<any>(SubOrg.get_sub_org).subscribe((response) => {
      this.sub_organisation = response;
    });

    this.crudServices.getAll<any>(StaffMemberMaster.getAll).subscribe((response) => {
      this.empData = response.data;
    });

    this.crudServices.getAll<any>(TripMaster.getAll).subscribe((response) => {
      this.tripData = response.data;

    });

    this.companyList = [{ id: 1, value: 'PVC' }, { id: 2, value: 'PE & PP' }, { id: 3, value: 'SURISHA'}];
    this.importLocalList = [{ id: 1, value: 'Import' }, { id: 2, value: 'Local' }, { id: 3, value: 'Common' }];

    this.initForm();

  }

  initForm() {
    if (this.editMode) {

      this.addExpenseForm.get('trip_id').setValidators(null);
      this.addExpenseForm.get('company_id').setValidators(null);
      this.card_title = 'Update Expense';
      this.crudServices.getOne<any>(ExpenseMaster.getOne, { id: this.id }).subscribe((response) => {

        const temparr = [] = response[0]['emp_id'];
        this.selectedEmp = JSON.parse(JSON.stringify(temparr).replace(/"/g, ''));

        this.imageSrc = environment.serverUrl + response[0]['expense_copy'];
        const responseArr = response[0];
        this.addExpenseForm.patchValue({
          expense_date: responseArr['expense_date'],
          category_id: responseArr['category_id'],
          amount: responseArr['amount'],
          service_provider: responseArr['service_provider'],
          company_id: responseArr['company_id'] ? responseArr['company_id'] : null,
          emp_id: responseArr['emp_id'],
          trip_id: responseArr['trip_id'] ? responseArr['trip_id'] : null,
          description: responseArr['description'],
          division_type: responseArr['division_type'],
          import_local_flag: responseArr['import_local_flag'],
          status: responseArr['status'],
          invoice_no:responseArr['invoice_no']
        });
      });
    }
  }

  convert(str) {
    const date = new Date(str),
      mnth = ('0' + (date.getMonth() + 1)).slice(-2),
      day = ('0' + date.getDate()).slice(-2);
    return [date.getFullYear(), mnth, day].join('-');
  }

  onReset() {
    this.submitted = false;
    this.addExpenseForm.reset();
  }

  onSubmit() {
    const invalid = [];
    const controls = this.addExpenseForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }

    let data = {
      expense_date: this.convert(this.addExpenseForm.value.expense_date),
      category_id: this.addExpenseForm.value.category_id,
      service_provider: this.addExpenseForm.value.service_provider,
      company_id: this.addExpenseForm.value.company_id,
      amount: this.addExpenseForm.value.amount,
      description: this.addExpenseForm.value.description,
      trip_id: this.addExpenseForm.value.trip_id,
      emp_id: this.addExpenseForm.value.emp_id,
      division_type: this.addExpenseForm.value.division_type,
      import_local_flag: this.addExpenseForm.value.import_local_flag,
      id: this.id,
      invoice_no:this.addExpenseForm.value.invoice_no
    }


    if (this.expense_list_all) {
      data['status'] = this.addExpenseForm.value.status;
    } else {
      data['status'] = 0;

    }

    let fileData: any = new FormData();
    const files: Array<File> = this.filesToUpload;
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        fileData.append('expense_copy', files[i], files[i]['name']);
      }
    }

    this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {

      let fileDealDocs = [];
      let filesList = res.uploads.expense_copy;

      if (res.uploads.expense_copy) {
        for (let i = 0; i < filesList.length; i++) {
          fileDealDocs.push(filesList[i].location);
        }
        data['expense_copy'] = JSON.stringify(fileDealDocs);
      }

      if (this.addExpenseForm.value.company_id != null || this.addExpenseForm.value.emp_id.length) {
        this.saveData(data);
      } else {
        this.toasterService.pop('warning', 'warning', "select organization or Employee");
      }
    });
  }

  saveData(formData) {


    if (this.editMode) {
      this.crudServices.updateData<any>(ExpenseMaster.update, formData).subscribe((response) => {
        this.toasterService.pop(response.message, response.message, response.data);
        if (response.code === '100') {
          this.onBack();
        }
      });
    } else {
      this.crudServices.addData<any>(ExpenseMaster.add, formData).subscribe((response) => {
        this.toasterService.pop(response.message, response.message, response.data);
        if (response.code === '100') {
          this.onBack();
        }
      });
    }
  }


  onBack() {
    this.router.navigate(['expense/expense-list']);
  }

  fileChangeEvent(fileInput: any,folder) {
    this.filesToUpload = <Array<File>>fileInput.target.files;

    for (let i = 0; i < this.filesToUpload.length; i++) {
      this.fileData.append(folder, this.filesToUpload[i], this.filesToUpload[i]['name']);
    }
    // this.product.photo = fileInput.target.files[0]['name'];
  }
  
  }


