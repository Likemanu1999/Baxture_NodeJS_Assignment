import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesLcComponent } from './sales-lc.component';

describe('SalesLcComponent', () => {
  let component: SalesLcComponent;
  let fixture: ComponentFixture<SalesLcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesLcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesLcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
