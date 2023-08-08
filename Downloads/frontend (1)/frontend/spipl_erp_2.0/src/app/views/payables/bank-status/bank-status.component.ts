import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { Table } from "primeng/table";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { BankStatus } from '../../../shared/apis-path/apis-path';
import { ExportService } from '../../../shared/export-service/export-service';
import * as moment from "moment";
import { map } from 'rxjs/operators';
import { ModalDirective } from "ngx-bootstrap";
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { DatePipe } from '@angular/common';

@Component({
	selector: 'app-bank-status',
	templateUrl: './bank-status.component.html',
	styleUrls: ['./bank-status.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, DatePipe, ExportService]
})
export class BankStatusComponent implements OnInit {
	@ViewChild("dt", { static: false }) table: Table;
	page_title: any = "Bank Status";
	isLoading: boolean = false;
	cols: any = [];
	data: any = [];
	filter: any = [];
	DetailsData: any
	private toasterService: ToasterService;
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 10000
	});
	constructor(
		private crudServices: CrudServices,
		toasterService: ToasterService,
		private datePipe: DatePipe,
		private exportService: ExportService,
	) {
		this.toasterService = toasterService;
	}
	ngOnInit() {
		this.getData()
	}
	getData() {
		this.isLoading = true;
		this.crudServices.getAll<any>(BankStatus.getData).subscribe((res: any) => {
			if (res.status == 200) {
				if (res.data.length > 0) {
					this.DetailsData = res.data

					this.getCols();
				}
				else {
					this.toasterService.pop('error', 'Alert', 'No Data Found..!');
				}
			}
		})
	}
	getCols() {
		this.cols = [
			{ field: "remark", header: "Name/Remark", sort: true, filter: true, footer: false, total: 0, type: null },
			{ field: "payment_date", header: "Payment Date", sort: true, filter: true, footer: false, total: 0, type: null },
			{ field: "amount", header: "Amount.", sort: true, filter: true, footer: false, total: 0, type: null },
			{ field: "utr_no", header: "UTR Number", sort: true, filter: true, footer: false, total: 0, type: null },
			{ field: "status", header: "Bank Status", sort: true, filter: true, footer: false, total: 0, type: null },
			{ field: "bank_acc_no", header: "Bank Account Number", sort: true, filter: true, footer: false, total: 0, type: null },
			{ field: "ifsc code", header: "IFSC Code", sort: true, filter: true, footer: false, total: 0, type: null },
		];
		this.filter = ['bank_acc_no', 'amount', 'payment_date', 'utr_no'];
		this.isLoading = false;
	}
	// pushDropdown() {
	//   let filter_cols = this.cols.filter(col => col.filter == true);
	//   filter_cols.forEach(element => {
	//     let unique = this.data.map(item =>
	//       item[element.field]
	//     ).filter((value, index, self) =>
	//       self.indexOf(value) === index
	//     );
	//     let array = [];
	//     unique.forEach(item => {
	//       array.push({
	//         value: item,
	//         label: item
	//       });
	//     });
	//     element.dropdown = array;
	//   });
	// }
	exportData(type) {
		let final_data = null;
		if (this.table.filteredValue == null) {
			final_data = this.data;
		} else {
			final_data = this.table.filteredValue;
		}
		let fileName = 'Bank Status' + ' - ' + this.page_title;
		let exportData = [];
		for (let i = 0; i < final_data.length; i++) {
			let obj = {};
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]["field"] != "action") {
					if (this.cols[j]["field"] == "quantity") {
						obj[this.cols[j]["header"]] = final_data[i][this.cols[j]["field"]] + " MT";
					} else {
						obj[this.cols[j]["header"]] = final_data[i][this.cols[j]["field"]];
					}
				}
			}
			exportData.push(obj);
		}
		let foot = {};
		for (let j = 0; j < this.cols.length; j++) {
			if (this.cols[j]["field"] != "action") {
				if (this.cols[j]["field"] == "quantity") {
					foot[this.cols[j]["header"]] = this.cols[j]["total"] + " MT";
				} else if (this.cols[j]["field"] == "deal_rate" ||
					this.cols[j]["field"] == "freight_rate") {
					foot[this.cols[j]["header"]] = this.cols[j]["total"];
				} else {
					foot[this.cols[j]["header"]] = "";
				}
			}
		}
		exportData.push(foot);
		if (type == 'Excel') {
			this.exportService.exportExcel(exportData, fileName);
		} else {
			let exportColumns = this.cols.map(function (col) {
				if (col.field != "action") {
					return { title: col.header, dataKey: col.header }
				}
			});
			this.exportService.exportPdf(exportColumns, exportData, fileName);
		}
	}
}
