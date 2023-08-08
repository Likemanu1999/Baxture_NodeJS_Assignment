import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsuranceMailEditorComponent } from './insurance-mail-editor.component';

describe('InsuranceMailEditorComponent', () => {
  let component: InsuranceMailEditorComponent;
  let fixture: ComponentFixture<InsuranceMailEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsuranceMailEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsuranceMailEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
