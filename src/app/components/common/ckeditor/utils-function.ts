import * as juice from "juice";
import {bottomTags, styles, topTags} from "./ckeditor-constants";

export function transformResultTextToHtml(text: string): string {
  let htmlText = juice.inlineContent(text, styles);
  var rgbHex = /#([0-9A-F][0-9A-F])([0-9A-F][0-9A-F])([0-9A-F][0-9A-F])/gi
  htmlText.replace(rgbHex, function (m, r, g, b) {
    return 'rgb(' + parseInt(r, 16) + ','
      + parseInt(g, 16) + ','
      + parseInt(b, 16) + ')';
  })
  return htmlText.startsWith('<!DOCTYPE HTML>') ? htmlText : (topTags + htmlText + bottomTags);
}
