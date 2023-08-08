import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogisticsChargesListComponent } from './logistics-charges-list.component';

describe('LogisticsChargesListComponent', () => {
  let component: LogisticsChargesListComponent;
  let fixture: ComponentFixture<LogisticsChargesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogisticsChargesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogisticsChargesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
