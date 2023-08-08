import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from "primeng/table";
import { CommonApis } from '../../../shared/apis-path/apis-path';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import * as moment from "moment";

@Component({
	selector: 'app-upcoming-birthdays',
	templateUrl: './upcoming-birthdays.component.html',
	styleUrls: ['./upcoming-birthdays.component.scss']
})

export class UpcomingBirthdaysComponent implements OnInit {

	@ViewChild("dt", { static: false }) table: Table;

	page_title: any = "Upcoming Birthdays";
	isLoading: boolean = false;
	cols: any = [];
	data: any = [];
	filter: any = [];

	from_date: any = new Date();
	to_date: any = new Date(moment().add(10, 'days').format("YYYY-MM-DD"));

	constructor(
		private crudServices: CrudServices
	) {
		// 
	}

	ngOnInit() {
		this.getCols();
	}

	getCols() {
		this.cols = [
			{ field: "emp_name", header: "Employee Name", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "dob", header: "DOB", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" }
		];
		this.filter = ['emp_name'];
		this.getData();
	}

	getData() {
		this.isLoading = true;
		this.data = [];
		this.crudServices.getOne<any>(CommonApis.getUpcomingBirthdays, {
			from_date: moment(this.from_date).format('YYYY-MM-DD'),
			to_date: moment(this.to_date).format('YYYY-MM-DD')
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.data = res.data;
				}
			}
			this.table.reset();
		});
	}

}
