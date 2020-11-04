import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { TemplatePortalDirective } from '@angular/cdk/portal';

@Directive({ selector: '[sbDataTableTemplate]ng-template' })
export class SbDataTableTemplateDirective extends TemplatePortalDirective {
  @Input() sbDataTableTemplate: string;
  constructor(templateRef: TemplateRef<any>, viewContainerRef: ViewContainerRef) {
    super(templateRef, viewContainerRef);
  }
}
