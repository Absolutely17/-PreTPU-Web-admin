CKEDITOR.plugins.add('responsiveTable', {
  init: function (editor) {
    wrapTableIntoDiv(editor);
  }
});

function wrapTableIntoDiv(editor) {
  // При вставке таблицы с помощью кнопок тулбара
  editor.on('insertElement', function (event) {
    if (event.data.getName() !== 'table') {
      return;
    }
    let div = new CKEDITOR.dom.element('div').setStyles({
     'overflow-x': 'auto'
    });
    event.data.appendTo(div);
    event.data = div;
  }, null, null, 1);

  // При вставке таблицы из сторонних мест
  editor.on('paste', function (event) {
    event.data.dataValue = event.data.dataValue.replace(/<table/gi, '<div style="overflow-x: auto"><table');
    event.data.dataValue = event.data.dataValue.replace(/<\/table>/gi, '</table></div>');
  });
}
