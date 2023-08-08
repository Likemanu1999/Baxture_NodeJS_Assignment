import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DealLauncherComponent } from './deal-launcher.component';

describe('DealLauncherComponent', () => {
  let component: DealLauncherComponent;
  let fixture: ComponentFixture<DealLauncherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DealLauncherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DealLauncherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
