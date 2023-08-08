import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportSalesComponent } from './import-sales.component';

describe('ImportSalesComponent', () => {
  let component: ImportSalesComponent;
  let fixture: ComponentFixture<ImportSalesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportSalesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
