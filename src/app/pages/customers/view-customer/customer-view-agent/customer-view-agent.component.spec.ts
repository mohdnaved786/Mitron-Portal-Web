import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerViewAgentComponent } from './customer-view-agent.component';

describe('CustomerViewAgentComponent', () => {
  let component: CustomerViewAgentComponent;
  let fixture: ComponentFixture<CustomerViewAgentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerViewAgentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerViewAgentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
