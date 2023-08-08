import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialArrivalChartComponent } from './material-arrival-chart.component';

describe('MaterialArrivalChartComponent', () => {
  let component: MaterialArrivalChartComponent;
  let fixture: ComponentFixture<MaterialArrivalChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaterialArrivalChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialArrivalChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
