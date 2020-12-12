import {Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';

@Injectable()
export class AppConfig {
  public readonly webServiceUrl;
  public readonly webServiceFullUrl;


  private static normalizeResourceUri(uri: string): string {
    if (uri.startsWith('/')) {
      return uri;
    }
    return `/${uri}`;
  }

  private static normalizeBaseUrl(url: string): string {
    if (url.endsWith('/')) {
      return url.substr(0, url.length - 2);
    }
    return url;
  }

  constructor(private sanitizer: DomSanitizer,
              private iconRegistry: MatIconRegistry) {
    this.webServiceUrl = AppConfig.normalizeBaseUrl(environment.webServiceUrl);
    this.webServiceFullUrl = environment.serviceFullUrl;
    iconRegistry
      .addSvgIcon('logout', sanitizer.bypassSecurityTrustResourceUrl('assets/img/logout.svg'));
  }

  webServiceApi(uri: string): string {
    return this.webServiceUrl + AppConfig.normalizeResourceUri(uri);
  }


}
