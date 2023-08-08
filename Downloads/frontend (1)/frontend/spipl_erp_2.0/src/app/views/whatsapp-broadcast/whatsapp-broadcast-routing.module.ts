import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../_helpers/auth.guard';
import { StateGodownMasterComponent } from './state-godown-master/state-godown-master.component';
import { WhatsappGradeDetailsComponent } from './whatsapp-grade-details/whatsapp-grade-details.component';
import { ChatsComponent } from './chats/chats.component';
import { CentralizeCommunicationComponent } from './centralize-communication/centralize-communication.component';
import { WhatsappBroadcastZonewizeComponent } from './whatsapp-broadcast-zonewize/whatsapp-broadcast-zonewize.component';
import { CategoryWiseBroadcastComponent } from './category-wise-broadcast/category-wise-broadcast.component';
import { BroadcastEmailComponent } from './broadcast-email/broadcast-email.component';
import { WhatsappWebSurishaComponent } from './whatsapp-web-surisha/whatsapp-web-surisha.component';

import { SalesOfferReleaseComponent } from './sales-offer-release/sales-offer-release.component';


const routes: Routes = [
	{
		path: '',
		data: {
			title: 'Whatsapp Broadcast'
		},
		children: [
			{
				path: '',
				redirectTo: 'whatsapp'
			},


			{
				path: 'state-godown-master',
				component: StateGodownMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'State Godown Master'
				}
			},

			{
				path: 'whatsapp-grade-details',
				component: WhatsappGradeDetailsComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Whatsapp Grade Details'
				}
			},
			{
				path: 'chats',
				component: ChatsComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Chats'
				}
			},
			{
				path: 'centralize-communication',
				component: CentralizeCommunicationComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Centralize Communication'
				}
			},
			{
				path: 'category-wise-broadcast',
				component: CategoryWiseBroadcastComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Category Wise Broadcast'
				}
			},
			{
				path: 'broadcast-email',
				component: BroadcastEmailComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Broadcast Email'
				}
			},

			{
				path: 'whatsapp-web-surisha',
				component: WhatsappWebSurishaComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Chats Surisha'
				}
			},

			
			{
				path: 'sales-offer-release',
				component: SalesOfferReleaseComponent,
				canActivate: [AuthGuard],
				data: {
					title: ' Sales Offer Release'
				}
			}

		]
	}
];



@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})

export class WhatsappBroadcastRoutingModule { }
