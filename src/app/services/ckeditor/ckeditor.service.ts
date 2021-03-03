import {Injectable} from "@angular/core";
import {ArticleChooseDialogComponent} from "../../components/dialog/article-choose-dialog/article-choose-dialog.component";
import {AppConfig} from "../../app.config";
import {TokenStorageService} from "../token/token-storage.service";
import {DialogService} from "../dialog/dialog.service";
import {MenuItemChooseDialogComponent} from "../../components/dialog/menu-item-choose-dialog/menu-item-choose-dialog.component";

@Injectable({
  providedIn: 'root'
})
export class CkeditorService {

  constructor(
    private appConfig: AppConfig,
    private tokenService: TokenStorageService,
    private dialogService: DialogService
  ) {
  }

  fileUploadRequest(event: any) {
    try {
      const fileLoader = event.data.fileLoader;
      const formData = new FormData();
      const xhr = fileLoader.xhr;
      xhr.withCredentials = true;
      xhr.open('POST', this.appConfig.webServiceApi('/media/admin/img/upload'), true);
      xhr.setRequestHeader('Authorization', 'Bearer ' + this.tokenService.getToken());
      formData.append('image', fileLoader.file);
      fileLoader.xhr.send(formData);
      event.stop();
    } catch (e) {
      console.warn(e);
    }
  }

  fileUploadResponse(event: any) {
    try {
      event.stop();
      const data = event.data;
      const xhr = data.fileLoader.xhr;
      const response = xhr.responseText;
      if (xhr.status > 300) {
        data.message = 'upload fail';
        event.cancel();
      } else {
        data.url = this.appConfig.webServiceFullUrl + '/media/img/' + response;
      }
    } catch (e) {
      console.warn(e);
    }
  }

  selectArticleForDeepLink(event: any) {
    this.changeStateBackgroundCKEditor(false);
    this.dialogService.show(ArticleChooseDialogComponent, {
        multiple: false,
        selectedArticles: event.data.itemId.getValue()
      }, null, null, true
    ).afterClosed().subscribe(it => {
      if (it) {
        event.data.itemId.setValue(it);
        event.data.type.setValue('article');
      }
      this.changeStateBackgroundCKEditor(true);
    });
  }

  selectMenuItemForDeepLink(event: any) {
    this.changeStateBackgroundCKEditor(false);
    this.dialogService.show(MenuItemChooseDialogComponent, {
        multiple: false,
        selectedMenuItem: event.data.itemId.getValue()
      }, null, null, true
    ).afterClosed().subscribe(it => {
      if (it) {
        event.data.itemId.setValue(it.id);
        const type = it.type === 'FEED_LIST' ? 'articleList' : 'linksList';
        event.data.type.setValue(type);
      }
      this.changeStateBackgroundCKEditor(true);
    });
  }

  private changeStateBackgroundCKEditor(enable: boolean) {
    this.setZIndexElements('cke_dialog_background_cover', enable ? 10000 : 1);
    this.setZIndexElements('cke_reset_all cke_dialog_container cke_1 cke_editor_editor1_dialog ', enable ? 10010 : 1);
  }

  private setZIndexElements(classForSearch: string, zIndex: number) {
    const items: any = document.getElementsByClassName(classForSearch);
    for (let i = 0; i < items.length; i++) {
      items[i].style.zIndex = zIndex;
    }
  }
}
