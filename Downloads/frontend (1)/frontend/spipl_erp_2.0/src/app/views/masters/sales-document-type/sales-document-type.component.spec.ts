import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesDocumentTypeComponent } from './sales-document-type.component';

describe('SalesDocumentTypeComponent', () => {
  let component: SalesDocumentTypeComponent;
  let fixture: ComponentFixture<SalesDocumentTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesDocumentTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesDocumentTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
