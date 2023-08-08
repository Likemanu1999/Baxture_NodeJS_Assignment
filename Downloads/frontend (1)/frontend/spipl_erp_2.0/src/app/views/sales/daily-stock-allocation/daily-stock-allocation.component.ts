import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Params, ActivatedRoute, Router } from "@angular/router";
import { ToasterService, ToasterConfig } from "angular2-toaster";
import { LoginService } from "../../login/login.service";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { DailyStockAllocation, GradeMaster, StaffMemberMaster } from "../../../shared/apis-path/apis-path";
import { staticValues } from "../../../shared/common-service/common-service";

@Component({
	selector: 'app-daily-stock-allocation',
	templateUrl: './daily-stock-allocation.component.html',
	styleUrls: ['./daily-stock-allocation.component.css'],
	providers: [ToasterService, CrudServices, LoginService],
})

export class DailyStockAllocationComponent implements OnInit {

	private toasterService: ToasterService;
	user: any;

	public popoverTitle: string = "Warning";
	public popoverMessage: string = "Are you sure, you want to Change?";
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = "Yes";
	public cancelText: string = "No";
	public placement: string = "right";
	public closeOnOutsideClick: boolean = true;

	dailyStockAllocationForm: FormGroup;

	marketingPersonsList: any = [];
	gradeList: any = [];
	dataList: any = [];
	unit_type: any = "MT";

	isMultipleMarketingPerson: boolean = true;
	isMultipleGrade: boolean = true;
	break: boolean = false;

	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: false,
		timeout: 5000,
	});

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		toasterService: ToasterService,
		private crudServices: CrudServices,
		private loginService: LoginService
	) {
		this.toasterService = toasterService;
		this.user = this.loginService.getUserDetails();
	}

	ngOnInit() {
		this.loadData();
		this.initForm();
	}

	initForm() {
		this.dailyStockAllocationForm = new FormGroup({
			marketing_person_id: new FormControl(null, Validators.required),
			grade_id: new FormControl(null, Validators.required),
			quantityValue: new FormControl(null, Validators.required)
		});
	}

	get f() {
		return this.dailyStockAllocationForm.controls;
	}

	loadData() {
		this.getMarketingPersons();
		this.getGrades();
		this.getDailyStockAllocation();
	}

	getMarketingPersons() {
		this.crudServices.getOne<any>(StaffMemberMaster.getMarketingPersonsArr, {
			role_ids: staticValues.marketing_role_ids
		}).subscribe(response => {
			this.marketingPersonsList = response.data;
		});
	}

	getGrades() {
		this.crudServices.getAll(GradeMaster.getAll).subscribe(response => {
			this.gradeList = response
		});
	}

	getDailyStockAllocation() {
		this.dataList = [];
		this.crudServices.getAll<any>(DailyStockAllocation.getAll).subscribe(response => {
			response.data.forEach(element => {
				let obj = {
					id: element.id,
					marketing_person_id: element.marketingPerson.id,
					marketing_person_name: element.marketingPerson.first_name + " " +
						element.marketingPerson.last_name,
					grade_id: element.grade_master.grade_id,
					grade_name: element.grade_master.grade_name,
					quantity: element.quantity
				};
				this.dataList.push(obj);
			});

		});

	}

	onChangeMarketingPerson(value) {
		if ((value != null || value != undefined) && value.length > 1) {
			this.isMultipleGrade = false;
		} else {
			this.isMultipleGrade = true;
		}
	}

	onSubmit() {
		let data = null;
		this.break = false;

		let marketing_person_id = this.dailyStockAllocationForm.value.marketing_person_id;
		let grade_id = this.dailyStockAllocationForm.value.grade_id;
		let quantity = this.dailyStockAllocationForm.value.quantityValue;

		if (marketing_person_id.length > 1) {
			marketing_person_id.forEach(value => {
				let res = this.dataList.find(o => (o.marketing_person_id === value &&
					o.grade_id === grade_id[0]));
				if (!this.break) {
					if (res) {
					} else {
						data = {
							marketing_person_id: value,
							grade_id: grade_id,
							quantity: quantity,
						};
						this.saveData(data);
					}
				}
			});
		} else if (grade_id.length > 1) {
			grade_id.forEach(value => {
				let res = this.dataList.find(o => (o.marketing_person_id === marketing_person_id[0] &&
					o.grade_id === value));
				if (!this.break) {
					if (res) {
						this.errorHandling();
					} else {
						data = {
							marketing_person_id: marketing_person_id,
							grade_id: value,
							quantity: quantity,
						};
						this.saveData(data);
					}
				}
			});
		} else {
			let res = this.dataList.find(o => (o.marketing_person_id === marketing_person_id[0] &&
				o.grade_id === grade_id[0]));
			if (!this.break) {
				if (res) {
					this.errorHandling();
				} else {
					data = {
						marketing_person_id: marketing_person_id,
						grade_id: grade_id,
						quantity: quantity,
					};
					this.saveData(data);
				}
			}
		}
	}

	saveData(data) {
		this.crudServices.addData(DailyStockAllocation.add, data).subscribe(response => {
			this.toasterService.pop("success", "Success", "Stock Allocated Successfully");
			this.getDailyStockAllocation();
		});
	}

	errorHandling() {
		this.toasterService.pop("error", "Alert", "Duplicate Stock Allocation");
		this.break = true;
	}

	onDelete(id) {
		this.crudServices.deleteData(DailyStockAllocation.delete, {
			id: id
		}).subscribe(response => {
			this.toasterService.pop("success", "Success", "Deleted Successfully");
			this.getDailyStockAllocation();
		});
	}

}
