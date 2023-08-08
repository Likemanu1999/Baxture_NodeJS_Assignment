import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyStockAllocationComponent } from './daily-stock-allocation.component';

describe('DailyStockAllocationComponent', () => {
  let component: DailyStockAllocationComponent;
  let fixture: ComponentFixture<DailyStockAllocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DailyStockAllocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyStockAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
