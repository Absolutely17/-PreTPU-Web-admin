CKEDITOR.editorConfig = function( config ) {
  config.toolbarGroups = [
    { name: 'clipboard', groups: [ 'clipboard', 'undo' ] },
    { name: 'editing', groups: [ 'find', 'selection', 'spellchecker', 'editing' ] },
    { name: 'links', groups: [ 'links' ] },
    { name: 'insert', groups: [ 'insert' ] },
    { name: 'forms', groups: [ 'forms' ] },
    { name: 'tools', groups: [ 'tools' ] },
    { name: 'document', groups: [ 'mode', 'document', 'doctools' ] },
    { name: 'others', groups: [ 'others' ] },
    '/',
    { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
    { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi', 'paragraph' ] },
    { name: 'styles', groups: [ 'styles' ] },
    { name: 'colors', groups: [ 'colors' ] },
    { name: 'about', groups: [ 'about' ] }
  ];

  config.removeButtons = 'Underline,Subscript,Superscript,PasteFromWord';

  config.filebrowserUploadUrl = 'api/media/admin/img/upload';

  config.removeDialogTabs = 'image:advanced;image:Link;link:advanced;link:target;link:upload';

  config.autoGrow_minHeight = 250;
  config.autoGrow_maxHeight = 600;

  config.extraPlugins = 'link,fakeobjects,colorbutton,panelbutton';

  config.linkDefaultProtocol = 'https://';
};

CKEDITOR.on( 'instanceReady', function( ev ) {
  const editor = ev.editor;
  editor.dataProcessor.htmlFilter.addRules({
    elements: {
      table: function (e) {
        e.attributes.style = 'max-width: 100%;' + e.attributes.style;
      },
      td: function(e) {
        if (e.attributes.style) {
          e.attributes.style = e.attributes.style.replace(/width:\d+px/, '');
          e.attributes.style = e.attributes.style.replace(/height:\d+px/, '');
        }
      }
    }
  });
  editor.dataProcessor.dataFilter.addRules({
    elements: {
      table: function (e) {
        e.attributes.style = 'max-width: 100%;' + e.attributes.style;
      },
      td: function(e) {
        if (e.attributes.style) {
          e.attributes.style = e.attributes.style.replace(/width:\d+px/, '');
          e.attributes.style = e.attributes.style.replace(/height:\d+px/, '');
        }
      }
    }
  });
});
