/**
 * Сервис для работы с ошибками
 */
import {Injectable} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {FormGroup} from '@angular/forms';
import {MessageDialogRef, MessageService} from '../message/message.service';

export interface ErrorHandleUserDecision {
  type: 'error' | 'warning';
  decision?: boolean;
}

export interface SystemErrorData {
  code: string | number;
  message: string | null;
  details: string | null;
}

@Injectable()
export class ErrorService {

  private _lastSystemError?: SystemErrorData = null;

  /**
   * @see _lastSystemError
   */
  public get lastSystemError(): SystemErrorData | null {
    return this._lastSystemError;
  }

  constructor(
    private router: Router,
    private messageService: MessageService,
    private dialog: MatDialog
  ) {
  }

  handleFormError(err: any, group: FormGroup): void {
    if (err instanceof HttpErrorResponse && err.status === 400) {
      const errors = err.error.errors;
      if (errors) {
        errors.forEach(error => {
          if (!error.name) {
            this.handleServiceError(err);
            return;
          }
          const f = error.name.replace(/\[(\d+)]/gi, '.$1');
          if (group.get(f) === null) {
            this.handleServiceError(err);
            return;
          }
          group.get(f).setErrors({server: error.error});
          group.get(f).markAsTouched();
        });
      } else {
        this.handleServiceError(err);
      }
    } else {
      this.handleServiceError(err);
    }
  }

  /**
   * Обработка ошибки от сервиса
   */
  public handleServiceError(err: any): Promise<ErrorHandleUserDecision> {
    let code: number | string = 'Неизвестная системная ошибка';
    let message = 'Произошла ошибка, которую не удалось обработать';
    let details: string = null;
    let dialog = false;
    let errorParsed = false;

    if (err instanceof HttpErrorResponse) {
      const httpErr = err as HttpErrorResponse;
      const type = httpErr.error && httpErr.error.type;
      code = httpErr.status;
      if (code) {
        switch (code) {
          case 403:
            message = 'Доступ запрещен';
            errorParsed = true;
            break;
          case 401:
            return;
          case 503:
            code = 'Техническое обслуживание';
            message = 'В данный момент сайт находится на техническом обслуживании. Приносим свои извинения за временные неудобства.';
            errorParsed = true;
            break;
        }
      }
      if (!errorParsed) {
        if (!code || code === 504) {
          if (!code) {
            code = 'Сервер не отвечает';
          }
          message = 'Сервер временно недоступен, попробуйте обновить страницу или обратиться позже';
          errorParsed = true;
        } else if (type) {
          switch (type) {
            case 'BusinessWarning':
              return this.showWarningConfirmErrorDialog(httpErr.error.message)
                .afterClosed()
                .toPromise()
                .then<ErrorHandleUserDecision, any>(it => {
                  return {
                    type: 'warning',
                    decision: it
                  };
                });
            case 'SystemError':
              message = httpErr.error.message;
              details = httpErr.error.stacktrace;
              errorParsed = true;
              break;
            case 'BusinessError':
              dialog = true;
              details = null;
              message = httpErr.error.message;
              errorParsed = true;
              break;
            case 'EntityNotFoundError':
              dialog = false;
              details = null;
              message = 'Запрашиваемая страница не найдена';
              errorParsed = true;
              break;
            case 'ServerValidationError':
              dialog = false;
              details = null;
              message = httpErr.error.message;
              errorParsed = true;
              break;
          }
        }
      }
    }

    if (!errorParsed) {
      code = 'Неизвестная ошибка';
      message = 'Произошла ошибка, которую не удалось обработать';
      details = JSON.stringify(err);
    }

    if (dialog) {
      this.showErrorDialog(message);
    } else {
      this.showSystemErrorPage({
        code,
        message,
        details
      });
    }
    return Promise.resolve<ErrorHandleUserDecision>({
      type: 'error'
    });
  }

  showAccessDeniedError(): void {
    this.showSystemErrorPage({
      code: 403,
      message: 'У Вас нет прав на просмотр этой страницы, обратитесь к Администратору',
      details: ''
    });
  }

  /**
   * Показывает диалог с ошибкой
   */
  showErrorDialog(message: string): void {
    this.messageService.showErrorMessage(message);
  }

  /**
   * Показывает диалог с ошибкой
   */
  public showWarningConfirmErrorDialog(message: string): MessageDialogRef {
    return this.messageService.showWarningConfirmErrorDialog(message);
  }

  /**
   * Отображение системной ошибки (перенапраление на страницу системной ошибки)
   */
  public showSystemErrorPage(systemError: SystemErrorData): void {
    this._lastSystemError = systemError;
    this.router.navigate(['/error'], {
      replaceUrl: false,
      skipLocationChange: true
    });
  }
}
