import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialReceivedChartComponent } from './material-received-chart.component';

describe('MaterialReceivedChartComponent', () => {
  let component: MaterialReceivedChartComponent;
  let fixture: ComponentFixture<MaterialReceivedChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaterialReceivedChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialReceivedChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
