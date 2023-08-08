import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyAnnexureComponent } from './monthly-annexure.component';

describe('MonthlyAnnexureComponent', () => {
  let component: MonthlyAnnexureComponent;
  let fixture: ComponentFixture<MonthlyAnnexureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonthlyAnnexureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthlyAnnexureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
