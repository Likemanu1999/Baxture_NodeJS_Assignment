import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { Table } from 'primeng/table';
import { CrudServices } from '../../../../shared/crud-services/crud-services';
import { PermissionService } from '../../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../../login/login.service_back';
import { taxComplianceMaster, taxComplianceDetails, ValueStore } from '../../../../shared/apis-path/apis-path';

@Component({
	selector: 'app-tax-compliance-details',
	templateUrl: './tax-compliance-details.component.html',
	styleUrls: ['./tax-compliance-details.component.css', './tax-compliance-details.component.scss'],
	providers: [CrudServices, PermissionService, LoginService, DatePipe, ToasterService],
	encapsulation: ViewEncapsulation.None,
})
export class TaxComplianceDetailsComponent implements OnInit {
	@ViewChild('dt', { static: false }) table: Table;
	cols: { field: string; header: string; }[];
	isLoading: boolean = true;
	_selectedColumns: any[];
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000,
	});

	taxComplianceMasterDetails: any = [];


	lookup_state = {};
	state_array = [];

	lookup_employee = {};
	employee_array = [];

	lookup_company = {};
	company_array = [];

	filteredValuess: any[];

	public popoverTitle: string = "Warning";
	public popoverMessage: string = "Are you sure, you want to Change?";
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = "Yes";
	public cancelText: string = "No";
	public placement: string = "left";
	public closeOnOutsideClick: boolean = true;

	tax_compliance_master_id: any;
	taxComplianceMasterDet = [];
	dayText: any;
	CurrentMonthDate: any;
	monthProgress = [];

	totalAmount = 0;
	totalInterest = 0;
	monthYearFlag: any;
	stateFlag: any;
	tax_compliance_state_limit: any;
	tax_compliance_company_limit: any;

	constructor(private CrudServices: CrudServices,
		private router: Router,
		private route: ActivatedRoute,
		private permissionService: PermissionService,
		private loginService: LoginService,
		public datepipe: DatePipe,
		private toasterService: ToasterService,) {

		this.cols = [
			{ field: 'sr_no', header: 'Details/Master ID' },
			{ field: 'state_name', header: 'State' },
			{ field: 'emp_name', header: 'Employee Name' },
			{ field: 'company_name', header: 'Company' },
			{ field: 'amount', header: 'Amount' },
			{ field: 'interest', header: 'Interest' },
			{ field: 'remark', header: 'Remark' },
			{ field: 'submitted_dt', header: 'Submitted Date' },
			{ field: 'edit', header: 'Edit' }
		];

		this._selectedColumns = this.cols;

		this.route.params.subscribe((params: Params) => {
			if (params.tax_compliance_master_id !== undefined) {
				this.tax_compliance_master_id = params.tax_compliance_master_id;
			}
		});


		this.CrudServices.postRequest<any>(taxComplianceMaster.get_one, {
			id: this.tax_compliance_master_id
		}).subscribe((response) => {
			this.taxComplianceMasterDet = response[0];
			this.monthYearFlag = response[0].month_year_flag;
			this.stateFlag = response[0].state_flag;


			this.dayText = response[0].day_of_month ? response[0].day_of_month + 'th Day Of Every Month' : '';
			this.CurrentMonthDate = response[0].day_of_month;


		});

	}

	ngOnInit() {
		this.CrudServices.getAll<any>(ValueStore.getAll).subscribe((response) => {
			for (let elem of response) {

				if (elem.thekey == "tax_compliance_state_limit") {
					this.tax_compliance_state_limit = elem.value;
				}
				if (elem.thekey == "tax_compliance_company_limit") {
					this.tax_compliance_company_limit = elem.value;
				}
			}

		});
		this.isLoading = true;
		this.getTaxComplianceDetails();
	}

	getTaxComplianceDetails() {
		this.CrudServices.postRequest<any>(taxComplianceDetails.get_all_details_one_master, {
			tax_compliance_master_id: this.tax_compliance_master_id
		}).subscribe((response) => {

			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
				this.isLoading = false;
				this.taxComplianceMasterDetails = [];

			} else {
				this.isLoading = false;
				this.taxComplianceMasterDetails = [];

				this.totalAmount = 0;
				this.totalInterest = 0;
				for (let item, i = 0; item = response[i++];) {

					if (item.state_master) {
						const stateName = item.state_master.name;
						item.state_name = stateName;
						if (!(stateName in this.lookup_state)) {
							this.lookup_state[stateName] = 1;
							this.state_array.push({ 'state_name': stateName });
						}
					}
					if (item.taxCompDetEmp) {
						const employeeName = item.taxCompDetEmp.empName;
						item.emp_name = employeeName;
						if (!(employeeName in this.lookup_employee)) {
							this.lookup_employee[employeeName] = 1;
							this.employee_array.push({ 'emp_name': employeeName });
						}
					}

					if (item.sub_org_master) {
						const companyName = item.sub_org_master.sub_org_name;
						item.company_name = companyName;
						if (!(companyName in this.lookup_company)) {
							this.lookup_company[companyName] = 1;
							this.company_array.push({ 'company_name': companyName });
						}

					}

					this.totalAmount += item.amount;
					this.totalInterest += item.interest;
					this.taxComplianceMasterDetails.push(item);
				}

				if (this.monthYearFlag == 1) {
					this.getMonthProgress();
				}

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
	// multiselect filter
	onchange(event, name) {
		const arr = [];
		if (event.value.length > 0) {
			for (let i = 0; i < event.value.length; i++) {
				arr.push(event.value[i][name]);
			}
			this.table.filter(arr, name, 'in');

		} else {
			this.table.filter('', name, 'in');
		}
	}

	onFilter(event, dt) {
		this.filteredValuess = [];
		this.filteredValuess = event.filteredValue;
		this.totalAmount = 0;
		this.totalInterest = 0;

		for (const item of this.filteredValuess) {

			this.totalAmount += item.amount;
			this.totalInterest += item.interest;
		}

	}


	addTaxComplianceDetails() {
		this.router.navigate(["/hr/add-tax-compliance-details", this.tax_compliance_master_id]);
	}

	onEdit(id) {

		this.router.navigate(["/hr/edit-tax-compliance-details", id, this.tax_compliance_master_id]);
	}

	onDelete(id) {
		this.CrudServices.postRequest<any>(taxComplianceDetails.delete, {
			id: id
		}).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.toasterService.pop(response.message, response.message, response.data);
				this.getTaxComplianceDetails();
			}
		});
	}

	onBack() {

		this.router.navigate(["/hr/tax-compliance"]);
	}

	getStateName(val) {
		if (val === 1) {
			return 'State';
		} else if (val === 2) {
			return 'Company';
		} else if (val === 3) {
			return 'Indivisual';
		}

	}

	getMonthYear(val) {
		if (val === 1) {
			return 'Month';
		} else if (val === 2) {
			return 'Year';
		}

	}

	checkDate(date, day_of_month, return_month, return_to_date) {

		let return_month1 = new Date(return_month)
		let return_month_plus_one = new Date(return_month1.setMonth(return_month1.getMonth() + 1)).toISOString().split('T')[0];
		let return_month_date = new Date(return_month_plus_one.substr(0, 4) + '-' + return_month_plus_one.substr(5, 2) + '-' + day_of_month);


		let return_to_date1 = new Date(return_to_date)
		let return_to_date_one = new Date(return_to_date1.setMonth(return_to_date1.getMonth() + 1)).toISOString().split('T')[0];

		let return_to_date_sec_case = new Date(return_to_date_one.substr(0, 4) + '-' + return_to_date_one.substr(5, 2) + '-' + day_of_month);



		let month = date.substr(5, 2);
		let year = date.substr(0, 4);

		let currentMonthDate = new Date(year + '-' + month + '-' + this.CurrentMonthDate);
		let dbDate = new Date(date);
		let newDbDate = date.substr(8, 2) + '/' + date.substr(5, 2) + '/' + date.substr(0, 4);

		if (return_month) {
			if (dbDate > return_month_date) {
				//red overdue
				return '<span class="badge badge-danger">' + newDbDate + '</span>';
			} else {
				return '<span class="badge badge-success">' + newDbDate + '</span>';
			}

		} else if (return_to_date) {
			if (dbDate > return_to_date_sec_case) {
				//red overdue
				return '<span class="badge badge-danger">' + newDbDate + '</span>';
			} else {
				return '<span class="badge badge-success">' + newDbDate + '</span>';
			}

		} else {
			if (dbDate > return_month_date) {
				//red overdue
				return '<span class="badge badge-danger">' + newDbDate + '</span>';
			} else {
				return '<span class="badge badge-success">' + newDbDate + '</span>';
			}
		}




	}

	getMonthProgress() {
		let monthArray = [
			{ label: 'JAN', value: '01', flag: 0 },
			{ label: 'FEB', value: '02', flag: 0 },
			{ label: 'MAR', value: '03', flag: 0 },
			{ label: 'APR', value: '04', flag: 0 },
			{ label: 'MAY', value: '05', flag: 0 },
			{ label: 'JUN', value: '06', flag: 0 },
			{ label: 'JUL', value: '07', flag: 0 },
			{ label: 'AUG', value: '08', flag: 0 },
			{ label: 'SEP', value: '09', flag: 0 },
			{ label: 'OCT', value: '10', flag: 0 },
			{ label: 'NOV', value: '11', flag: 0 },
			{ label: 'DEC', value: '12', flag: 0 },

		];
		this.monthProgress = monthArray;

		//let stateDateArray = [];
		for (let monthelem of monthArray) {
			let monthStaticVal = monthelem.value;

			let stateId = [];
			let companyId = [];
			for (let element of this.taxComplianceMasterDetails) {

				let monthDbVal = element.submitted_dt.substr(5, 2);

				if (monthStaticVal == monthDbVal) {
					stateId.push(element.state_id);
					companyId.push(element.sub_org_id);
				}

			}
			if (this.stateFlag == 1) //state
			{
				if (stateId.length == this.tax_compliance_state_limit) {
					monthelem.flag = 1;
				} else {
					monthelem.flag = 0;
				}
			} else if (this.stateFlag == 2) //companay
			{
				if (companyId.length == this.tax_compliance_company_limit) {
					monthelem.flag = 1;
				} else {
					monthelem.flag = 0;
				}
			}
		}
	}

	onDateSelect($event, name) {
		this.table.filter(this.convert($event), name, 'equals');
	}

	convert(date) {
		if (date) {
			return this.datepipe.transform(date, 'yyyy-MM-dd');
		} else {
			return '';
		}
	}


	getDocsArray(docs: string) {
		return JSON.parse(docs);
	}


}
