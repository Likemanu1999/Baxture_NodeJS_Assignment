import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnsoldImportLocalComponent } from './unsold-import-local.component';

describe('UnsoldImportLocalComponent', () => {
  let component: UnsoldImportLocalComponent;
  let fixture: ComponentFixture<UnsoldImportLocalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnsoldImportLocalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnsoldImportLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
