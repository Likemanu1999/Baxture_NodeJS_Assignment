import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { Params, ActivatedRoute, Router } from "@angular/router";
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { Table } from 'primeng/table';
import { ExportService } from '../../../shared/export-service/export-service';
import { FileUpload, Marketing } from '../../../shared/apis-path/apis-path';
import { ModalDirective } from 'ngx-bootstrap';
import * as XLSX from 'xlsx'
import { UserDetails } from '../../login/UserDetails.model';
import { staticValues } from '../../../shared/common-service/common-service';

@Component({
  selector: 'app-organization-data-import',
  templateUrl: './organization-data-import.component.html',
  styleUrls: ['./organization-data-import.component.scss'],
  providers: [CrudServices, ToasterService, PermissionService, LoginService, ExportService]
})
export class OrganizationDataImportComponent implements OnInit {
  @ViewChild("dt", { static: false }) table: Table;

  @ViewChild("fileInput", { static: false }) fileInput: ElementRef;
  @ViewChild('myModal', { static: false }) public myModal: ModalDirective;
  page_title: any = "Organization Data";
  isLoading: boolean = false;
  loginUser: any = {};
  cols: any = [];
  data: any = [];
  filter: any = [];
  csvContent: any;

  importFileModal: Boolean = false;
  currentJsonArr = []
  isLoadingImport: boolean;
  filecsv: File[];
  fileValue: any;
  
	private toasterService: ToasterService;
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});
  products: any = [];
  selectedProduct: any;

  user: UserDetails;
  company_id: any;
  division: any = staticValues.company_list;
  constructor(private fb: FormBuilder,
		toasterService: ToasterService,
		private route: ActivatedRoute,
		private router: Router,
    private loginService: LoginService,
    private exportService: ExportService,
		private crudServices: CrudServices) { 
      this.toasterService = toasterService;
      this.user = this.loginService.getUserDetails();
      this.company_id = this.user.userDet[0].company_id;
    
    }

  
  ngOnInit(): void {
    this.getCols()
    this.getProducts()
  }

  getCols() {
    this.cols = [
      { field: "org_name", header: "Organization Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, align: "", type: null },
      { field: "products", header: "Products", sort: true, filter: false, dropdown: [], footer: false, total: 0, align: "", type: null },
      { field: "emails", header: "Emails", sort: true, filter: false, dropdown: [], footer: false, total: 0, align: "", type: null },
      { field: "country", header: "Country", sort: true, filter: true, dropdown: [], footer: false, total: 0, align: "", type: null },
      { field: "contacts", header: "Contact", sort: true, filter: false, dropdown: [], footer: false, total: 0, align: "", type: null },


    ];
    this.filter = ['org_name', 'products', 'emails' , 'country', 'contacts'];
    this.getData()

  }

  getProducts() {
    this.crudServices.getAll<any>(Marketing.getProducts).subscribe(res => {
      this.products = res.data
    });
  }

  getData() {
    this.data = [];
    this.isLoading = true;
    let product =this.selectedProduct? this.selectedProduct.map(item => item.product_name):[]
    this.crudServices.postRequest<any>(Marketing.getData , {product : product}).subscribe(res => {
      console.log(res.data);

      this.isLoading = false;
      if (res.code === '100') {
        this.data = res.data
        this.pushDropdown(this.data)
      }
    });
  }

  getSelectedProduct(event) {
    this.selectedProduct = event.value;
    this.getData()
    
    }
  
  pushDropdown(arg) {
		let data = null;
		if (arg) {
			data = arg;
		} else {
			data = this.data;
		}
		let filter_cols = this.cols.filter(col => col.filter == true);
		filter_cols.forEach(element => {
			let unique = data.map(item =>
				item[element.field]
			).filter((value, index, self) =>
				self.indexOf(value) === index
			);
			let array = [];
			unique.forEach(item => {
				array.push({
					value: item,
					label: item
				});
			});
			element.dropdown = array;
		});
	}
  onAction(rowData, type, event) {
    if (type == 'import') {
       this.myModal.show()
      this.fileValue = this.fileInput.nativeElement.value
      console.log(this.fileInput.nativeElement.value);
      
    }

   
  }
	exportData(type) {
		let final_data = null;
		if (this.table.filteredValue == null) {
			final_data = this.data;
		} else {
			final_data = this.table.filteredValue;
		}
		let fileName = 'Import Data';
		let exportData = [];
		for (let i = 0; i < final_data.length; i++) {
			let obj = {};
			for (let j = 0; j < this.cols.length; j++) {
        obj[this.cols[j]["header"]] = final_data[i][this.cols[j]["field"]];
			}
			exportData.push(obj);
		}
	
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

  uploadCSVFile(event) {
    this.fileValue = this.fileInput.nativeElement.value
    this.filecsv = <Array<File>>event.target.files;
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      throw new Error('Cannot use multiple files');
      }
  
      const filereader: FileReader = new FileReader();
      const selectedfile =  event.target.files[0];
      filereader.readAsBinaryString(selectedfile);
      filereader.onload = (event:any)=>{
        let binarydata =  event.target.result;
        let workbook  = XLSX.read (binarydata,{type:'binary'})
        workbook.SheetNames.forEach(sheet=>{
          const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
          this.currentJsonArr = data
          console.log(this.currentJsonArr);
          
        })
        
      }
  
  
  }

  // onFileSelect(input) {
  //   this.fileValue = this.fileInput.nativeElement.value
  //   this.filecsv = <Array<File>>input.files;
  //   const files = input.files;


  //   var fileTypes = ['csv']; //acceptable file types

  //   if (files && files.length) {
  //     var extension = input.files[0].name.split('.').pop().toLowerCase(), //file extension from input file
  //       //Validating type of File Uploaded
  //       isSuccess = fileTypes.indexOf(extension) > -1;


  //     if (isSuccess) {
  //       const fileToRead = files[0];

  //       const fileReader = new FileReader();
  //       var that = this;
  //       fileReader.onload = function (fileLoadedEvent :any) {
  //         if( fileLoadedEvent.target.result) {
  //           const textFromFileLoaded = fileLoadedEvent.target.result;
  //           that.csvContent = textFromFileLoaded;
  //           console.log(textFromFileLoaded);
  //           console.log();
  //           var lines = that.csvContent.split('\n');
  
  //           console.log(lines);
            
  
  //           var result = [];
  
  //           var head = lines[0].split(',');
  //           let headers = []
  //           for (let h of head) {
  //             headers.push(h.trim())
  //           }
  //           for (var i = 1; i < lines.length ; i++) {
  //             if(lines[i] != '') {
  //               var obj = {};
  //               var currentline = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$).,/);

  //               //var currentline = lines[i]
    
  //               for (var j = 0; j < headers.length; j++) {
  //                 obj[headers[j]] = currentline[j];
  //               }
    
  //               result.push(obj);
  //             }
             
  //           }
  
  //           that.currentJsonArr = result
  
  //           console.log(that.currentJsonArr);
            
  //         }
      

  //       }
  //       fileReader.readAsText(fileToRead, 'UTF-8');


  //     }
  //   }
  // }

  importData() {
    this.isLoadingImport = true;
    let fileData: FormData = new FormData();
    for (let i = 0; i < this.filecsv.length; i++) {
      fileData.append("raw_org_data", this.filecsv[i], this.filecsv[i]['name']);

    }

    console.log(this.filecsv);
    
    this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
      //console.log(res.path, "repath")
      let path = res.uploads.raw_org_data[0].location;
      if (path) {

        console.log(this.currentJsonArr);
        
        
        if (this.currentJsonArr.length) {
          let array = []
          for (let val of this.currentJsonArr) {
            let products = [];
            let emails = [];
            let contacts = [];
            let country = '';
            let contact_name = '';
            if(val.product) {
               products = val.product.replace(/"/g, '').split(',')
            }

            if(val.email) {
               emails = val.email.replace(/"/g, '').split(',')
            }

            if(val.mobile) {
              contacts = val.mobile.toString().replace(/"/g, '').split(',')
           }

            if(val.country) {
              country = val.country
            }

            if(val.contact_name) {
              contact_name = val.contact_name
            }

           
            array.push({
              org_name: val.customer_name,
              country : country,
              products: products,
              emails: emails,
              contacts : contacts,
              created_date: Date.now(),
              contact_name : contact_name,
              company_id : this.company_id
            })
          }

          console.log(array);
          



          if (array.length && this.company_id) {
            this.crudServices.postRequest<any>(Marketing.addData, array).subscribe(response => {
              this.isLoadingImport = false
             
              this.getData();
              this.currentJsonArr = [];
              this.myModal.hide()
              this.fileInput.nativeElement.value = "";
            })
          } else  {
            this.toasterService.pop('warning', 'warning', 'Select Division');
          }
        }
      }
    });


  }

  onClose() {
    this.currentJsonArr = [];
    this.myModal.hide()
    this.fileInput.nativeElement.value = "";
  }

  customFilter(value, col, data) {
		let res = this.table.filter(value, col, data);
		
	}

	onFilter(e, dt) {
	
	}


}
