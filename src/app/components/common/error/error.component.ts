import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ErrorService} from '../../../services/error/error.service';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html'
})
export class ErrorComponent {

  public errorCode: string | number = 0;
  public errorMessage = '';
  public errorDetails?: string = null;
  private debug = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private errorService: ErrorService
  ) {

    if (!this.debug) {
      const error = this.errorService.lastSystemError;
      if (error) {
        this.errorCode = error.code;
        this.errorMessage = error.message;
        this.errorDetails = error.details;
      } else {
        window.location.replace('/');
      }
    }
  }
}
