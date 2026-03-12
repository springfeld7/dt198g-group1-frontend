import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EndOfDate } from './end-of-date';
import { BackendService } from '../../../services/backend.service';
import { AuthService } from '../../../services/auth.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { Match } from '../../../models/match';

// Mock ConfirmModalComponent as standalone
@Component({
  selector: 'app-confirm-modal',
  template: '',
  standalone: true
})
class MockConfirmModalComponent {
  @Input() isOpen!: boolean;
  @Input() title!: string;
  @Input() message!: string;
  @Input() confirmText!: string;
}

describe('EndOfDate', () => {
  let component: EndOfDate;
  let fixture: ComponentFixture<EndOfDate>;

  const mockAuth = {
    getUserId: jasmine.createSpy('getUserId').and.returnValue('user1')
  };

  const mockBackend = {
    getEventById: jasmine.createSpy('getEventById').and.returnValue(
      Promise.resolve({
        pairsFirstRound: [
          { man: 'user1', woman: 'user2', _id: 'm1' } as Match,
          { man: 'user3', woman: 'user4', _id: 'm2' } as Match
        ],
        pairsSecondRound: [
          { man: 'user5', woman: 'user1', _id: 'm3' } as Match
        ],
        pairsThirdRound: [
          { man: 'user6', woman: 'user7', _id: 'm4' } as Match
        ]
      })
    ),
    toggleLike: jasmine.createSpy('toggleLike').and.returnValue(Promise.resolve({} as Match))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EndOfDate, MockConfirmModalComponent], // standalone components go here
      providers: [
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuth },
        { provide: BackendService, useValue: mockBackend }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EndOfDate);
    component = fixture.componentInstance;
    await component.ngOnInit();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should display previousDates in the template', async () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const listItems = compiled.querySelectorAll('.match-item');
    expect(listItems.length).toBe(component.previousDates.length);

    const approveButtons = compiled.querySelectorAll('.approve-btn');
    const rejectButtons = compiled.querySelectorAll('.reject-btn');
    expect(approveButtons.length).toBe(component.previousDates.length);
    expect(rejectButtons.length).toBe(component.previousDates.length);
  });

});
