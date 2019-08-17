document.addEventListener('DOMContentLoaded', function() {
  const editorOptions = {
    mode: "text/x-ruby",
    matchBrackets: true,
    indentUnit: 2,
    lineNumbers: true,
    theme: 'solarized'
  };

  var editor = CodeMirror.fromTextArea(document.getElementById("editor"),editorOptions );
  var transformEditor = CodeMirror.fromTextArea(document.getElementById("transform-editor"), editorOptions);
  var outputEditor = CodeMirror.fromTextArea(document.getElementById("output-editor"), editorOptions);
  var astEditor = CodeMirror.fromTextArea(document.getElementById("ast-editor"), { ...editorOptions, readOnly: true });



  updateAst(editor.getValue(), transformEditor.getValue());

  indentAll();

  function indentAll() {
    indentCode(editor);
    indentCode(transformEditor);
    indentCode(outputEditor);
  }


  // https://davidwalsh.name/javascript-debounce-function
  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  function updateAst(code, transform) {
    $.ajax({
      url: "/ast",
      type: "post",
      data: { code: code, transform: transform},
      success: function(data) {
        astEditor.setValue(data.ast);
        outputEditor.setValue(data.output);
      },
      error: function(data) {}
    });


  }

  function indentCode(ed) {
    ed.setSelection({
      'line':ed.firstLine(),
      'ch':0,
      'sticky':null
    },{
      'line':ed.lastLine(),
      'ch':0,
      'sticky':null
    },
      {scroll: false});
    //auto indent the selection
    ed.indentSelection("smart");
    ed.setCursor({line: ed.firstLine(), ch: 0 });
  }


  editor.on("change",debounce(function(cm, change) {
    let code = cm.getValue();
    let transform = transformEditor.getValue();
    updateAst(code, transform);
  }, 250));



  transformEditor.on("change",debounce(function(cm, change) {
    console.log('transform change');
    let transform = cm.getValue();
    let code = editor.getValue();
    updateAst(code, transform);
  }, 250));

  $('#create-gist').click(function() {
    $.ajax({
      url: "/ast/gist",
      type: "post",
      data: { code: editor.getValue(), transform: transformEditor.getValue()},
      success: function(data) {
        console.log(data);
      },
      error: function(data) {
        console.log('Gist creation failed');
      }
    });


  });

    $('#switch-theme').on('click', function(e) {
      const theme = e.target.checked ? 'solarized dark' : 'solarized';
      editor.setOption('theme', theme);
      astEditor.setOption('theme', theme);
      transformEditor.setOption('theme', theme);
      outputEditor.setOption('theme', theme);

      $primarynav = document.getElementById('primary-nav');

      if(e.target.checked) {
      $primarynav.classList.replace('navbar-light', 'navbar-dark');
      $primarynav.classList.replace('bg-light', 'bg-dark');
      } else {
      $primarynav.classList.replace('navbar-dark', 'navbar-light');
      $primarynav.classList.replace('bg-dark', 'bg-light');
      }

    });

});
