import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportCollectionStatementComponent } from './import-collection-statement.component';

describe('ImportCollectionStatementComponent', () => {
  let component: ImportCollectionStatementComponent;
  let fixture: ComponentFixture<ImportCollectionStatementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportCollectionStatementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportCollectionStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
