import {bottomTags, topTags} from "./ckeditor-constants";

const STYLE_FOR_IMAGE = 'style=\'max-width: 100%;\'';

export function transformResultTextToHtml(htmlText: string): string {
  // let rgbHex = /#([0-9A-F][0-9A-F])([0-9A-F][0-9A-F])([0-9A-F][0-9A-F])/gi
  // htmlText.replace(rgbHex, function (m, r, g, b) {
  //   return 'rgb(' + parseInt(r, 16) + ','
  //     + parseInt(g, 16) + ','
  //     + parseInt(b, 16) + ')';
  // });
  htmlText = htmlText.replace(/<div style="overflow-x:auto">(?!(\n<table)|(<table))/g, '<div>');
  // Накидываем всем img стиль, дабы они не уходили за границы
  let imgTag = /<img[^>]+.*?>/gmi
  let prevPos = 0;
  const arrayMatches = htmlText.match(imgTag);
  if (arrayMatches && arrayMatches.length > 0) {
    arrayMatches.forEach(it => {
      const pos = htmlText.indexOf(it, prevPos);
      htmlText = htmlText.substr(0, pos) + '<img ' + STYLE_FOR_IMAGE + htmlText.substr(pos + 4);
    });
  }

  return htmlText.startsWith('<!DOCTYPE HTML>') ? htmlText : (topTags + htmlText + bottomTags);
}
