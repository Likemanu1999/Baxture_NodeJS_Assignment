
import { Component, OnInit, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from "ngx-bootstrap";
import { Router } from '@angular/router';
import { Table } from "primeng/table";
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ExportService } from '../../../shared/export-service/export-service';
import { staticValues, CommonService } from '../../../shared/common-service/common-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { EmployeeForm16, FileUpload, YearlyCTCNew } from '../../../shared/apis-path/apis-path';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';

@Component({
	selector: 'app-employee-form16',
	templateUrl: './employee-form16.component.html',
	styleUrls: ['./employee-form16.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		CrudServices,
		PermissionService,
		LoginService,
		ToasterService,
		ExportService,
		CommonService
	],
})
export class EmployeeForm16Component implements OnInit {

	@ViewChild("uploadForm16Modal", { static: false }) public uploadForm16Modal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Employee Form-16";

	popoverTitle: string = "Please Confirm";
	popoverMessage: string = "Are you sure, you want to Send Mail?";
	confirmText: string = 'Confirm';
	cancelText: string = 'Cancel';
	placement1: string = 'bottom';
	placement2: string = 'left';
	cancelClicked: boolean = false;

	user: UserDetails;
	links: string[] = [];
	role_id: any = null;
	company_id: any = null;
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	upload_form_16: boolean = false;
	download_form_16: boolean = false;
	send_form_16_mail: boolean = false;
	isLoading: boolean = false;

	currentFinancialYear: any = this.commonService.getCurrentFinancialYear();
	financialYearList: any = [];
	selectedFinancialYear: any = null;
	cols: any = [];
	data: any = [];
	filter: any = [];
	form16Form: FormGroup;
	fileData = new FormData();

	constructor(
		private toasterService: ToasterService,
		private router: Router,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService,
		private fb: FormBuilder,
		private commonService: CommonService
	) {
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.role_id = this.user.userDet[0].role_id;
		this.company_id = this.user.userDet[0].company_id;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.del_opt = perms[3];
		this.upload_form_16 = (this.links.indexOf('upload_form_16') > -1);
		this.download_form_16 = (this.links.indexOf('download_form_16') > -1);
		this.send_form_16_mail = (this.links.indexOf('send_form_16_mail') > -1);
	}

	ngOnInit() {
		this.initForm();
		this.getFinancialYearList();
	}

	initForm() {
		this.form16Form = new FormGroup({
			emp_id: new FormControl(null, Validators.required),
			form_16_copy: new FormControl(null, Validators.required)
		});
	}

	getFinancialYearList() {
		this.financialYearList = [];
		this.crudServices.getAll<any>(YearlyCTCNew.getFinancialYears).subscribe(res => {
			if (res.code == "100") {
				if (res.data.length > 0) {
					res.data.forEach(element => {
						this.financialYearList.push({
							financial_year: element.financial_year
						});
					});
					this.selectedFinancialYear = this.financialYearList[1];
					this.getCols();
				}
			}
		});
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(EmployeeForm16.getEmployeesForm16, {
			financial_year: this.selectedFinancialYear.financial_year
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					res.data.forEach(element => {
						element.form_16_arr = JSON.parse(element.form_16_copy);
					});
					this.data = res.data;
				}
			}
			if (this.table != null && this.table != undefined) {
				this.table.reset();
			}
		});
	}

	getCols() {
		this.cols = [
			{ field: "emp_id", header: "Emp ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "emp_name", header: "Employee Name", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "pan_no", header: "PAN No", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "mobile", header: "Mobile", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "email", header: "Email", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: "Action" }
		];
		this.filter = ['emp_id', 'emp_name', 'pan_no'];
		this.getData();
	}

	onAction(item, type) {
		if (type == 'Upload') {
			this.form16Form.reset();
			this.form16Form.patchValue({
				emp_id: Number(item.emp_id)
			});
			this.uploadForm16Modal.show();
		}
		// if (type == 'Delete') {
		// 	this.crudServices.addData<any>(EmployeeForm16.delete, {
		// 		id: item.id
		// 	}).subscribe(res => {
		// 		if (res.code === '100') {
		// 			this.toasterService.pop('success', 'Success', "Form-16 Deleted Successfully");
		// 			this.getCols();
		// 		}
		// 	});
		// }
		if (type == 'Send_Mail') {
			let emp_form_16_arr = [];
			if (item.form_16_arr != null && item.form_16_arr.length > 0) {
				let form_16_1 = null;
				let form_16_2 = null;
				if (item.form_16_arr.length == 1) {
					form_16_1 = item.form_16_arr[0];
				} else if (item.form_16_arr.length == 2) {
					form_16_1 = item.form_16_arr[0];
					form_16_2 = item.form_16_arr[1];
				}
				let employee_set = {
					emp_id: item.emp_id,
					emp_name: item.emp_name,
					email: item.email,
					mobile: item.mobile,
					form_16_1: form_16_1,
					form_16_2: form_16_2
				};
				emp_form_16_arr.push(employee_set);
				this.crudServices.getOne<any>(EmployeeForm16.sendMail, {
					emp_form_16_arr: JSON.stringify(emp_form_16_arr),
					financial_year: this.selectedFinancialYear.financial_year
				}).subscribe(res => {
					if (res.code == '100') {
						this.toasterService.pop('success', 'Success', "Form-16 Mail Sent Successfully");
					}
				});
			}
		}
		if (type == 'Send_Mail_To_All') {
			let emp_form_16_arr = [];
			this.data.forEach(element1 => {
				if (element1.form_16_arr != null && element1.form_16_arr.length > 0) {
					let form_16_1 = null;
					let form_16_2 = null;
					if (element1.form_16_arr.length == 1) {
						form_16_1 = element1.form_16_arr[0];
					} else if (element1.form_16_arr.length == 2) {
						form_16_1 = element1.form_16_arr[0];
						form_16_2 = element1.form_16_arr[1];
					}
					let employee_set = {
						emp_id: element1.emp_id,
						emp_name: element1.emp_name,
						email: element1.email,
						mobile: element1.mobile,
						form_16_1: form_16_1,
						form_16_2: form_16_2
					};
					emp_form_16_arr.push(employee_set);
				}
			});
			this.crudServices.getOne<any>(EmployeeForm16.sendMail, {
				emp_form_16_arr: JSON.stringify(emp_form_16_arr),
				financial_year: this.selectedFinancialYear.financial_year
			}).subscribe(res => {
				if (res.code == '100') {
					this.toasterService.pop('success', 'Success', "Form-16 Mail Sent Successfully");
				}
			});
		}
	}

	onFileChange(e) {
		let files = <Array<File>>e.target.files;
		for (let i = 0; i < files.length; i++) {
			this.fileData.append("employee_form_16", files[i], files[i]['name']);
		}
	}

	submitForm16() {
		this.isLoading = true;
		this.crudServices.fileUpload(FileUpload.upload, this.fileData).subscribe(res_aws => {
			let form_16_arr = [];
			res_aws.uploads["employee_form_16"].forEach(element => {
				form_16_arr.push(element.location);
			});
			let data = {
				emp_id: this.form16Form.value.emp_id,
				financial_year: this.selectedFinancialYear.financial_year,
				form_16_copy: JSON.stringify(form_16_arr)
			};
			let body = {
				data: data
			};
			this.crudServices.addData<any>(EmployeeForm16.add, body).subscribe(res => {
				if (res.code === '100') {
					this.toasterService.pop('success', 'Success', "Form-16 Uploaded Successfully");
					this.form16Form.reset();
					this.fileData = new FormData();
					this.uploadForm16Modal.hide();
					this.getCols();
				}
			});
		});
	}


}
