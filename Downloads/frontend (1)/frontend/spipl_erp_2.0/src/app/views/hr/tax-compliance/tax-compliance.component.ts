import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service_back';
import { ToasterConfig, ToasterService } from 'angular2-toaster/angular2-toaster';
import { Table } from 'primeng/table';
import { UserDetails } from '../../login/UserDetails.model';
import { Router } from '@angular/router';
import { taxComplianceMaster, taxComplianceDetails, ValueStore } from '../../../shared/apis-path/apis-path';
import { staticValues } from '../../../shared/common-service/common-service';
import * as moment from "moment";

@Component({
	selector: 'app-tax-compliance',
	templateUrl: './tax-compliance.component.html',
	styleUrls: ['./tax-compliance.component.css', './tax-compliance.component.scss'],
	providers: [CrudServices, PermissionService, LoginService, DatePipe, ToasterService],
	encapsulation: ViewEncapsulation.None,
})
export class TaxComplianceComponent implements OnInit {

	@ViewChild('dt', { static: false }) table: Table;

	cols: { field: string; header: string; }[];
	isLoading: boolean = true;
	taxComplianceGetOne: any;

	mode: string;
	editmode: boolean = false;


	user: UserDetails;
	links: any = [];
	lookup_tax = {};
	taxtypes = [];
	_selectedColumns: any[];

	fromDate: any;
	toDate: any;

	bsRangeValue: Date[];

	currentYear: number;
	date = new Date();
	flag1: string;
	flag2: string;
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000,
	});

	taxComplianceMaster: any = [];

	lookup_return = {};
	returnTypesArray = [];
	state_flag_array = [];
	lookup_state_flag = {};


	lookup_month_year_flag = {};
	month_year_flag_array = [];

	filteredValuess: any[];
	monthProgress = [];
	taxComplianceMasterDetails = [];
	wholeMonthDetails = [];
	wholeMonthDetailsempty = [];
	public popoverTitle: string = "Warning";
	public popoverMessage: string = "Are you sure, you want to Change?";
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = "Yes";
	public cancelText: string = "No";
	public placement: string = "left";
	public closeOnOutsideClick: boolean = true;

	tax_compliance_state_limit: any;
	tax_compliance_company_limit: any;

	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;

	constructor(private CrudServices: CrudServices,
		private router: Router,
		private permissionService: PermissionService,
		private loginService: LoginService,
		public datepipe: DatePipe,
		private toasterService: ToasterService,) {



		this.cols = [
			// { field: 'id', header: 'id' },
			{ field: 'sr_no', header: 'Calender' },
			{ field: 'from_date', header: 'From Date' },
			{ field: 'to_date', header: 'To date' },
			{ field: 'type', header: 'Tax Type' },
			{ field: 'name', header: 'Return Type' },
			{ field: 'state_flag', header: 'Flag' },
			{ field: 'month_year_flag', header: 'Monthly/Yearly' },
			// { field: 'date_of_year', header: 'Payment Date' },
			{ field: 'edit', header: 'Edit' },
			{ field: 'details', header: 'Details' },
		];

		this._selectedColumns = this.cols;

		this.mode = "Add New";
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];


		this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
		if (this.datepipe.transform(this.date, 'MM') > '03') {
			this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
		} else {
			this.bsRangeValue = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];
		}

		this.fromDate = this.bsRangeValue[0];
		this.toDate = this.bsRangeValue[1];



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
		this.getTaxComplianceMasterDetails();
	}

	getTaxComplianceMasterDetails() {

		this.wholeMonthDetails = [];

		this.CrudServices.getOne<any>(taxComplianceMaster.get_all, { from_dt: this.fromDate, to_dt: this.toDate }).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
				this.isLoading = false;
				this.taxComplianceMaster = [];
			} else {
				this.isLoading = false;
				this.taxComplianceMaster = [];


				for (let item, i = 0; item = response[i++];) {

					const tax = item.tax_type.type;
					item.type = tax;

					if (!(tax in this.lookup_tax)) {
						this.lookup_tax[tax] = 1;
						this.taxtypes.push({ 'type': tax });
					}
					const returnType = item.return_type.name;
					item.name = returnType;
					if (!(returnType in this.lookup_return)) {
						this.lookup_return[returnType] = 1;
						this.returnTypesArray.push({ 'name': returnType });
					}

					const stateFlag = item.state_flag;
					//item.stateFlag = this.getstatus(stateFlag);
					if (!(stateFlag in this.lookup_state_flag)) {
						this.lookup_state_flag[stateFlag] = 1;
						this.state_flag_array.push({ value: stateFlag, label: this.getstatus(stateFlag) });
					}

					const monthYearFlag = item.month_year_flag;
					if (!(monthYearFlag in this.lookup_month_year_flag)) {
						this.lookup_month_year_flag[monthYearFlag] = 1;
						this.month_year_flag_array.push({ value: monthYearFlag, label: this.getMonthYear(monthYearFlag) });
					}

					this.taxComplianceMaster.push(item);
					if (item.month_year_flag == 1)//month
					{

						this.getMonthProgress(item.id, item.state_flag);


					} else {

					}

				}
			}
		});
	}


	dateFormating(date) {
		if (date != null) {
			return moment(date).format("YYYY-MM-DD");
		}
	}

	getstatus(val) {
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
	onSelect($e, state) {

		if ($e) {
			if (state === '1') {
				this.flag1 = '1';
				this.fromDate = $e[0];
				this.toDate = $e[1];
			}
			if (state === '2') {
				this.flag2 = '2';
				this.fromDate = $e[0];
				this.toDate = $e[1];
			}

		}
		this.wholeMonthDetails = [];
		this.getTaxComplianceMasterDetails();
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
	}

	addTaxCompliance() {
		this.router.navigate(["/hr/add-tax-compliance-master"]);
	}

	onEdit(id) {

		this.router.navigate(["/hr/edit-tax-compliance-master", id]);
	}

	onDelete(id) {
		this.CrudServices.postRequest<any>(taxComplianceMaster.delete, {
			id: id
		}).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.toasterService.pop(response.message, response.message, response.data);
				this.getTaxComplianceMasterDetails();
			}
		});
	}

	onDateSelect($event, name) {
		this.table.filter($event, name, 'equals');
	}

	getDetails(id) {
		this.router.navigate(["/hr/tax-compliance-details", id]);
	}

	getMonthProgress(taxMasterId, stateFlagid) {
		this.CrudServices.postRequest<any>(taxComplianceDetails.get_all_details_one_master, {
			tax_compliance_master_id: taxMasterId
		}).subscribe((response) => {
			if (response.code === "101") {
				// 
			} else {
				this.taxComplianceMasterDetails = response;
				let monthArray = [
					{ label: 'J', value: '01', flag: 0 },
					{ label: 'F', value: '02', flag: 0 },
					{ label: 'M', value: '03', flag: 0 },
					{ label: 'A', value: '04', flag: 0 },
					{ label: 'M', value: '05', flag: 0 },
					{ label: 'J', value: '06', flag: 0 },
					{ label: 'J', value: '07', flag: 0 },
					{ label: 'A', value: '08', flag: 0 },
					{ label: 'S', value: '09', flag: 0 },
					{ label: 'O', value: '10', flag: 0 },
					{ label: 'N', value: '11', flag: 0 },
					{ label: 'D', value: '12', flag: 0 },

				];


				for (let monthelem of monthArray) {
					let monthStaticVal = monthelem.value;
					let stateId = [];
					let companyId = [];
					for (let element of response) {

						let monthDbVal = element.submitted_dt.substr(5, 2);

						if (monthStaticVal == monthDbVal) {

							stateId.push(element.state_id);
							companyId.push(element.sub_org_id);
						}

					}




					if (stateFlagid == 1) //state
					{
						if (stateId.length == this.tax_compliance_state_limit) {
							monthelem.flag = 1;
						} else {
							monthelem.flag = 0;
						}
					} else if (stateFlagid == 2) //company
					{
						if (companyId.length == this.tax_compliance_company_limit) {
							monthelem.flag = 1;
						} else {
							monthelem.flag = 0;
						}
					}

				}

				this.monthProgress = monthArray;
				this.wholeMonthDetails.push({ months: monthArray, id: taxMasterId });
			}
		});
	}

	uniqueArray(wholeMonthArray) {
		let res = wholeMonthArray.reduce((m, t) => m.set(t.id, t), new Map()).values();
	}
}
