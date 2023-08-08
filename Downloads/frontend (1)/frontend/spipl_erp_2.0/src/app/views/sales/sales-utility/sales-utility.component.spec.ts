import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesUtilityComponent } from './sales-utility.component';

describe('SalesUtilityComponent', () => {
  let component: SalesUtilityComponent;
  let fixture: ComponentFixture<SalesUtilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesUtilityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesUtilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
