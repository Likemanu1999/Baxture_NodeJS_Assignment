import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpiplSsurishaListComponent } from './spipl-ssurisha-list.component';

describe('SpiplSsurishaListComponent', () => {
  let component: SpiplSsurishaListComponent;
  let fixture: ComponentFixture<SpiplSsurishaListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpiplSsurishaListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpiplSsurishaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
