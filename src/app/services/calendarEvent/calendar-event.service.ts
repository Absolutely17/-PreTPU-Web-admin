import {Observable} from "rxjs";
import {AppConfig} from "../../app.config";
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class CalendarEventService {

  constructor(
    private appConfig: AppConfig,
    private http: HttpClient
  ) {
  }

  getEvents(request: any): Observable<any> {
    return this.http.post(this.appConfig.webServiceApi('/calendarEvent/admin/events'), request);
  }

  getDetailedEvent(eventId: string): Observable<any> {
    return this.http.get(this.appConfig.webServiceApi(`/calendarEvent/admin/${eventId}/detailed`));
  }

  createCalendarEvent(request: any): Observable<any> {
    return this.http.post(this.appConfig.webServiceApi('/calendarEvent/admin/create'), request);
  }

  editEvent(request: any, id: string): Observable<any> {
    return this.http.put(this.appConfig.webServiceApi(`/calendarEvent/admin/${id}`), request);
  }

}
