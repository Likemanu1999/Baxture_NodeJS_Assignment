import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyJobReferencesComponent } from './my-job-references.component';

describe('MyJobReferencesComponent', () => {
  let component: MyJobReferencesComponent;
  let fixture: ComponentFixture<MyJobReferencesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyJobReferencesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyJobReferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
