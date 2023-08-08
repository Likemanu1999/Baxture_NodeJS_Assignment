import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Component({
	selector: 'body',
	template: '<router-outlet></router-outlet>'
})

export class AppComponent {

	constructor(private router: Router,
		private activatedRoute: ActivatedRoute,
		private titleService: Title) {
	}

	ngOnInit() {
		this.router.events.pipe(
			filter(event => event instanceof NavigationEnd),
		).subscribe(() => {
			const rt = this.getChild(this.activatedRoute);
			rt.data.subscribe(data => {
				let title = `SPIPL - ${data.title}`;
				if (environment.production) {
					title = data.title;
				}
				this.titleService.setTitle(title);
			});
		});
	}

	getChild(activatedRoute: ActivatedRoute) {
		if (activatedRoute.firstChild) {
			return this.getChild(activatedRoute.firstChild);
		} else {
			return activatedRoute;
		}
	}

}
