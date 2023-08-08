import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportLocalRequestListComponent } from './import-local-request-list.component';

describe('ImportLocalRequestListComponent', () => {
  let component: ImportLocalRequestListComponent;
  let fixture: ComponentFixture<ImportLocalRequestListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportLocalRequestListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportLocalRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
