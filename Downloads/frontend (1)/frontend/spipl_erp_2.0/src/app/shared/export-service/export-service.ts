import { Injectable } from '@angular/core';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import * as XLSXStyle from 'xlsx-js-style'
import * as xlsx from 'xlsx'


pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Injectable()
export class ExportService {
	constructor() { }
	/**
	* This function is used to export data in pdf. It takes coloumns to export from json and JSON array of objects with filename.
	* */
	exportPdf(exportColumns, filteredValuess, filename) {
		const doc = new jsPDF('p', 'mm', [1000, 1000]);

		doc.autoTable({
			theme: 'grid',
			columnStyles: { 0: { halign: 'center' } }, // Cells in first column centered and green
			body: filteredValuess,
			columns: exportColumns,
		});
		doc.save(filename + Date.now() + '.pdf');
	}

	exportPdfText(exportColumns, filteredValuess, filename, text) {
		const doc = new jsPDF();
		doc.text(text, 1, 6);
		doc.autoTable({
			theme: 'grid',
			columnStyles: { 0: { halign: 'center' } }, // Cells in first column centered and green
			body: filteredValuess,
			columns: exportColumns,
		});
		doc.save(filename + Date.now() + '.pdf');


	}


	/**
	* This function is used to export data in excel. It takes JSON array of objects with filename.
	* */
	exportExcel(exportData, fileName) {
		const worksheet = xlsx.utils.json_to_sheet(exportData);

		let arr = Object.keys(worksheet);

		for (let i = 0; i <= arr.length - 1; i++) {



			if (worksheet[arr[i]].t != undefined) {

				worksheet[arr[i]].s = {
					font: {
						name: "Times New Roman",
						sz: 10
					},

					border: { top: { style: 'thin', color: { rgb: "#000000" } }, left: { style: 'thin', color: { rgb: "#000000" } }, right: { style: 'thin', color: { rgb: "#000000" } }, bottom: { style: 'thin', color: { rgb: "#000000" } } }
				}
			}

		}




		let workbook = {
			Sheets: {
				'data': worksheet
			},
			SheetNames: ['data']
		};
		const excelBuffer: any = XLSXStyle.write(workbook, {
			bookType: 'xlsx',
			type: 'array'
		});
		this.saveAsExcelFile(excelBuffer, fileName);

	}

	saveAsExcelFile(buffer: any, fileName: string): void {
		import('file-saver').then(FileSaver => {
			const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
			const EXCEL_EXTENSION = '.xlsx';
			const data: Blob = new Blob([buffer], {
				type: EXCEL_TYPE
			});
			FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
		});
	}

	/**
	* This function is used to convert image to base64 string.
	* */
	getBase64ImageFromURL(url) {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.setAttribute('crossOrigin', 'anonymous');
			img.onload = () => {
				const canvas = document.createElement('canvas');
				canvas.width = img.width;
				canvas.height = img.height;
				const ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0);
				const dataURL = canvas.toDataURL('image/png');
				resolve(dataURL);
			};
			img.onerror = error => {
				reject(error);
			};
			img.src = url;
		});
	}


}
