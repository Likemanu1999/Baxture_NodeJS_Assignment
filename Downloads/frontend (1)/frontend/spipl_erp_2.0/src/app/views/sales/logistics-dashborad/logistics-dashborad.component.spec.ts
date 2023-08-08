import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogisticsDashboradComponent } from './logistics-dashborad.component';

describe('LogisticsDashboradComponent', () => {
  let component: LogisticsDashboradComponent;
  let fixture: ComponentFixture<LogisticsDashboradComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogisticsDashboradComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogisticsDashboradComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
