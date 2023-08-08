import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DispachTransporterListComponent } from './dispatch-transporters-list.component';

describe('DispachTransporterListComponent', () => {
  let component: DispachTransporterListComponent;
  let fixture: ComponentFixture<DispachTransporterListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DispachTransporterListComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DispachTransporterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
