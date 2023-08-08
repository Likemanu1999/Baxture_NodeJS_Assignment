import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyGradeRatesComponent } from './daily-grade-rates.component';

describe('DailyGradeRatesComponent', () => {
	let component: DailyGradeRatesComponent;
	let fixture: ComponentFixture<DailyGradeRatesComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [DailyGradeRatesComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DailyGradeRatesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
