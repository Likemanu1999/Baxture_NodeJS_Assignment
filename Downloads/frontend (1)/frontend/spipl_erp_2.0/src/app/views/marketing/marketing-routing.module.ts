import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { OrganizationDataImportComponent } from './organization-data-import/organization-data-import.component';



const routes: Routes = [
	{
		path: '',
		data: {
			title: 'Marketing'
		},
		children: [
			{
				path: '',
				redirectTo: 'marketing'
			},

			{
				path: 'organization-data-import',
				component: OrganizationDataImportComponent,
				data: {
					title: 'Data Import'
				}
			},

			// {
			// 	path: 'send-mail',
			// 	component: SendMailComponent,
			// 	data: {
			// 		title: 'Send Mail'
			// 	}
			// },
			
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})

export class MarketingRoutingModule { }
