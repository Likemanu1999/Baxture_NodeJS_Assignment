import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TdsSettingsComponent } from './tds-settings.component';

describe('TdsSettingsComponent', () => {
  let component: TdsSettingsComponent;
  let fixture: ComponentFixture<TdsSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TdsSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TdsSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
