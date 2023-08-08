import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { GradeMaster } from '../../../shared/apis-path/apis-path';
import { ExportService } from '../../../shared/export-service/export-service';

@Component({
	selector: 'app-daily-grade-rates',
	templateUrl: './daily-grade-rates.component.html',
	styleUrls: ['./daily-grade-rates.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		CrudServices,
		ToasterService,
		DatePipe,
		ExportService
	]
})

export class DailyGradeRatesComponent implements OnInit {

	isLoading = false;
	gradesList = [];

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});

	constructor(
		public toasterService: ToasterService,
		public datepipe: DatePipe,
		private crudServices: CrudServices,
		private exportService: ExportService,
	) {
	}

	ngOnInit() {
		this.dailyGradesList();
	}

	dailyGradesList() {
		this.isLoading = true;
		this.gradesList = [];
		this.crudServices.getAll<any>(GradeMaster.getMainGrades).subscribe(response => {
			if (response.code == '100') {
				this.gradesList = response.data;
				this.isLoading = false;
			}
		});
	}

	onChangeGradeRate(value, main_grade_id) {
		if (value != null || value != undefined) {
			let body = {
				data: {
					rate: value
				},
				where: {
					main_grade_id: main_grade_id
				}
			}
			this.crudServices.updateData<any>(GradeMaster.update, body).subscribe((response) => {
				// 
			});
		}
	}

	onChangeGradeLowestCap(value, main_grade_id) {
		if (value != null || value != undefined) {
			let body = {
				data: {
					lowest_cap: value
				},
				where: {
					main_grade_id: main_grade_id
				}
			}
			this.crudServices.updateData<any>(GradeMaster.update, body).subscribe((response) => {
				this.dailyGradesList();
			});
		}
	}

	exportExcel() {
		// let exportData = [];
		// this.gradesList.forEach(element => {
		// 	let data = {
		// 		sr_no: element.id,
		// 		main_grade: element.main_grade_name,
		// 		grade_name: element.grade_name,
		// 		grade_rate: element.grade_rate,
		// 		lowest_cap_price: element.lowest_cap_price,
		// 		date: element.date
		// 	};
		// 	exportData.push(data);
		// });
		// this.exportService.exportExcel(exportData, 'Daily Grade List');
	}
}
