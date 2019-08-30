document.addEventListener('DOMContentLoaded', function() {

  const markers = [];

  const editorOptions = {
    mode: "text/x-ruby",
    matchBrackets: true,
    indentUnit: 2,
    lineNumbers: true,
    theme: 'solarized',
    styleSelectedText: true,
  };

  const astEditorOptions = {
    mode: "text/x-ruby",
    matchBrackets: true,
    indentUnit: 2,
    theme: 'solarized',
    readOnly: true
  };


  const editor = CodeMirror.fromTextArea(document.getElementById("editor"),editorOptions );
  const transformEditor = CodeMirror.fromTextArea(document.getElementById("transform-editor"), editorOptions);
  const outputEditor = CodeMirror.fromTextArea(document.getElementById("output-editor"), editorOptions);
  const astEditor = CodeMirror.fromTextArea(document.getElementById("ast-editor"), astEditorOptions);


  function getFromLine(begin) {
    let index = 0;

    let doc = editor.getDoc();
    let totalLines = doc.lineCount();

    let pos = 0;
    for(index = 0; index < totalLines; index++ ) {
      let lineLength = doc.getLine(index).length + 1; // Adding 1 for new line
      if(begin < pos + lineLength) {
        break;
      } else {

        pos += lineLength; 
      }
    }

    let _line = index;
    let _ch = Math.abs(pos - begin);
    return { line: _line, ch: _ch };
  }

  function getEndLine(begin, end) {
    let index = 0;

    let doc = editor.getDoc();
    let totalLines = doc.lineCount();

    let pos = 0;
    for(index = 0; index < totalLines; index++ ) {
      let lineLength = doc.getLine(index).length + 1; // Adding 1 for new line
      pos += lineLength;
      if(end > pos) {
        continue;
      } else { 
        break;
      }
    }

    let _line = index;
    let _ch = Math.abs(begin - end);
    return { line: _line, ch: _ch };
  }

  function indentAll() {
    indentCode(editor);
    indentCode(transformEditor);
    indentCode(outputEditor);
  }


  // https://davidwalsh.name/javascript-debounce-function
  function debounce(func, wait, immediate) {
    let timeout;
    return function() {
      const context = this, args = arguments;
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
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



  updateAst(editor.getValue(), transformEditor.getValue());

  indentAll();



  
  editor.on("change",debounce(function(cm, change) {
    let code = cm.getValue();
    let transform = transformEditor.getValue();
    updateAst(code, transform);
  }, 250));



  transformEditor.on("change",debounce(function(cm, change) {

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



  function initTree() {
    const trees = document.querySelectorAll('[role="tree"]');

    for (var i = 0; i < trees.length; i++) {
      const t = new TreeLinks(trees[i]);
      t.init();
    }
  }

  function buildTreeView(ast) {
    let treeData = JSON.parse(ast);
    console.log(treeData);

    function traverse(node) {

      let treeHtml = '';
      if(node) {
        let { location } = node;
        let { begin, end, expression, keyword, name, operator }  = location;
        if(expression) {
          let { begin_pos, end_pos } = expression;
          treeHtml += `<li role="treeitem" aria-expanded="false" data-begin-pos="${begin_pos}" data-end-pos="${end_pos}"><span >${node['type']}: <span class="blue">#on_${node['type']}</span></span>`;
        } else {
          treeHtml += `<li role="treeitem" aria-expanded="false"><span>${node['type']}</span>`;
        }
        treeHtml += `<ul>`;

        // Create location node
        if(location) {

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
          treeHtml += `<li role="treeitem" aria-expanded="false"><span>children: [ ]</span><ul>`;
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


  $(document).on('mouseover', '[role="treeitem"]',function(event) {
    let { beginPos, endPos } = event.currentTarget.dataset;
    // Clearing and pushing markers
    markers.forEach(marker => marker.clear());
    if(beginPos && endPos) {
      let markFrom = getFromLine(beginPos);
      let markTo =  getEndLine(beginPos, endPos);
      markTo.ch = endPos + markFrom.ch;

      let currentMark = editor.markText(markFrom, markTo, { className: 'styled-background'});
      markers.push(currentMark);
    }

    event.stopPropagation();
  });

  $(document).on('mouseleave', '[role="treeitem"]',function(event) {
    // Clearing and pushing markers
    markers.forEach(marker => marker.clear());
  });

});
