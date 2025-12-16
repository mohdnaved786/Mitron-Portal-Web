import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonOtpPopupComponent } from './common-otp-popup.component';

describe('CommonOtpPopupComponent', () => {
  let component: CommonOtpPopupComponent;
  let fixture: ComponentFixture<CommonOtpPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonOtpPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonOtpPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
