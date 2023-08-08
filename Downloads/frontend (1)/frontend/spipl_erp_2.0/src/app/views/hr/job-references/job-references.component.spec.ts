import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobReferencesComponent } from './job-references.component';

describe('JobReferencesComponent', () => {
  let component: JobReferencesComponent;
  let fixture: ComponentFixture<JobReferencesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobReferencesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobReferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
