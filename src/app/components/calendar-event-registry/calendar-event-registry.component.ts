import {
  Component,
  ChangeDetectionStrategy,
  OnInit, ViewChild,
} from '@angular/core';
import {
  isSameMonth,
} from 'date-fns';
import {
  CalendarDateFormatter,
  CalendarEvent,
  CalendarView,
  DAYS_OF_WEEK,
} from 'angular-calendar';
import {CustomDateFormatter} from "./custom-date-formatter";
import {StudyGroupService} from "../../services/studyGroup/study-group.service";
import {DialogService} from "../../services/dialog/dialog.service";
import {UserChooseDialogComponent} from "../dialog/user-choose-dialog/user-choose-dialog.component";
import {CalendarEventService} from "../../services/calendarEvent/calendar-event.service";
import {
  CalendarEventEditingDialogComponent,
  CalendarEventGroupTarget
} from "../dialog/calendar-create-event-dialog/calendar-event-editing-dialog.component";
import {Subject} from "rxjs";
import { collapseAnimation } from 'angular-calendar';
import {MatSelect} from "@angular/material/select";
import {DialogMode} from "../dialog/dialog-mode";
import {TdLoadingService} from "@covalent/core/loading";

@Component({
  selector: 'app-calendar-event-registry',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./calendar-event-registry.component.scss'],
  templateUrl: './calendar-event-registry.component.html',
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter,
    },
  ],
  animations: [collapseAnimation]
})
export class CalendarEventRegistryComponent implements OnInit {

  @ViewChild("groupSelect") groupSelectEl: MatSelect;

  view: CalendarView = CalendarView.Month;

  locale: string = 'ru';

  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;

  weekendDays: number[] = [DAYS_OF_WEEK.SUNDAY];

  viewDate: Date = new Date();

  studyGroups: any[];

  // Кому отображать события
  currentUser: string;
  currentGroup: string;
  isAll: boolean = true;

  refresh: Subject<any> = new Subject();

  events: CalendarEvent[] = [];

  activeDayIsOpen: boolean = true;

  loaderName = 'loader';

  constructor(
    private studyGroupService: StudyGroupService,
    private dialogService: DialogService,
    private calendarEventService: CalendarEventService,
    private loadingService: TdLoadingService
  ) {}

  ngOnInit(): void {
    this.studyGroupService.getTable().subscribe(it => {
      if (it) {
        this.studyGroups = it;
      }
    });
    this.fetchEvents();
  }

  fetchEvents() {
    this.loadingService.register(this.loaderName);
    const request = {
      groupId: this.currentGroup,
      userId: this.currentUser,
      fetchAll: this.isAll
    }
    this.calendarEventService.getEvents(request).subscribe(events => {
      if (events) {
        this.events = events.map(event => {
          return {
            title: event.title,
            start: new Date(event.timestamp * 1000),
            meta: {
              id: event.id
            }
          }
        });
        this.refresh.next();
      }
    }).add(() => this.loadingService.resolve(this.loaderName));
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      this.activeDayIsOpen = true;
      this.viewDate = date;
    }
  }

  addEvent(): void {
    const currentTargetGroup = this.getTargetGroup();
    this.dialogService.show(CalendarEventEditingDialogComponent, {
      selectDate: this.viewDate,
      groupTarget: currentTargetGroup,
      selectedUser: this.currentUser,
      selectedGroup: this.currentGroup,
      mode: DialogMode.CREATE
    }, '', '', true).afterClosed().subscribe((it) => {
      if (it) {
        this.fetchEvents()
      }
    });
  }

  private getTargetGroup(): CalendarEventGroupTarget {
    if (this.currentUser) {
      return CalendarEventGroupTarget.SELECTED_USERS;
    }
    if (this.currentGroup) {
      return CalendarEventGroupTarget.STUDY_GROUP;
    }
    if (this.isAll) {
      return CalendarEventGroupTarget.ALL;
    }
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  selectUser() {
    this.dialogService.show(UserChooseDialogComponent, {
      selectedUsers: this.currentUser ? this.currentUser : null
    }, '', '', true).afterClosed().subscribe(it => {
      if(it && it.length > 0) {
        this.currentUser = it[0];
        this.isAll = false;
        this.currentGroup = null;
        this.groupSelectEl.value = null;
        this.fetchEvents();
      }
    });
  }

  selectGroup(change: any) {
    this.currentGroup = change.value;
    this.isAll = false;
    this.currentUser = null;
    this.fetchEvents();
  }

  selectAll() {
    this.isAll = true;
    this.currentGroup = null;
    this.groupSelectEl.value = null;
    this.currentUser = null;
    this.fetchEvents();
  }

  editEvent(event: any) {
    this.dialogService.show(CalendarEventEditingDialogComponent, {
      currentEventId: event.meta.id,
      mode: DialogMode.EDIT
    }, '', '', true).afterClosed().subscribe((it) => {
      if (it) {
        this.fetchEvents()
      }
    });
  }
}
