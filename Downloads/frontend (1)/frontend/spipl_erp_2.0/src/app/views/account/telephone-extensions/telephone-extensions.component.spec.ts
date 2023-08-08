import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TelephoneExtensionsComponent } from './telephone-extensions.component';

describe('TelephoneExtensionsComponent', () => {
  let component: TelephoneExtensionsComponent;
  let fixture: ComponentFixture<TelephoneExtensionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TelephoneExtensionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TelephoneExtensionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
