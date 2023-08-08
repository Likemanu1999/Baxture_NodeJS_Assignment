import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesAnalyticsBuyingTrendsComponent } from './sales-analytics-buying-trends.component';

describe('SalesAnalyticsBuyingTrendsComponent', () => {
  let component: SalesAnalyticsBuyingTrendsComponent;
  let fixture: ComponentFixture<SalesAnalyticsBuyingTrendsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesAnalyticsBuyingTrendsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesAnalyticsBuyingTrendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
