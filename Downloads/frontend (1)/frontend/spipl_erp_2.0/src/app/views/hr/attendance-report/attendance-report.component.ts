import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ExportService } from '../../../shared/export-service/export-service';
import { ActivatedRoute, Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { CalculateAttendance, Attendance } from '../../../shared/apis-path/apis-path';
import { staticValues, CommonService } from "../../../shared/common-service/common-service";
import * as moment from "moment";
@Component({
	selector: 'app-attendance-report',
	templateUrl: './attendance-report.component.html',
	styleUrls: ['./attendance-report.component.scss'],
	providers: [CrudServices, ExportService, CommonService],
	encapsulation: ViewEncapsulation.None,
})
export class AttendanceReportComponent implements OnInit {

	isLoading: boolean = false;
	monthPickerConfig: any = staticValues.monthPickerConfig;
	yearPickerConfig: any = staticValues.yearPickerConfig;
	selected_year: any = moment().format("YYYY");
	selected_month: any = moment().format("MMM-YYYY");
	minDate: any = new Date("2021-08-01");
	minYearDate: any = new Date("2021-01-01");
	maxDate: any = new Date();
	selected_tab: any = 0;
	months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	mlist_detail = [{ id: 1, name: 'January' }, { id: 2, name: 'February' }, { id: 3, name: 'March' }, { id: 4, name: 'April' }, { id: 5, name: 'May' }, { id: 6, name: 'June' }, { id: 7, name: 'July' }, { id: 8, name: 'August' }, { id: 9, name: 'September' }, { id: 10, name: 'October' }, { id: 11, name: 'November' }, { id: 12, name: 'December' }];
	tab_monthly: any = {
		key: "Monthly_Report",
		title: "Monthly Report",
		cols: [
			{ field: 'id', header: 'ID', permission: true },
			{ field: 'emp_name', header: 'NAME', permission: true },
			{ field: 'total_days', header: 'Total Days', permission: true },
			{ field: 'total_present', header: 'Total Present', permission: true },
			{ field: 'presents', header: 'On Time', permission: true },
			{ field: 'late', header: 'Late', permission: true },
			{ field: 'early', header: 'Early', permission: true },
			{ field: 'half_day', header: 'Half Day', permission: true },
			{ field: 'late_early', header: 'Late Early', permission: true },
			{ field: 'personal_leaves', header: 'Personal Leaves', permission: true },
			{ field: 'official_leaves', header: 'Official Leaves', permission: true },
			{ field: 'holidays', header: 'Holidays', permission: true },
			{ field: 'balance_leaves', header: 'Balance Leaves', permission: true }
		],
		data: [],
		filter: ['emp_name']
	};
	tab_yearly: any = {
		key: "Yearly_Report",
		title: "Yearly Report",
		cols: [
			{ field: 'emp_name', header: 'Name', permission: true },
			{ field: 'january', header: 'January', permission: true },
			{ field: 'february', header: 'February', permission: true },
			{ field: 'march', header: 'March', permission: true },
			{ field: 'april', header: 'April', permission: true },
			{ field: 'may', header: 'May', permission: true },
			{ field: 'june', header: 'June', permission: true },
			{ field: 'july', header: 'July', permission: true },
			{ field: 'august', header: 'August', permission: true },
			{ field: 'september', header: 'September', permission: true },
			{ field: 'october', header: 'October', permission: true },
			{ field: 'november', header: 'November', permission: true },
			{ field: 'december', header: 'December', permission: true },
			{ field: 'summary', header: 'Summary', permission: true }
		],
		data: [],
		filter: ['emp_name']
	};

	constructor(
		private crudServices: CrudServices,
		private commonService: CommonService,
		private router: Router,
		private exportService: ExportService
	) {
		// 
	}

	ngOnInit() {
		this.getMonthlyReport();
	}

	getMonthlyReport() {
		this.isLoading = true;
		let start_date = moment(this.selected_month).startOf('month').format('YYYY-MM-DD');
		let end_date = moment(this.selected_month).endOf('month').format('YYYY-MM-DD');
		let year = moment(this.selected_month).format('YYYY');
		let month = moment(this.selected_month).format('MM');
		this.crudServices.getOne<any>(Attendance.getMonthlyReport, {
			start_date: start_date,
			end_date: end_date,
			year: year,
			month: month
		}).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					res.data.forEach(element => {
						element.total_present = Number(element.presents) + Number(element.late) + Number(element.early) + Number(element.late_early) + Number(element.half_day);
						element.holidays = Number(element.full_holiday) + (Number(element.half_holiday) * 0.5);
						element.balance_leaves = (element.balance_paid_leaves) < 0 ? 0 : element.balance_paid_leaves;
						if (month == "01") {
							element.balance_leaves = Number(element.balance_leaves) + 12;
						}
					});
					this.tab_monthly.data = res.data;
				}
			}
			this.isLoading = false;
		});
	}

	getYearlyReport() {
		this.isLoading = true;
		this.crudServices.getOne<any>(CalculateAttendance.calculateYearlyAttendance, {
			year: moment(this.selected_year).format("YYYY")
		}).subscribe(res => {
			this.tab_yearly.data = res;
			this.isLoading = false;
		});
	}

	onTabChange(e) {
		this.selected_tab = e.index;
		if (e.index == 0) {
			this.getMonthlyReport();
		} else {
			this.getYearlyReport();
		}
	}

	onOpenCalendar(container) {
		container.monthSelectHandler = (event: any): void => {
			container._store.dispatch(container._actions.select(event.date));
		};
		container.setViewMode('month');
	}

	viewEmployee(emp_id) {
		this.router.navigate(['hr/view-staff', emp_id]);
	}

	exportExcel() {
		if (this.selected_tab == 0) {
			let exportData = [];
			let month = moment(this.selected_month).format("MMM-YYYY");
			let title = "Monthly Attendance Report (" + month + ")";
			this.tab_monthly.data.forEach((element, index) => {
				let data = {
					'#': (index + 1),
					'Employee Name': element.emp_name,
					'Total Days': element.total_days,
					'Presents': element.presents,
					'WFH': element.wfh,
					'Late': element.late,
					'Early': element.early,
					'Half Day': element.half_day,
					'Late Early': element.late_early,
					'Personal Leaves': element.personal_leaves,
					'Official Leaves': element.official_leaves,
					'Full Holiday': element.full_holiday,
					'Half Holiday': element.half_holiday,
					'Balance Leaves': element.balance_paid_leaves
				};
				exportData.push(data);
			});
			this.exportService.exportExcel(exportData, title);
		} else {
			let title = "Annual Attendance Report (" + this.selected_year + ")";
			const element = document.getElementById('mytable');
			const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
			const wb: XLSX.WorkBook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
			XLSX.writeFile(wb, title + '.xlsx');
		}

	}
}
