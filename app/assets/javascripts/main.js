document.addEventListener('DOMContentLoaded', function() {
  const editorOptions = {
    mode: "text/x-ruby",
    matchBrackets: true,
    indentUnit: 2,
    lineNumbers: true,
    theme: 'solarized'
  };

  const astEditorOptions = {
    mode: "text/x-ruby",
    matchBrackets: true,
    indentUnit: 2,
    theme: 'solarized',
    readOnly: true
  };


  var editor = CodeMirror.fromTextArea(document.getElementById("editor"),editorOptions );
  var transformEditor = CodeMirror.fromTextArea(document.getElementById("transform-editor"), editorOptions);
  var outputEditor = CodeMirror.fromTextArea(document.getElementById("output-editor"), editorOptions);
  var astEditor = CodeMirror.fromTextArea(document.getElementById("ast-editor"), astEditorOptions);



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
        buildTreeView(data.treeData);
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


    $('#show-console').on('click', function(e) {
      console.log('show console');
      if(e.target.checked) {
        $('#console').css({ display: "block" });
      } else
      {
        $('#console').css({ display: "none" });
      }

    });

  function initTree() {
    var trees = document.querySelectorAll('[role="tree"]');

    for (var i = 0; i < trees.length; i++) {
      var t = new TreeLinks(trees[i]);
      t.init();
    }
  }

  function buildTreeView(ast) {
    let treeData = JSON.parse(ast);
    console.log(treeData);

    function traverse(node) {

      let treeHtml = '';
      if(node) {
        treeHtml += `<li role="treeitem" aria-expanded="true"><span>${node['type']}</span>`;
        treeHtml += `<ul>`;

        // Create location node
        if(node['location']) {
          let { begin, end, expression, keyword, name, operator }  = node['location'];

          treeHtml += `<li role="treeitem" aria-expanded="false"><span>location</span><ul>`;

          // Create begin node
          if(begin) {
            let { begin_pos, end_pos } = begin;
          treeHtml += `<li role="treeitem" aria-expanded="false"><span>begin</span>`;
          treeHtml += `<ul>`;
          treeHtml += `<li role="none"><span>begin_pos: ${begin_pos} </span></li>`;
          treeHtml += `<li role="none"><span>end_pos: ${end_pos} </span></li>`;
          treeHtml += `</ul>`;
            treeHtml += `</li>`;
          } else {
          treeHtml += `<li role="none"><span>begin: null</span></li>`;
          }


          // Create end node
          if(end) {
            let { begin_pos, end_pos } = end;
          treeHtml += `<li role="treeitem" aria-expanded="false"><span>end</span>`;
          treeHtml += `<ul>`;
          treeHtml += `<li role="none"><span>begin_pos: ${begin_pos} </span></li>`;
          treeHtml += `<li role="none"><span>end_pos: ${end_pos} </span></li>`;
          treeHtml += `</ul>`;
            treeHtml += `</li>`;
          } else {
          treeHtml += `<li role="none"><span>end: null</span></li>`;
          }


          // Create expression node
          if(expression) {
            let { begin_pos, end_pos }  = expression;
            treeHtml += `<li role="treeitem" aria-expanded="false"><span>expression</span><ul>`;
            treeHtml += `<li role="none"><span>begin_pos: ${begin_pos}</span></li>`;
            treeHtml += `<li role="none"><span>end_pos: ${end_pos}</span></li>`;
            treeHtml += `</ul></li>`;
          }

          // Create keyword node

          if(keyword) {
            let { begin_pos, end_pos }  = keyword;
            treeHtml += `<li role="treeitem" aria-expanded="false"><span>keyword</span><ul>`;
            treeHtml += `<li role="none"><span>begin_pos: ${begin_pos}</span></li>`;
            treeHtml += `<li role="none"><span>end_pos: ${end_pos}</span></li>`;
            treeHtml += `</ul></li>`;
          }

          // Create name node
          if(name) {
            let { begin_pos, end_pos }  = name;
            treeHtml += `<li role="treeitem" aria-expanded="false"><span>name</span><ul>`;
            treeHtml += `<li role="none"><span>begin_pos: ${begin_pos}</span></li>`;
            treeHtml += `<li role="none"><span>end_pos: ${end_pos}</span></li>`;
            treeHtml += `</ul></li>`;
          }

          // Create operator node
          if(operator) {
            let { begin_pos, end_pos }  = operator;
            treeHtml += `<li role="treeitem" aria-expanded="false"><span>operator</span><ul>`;
            treeHtml += `<li role="none"><span>begin_pos: ${begin_pos}</span></li>`;
            treeHtml += `<li role="none"><span>end_pos: ${end_pos}</span></li>`;
            treeHtml += `</ul></li>`;
          } else {
            treeHtml += `<li role="none"><span>operator: null</span></li>`;

          }


          treeHtml += `</ul></li>`;
        }


        if(node.children) {
          treeHtml += `<li role="treeitem" aria-expanded="false"><span>children: []</span><ul>`;
          node.children.forEach(child => {
            if(typeof child === 'object') {
              treeHtml += traverse(child);
            } else {
              treeHtml += `<li role="none"><span>"${child}"</span></li>`;
            }
          });

          treeHtml += `</ul></li>`;
        }
        treeHtml += `</ul>`;
        treeHtml += '</li>';
      }

      return treeHtml;
    }


    document.getElementById('ast-tree').innerHTML = traverse(treeData);

    initTree();
  }

});
