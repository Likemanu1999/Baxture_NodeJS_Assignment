import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KnockOfLicenseComponent } from './knock-of-license.component';

describe('KnockOfLicenseComponent', () => {
  let component: KnockOfLicenseComponent;
  let fixture: ComponentFixture<KnockOfLicenseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KnockOfLicenseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KnockOfLicenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
