/*
document.addEventListener('turbolinks:load', function() {

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
  
  function updateOutput(code, transform) {
    $.ajax({
      url: "/ast",
      type: "post",
      data: { code: code, transform: transform},
      success: function(data) {
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

  editor.on('cursorActivity', function(e) {
     const line = e.doc.getCursor().line;   //Cursor line
    const ch = e.doc.getCursor().ch;       //Cursor character

    let doc = editor.getDoc();
    let totalLines = doc.lineCount();

    let pos = 0;
    for(index = 0; index < line; index++ ) {
      let lineLength = doc.getLine(index).length + 1; // Adding 1 for new line

        pos += lineLength; 
    }

    pos += ch;

    console.log(pos);

    let nodes = Array.from(document.querySelectorAll('li')).filter(el => {
      let {beginPos, endPos } = el.dataset;
      return pos > beginPos && pos < endPos;

    });
      
      nodes.forEach(node => {
        console.log(node.attributes['aria-expanded'])
        node.attributes['aria-expanded'] = "true";
      });



    console.log(nodes);


  });



  transformEditor.on("change",debounce(function(cm, change) {
    let transform = cm.getValue();
    let code = editor.getValue();
    updateOutput(code, transform);
  }, 250));

  $('#create-gist').click(function() {
    let _self = this;
    _self.disabled = true;
    $.ajax({
      url: "/gist",
      type: "post",
      data: { code: editor.getValue(), transform: transformEditor.getValue()},
      success: function(data) {
        window.alert(data.message);
        _self.disabled = false;
      },
      error: function(data) {
        window.alert('Gist creation failed');
        _self.disabled = false;
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
      document.body.classList.add('dark-theme');
    } else {
      $primarynav.classList.replace('navbar-dark', 'navbar-light');
      $primarynav.classList.replace('bg-dark', 'bg-light');
      document.body.classList.remove('dark-theme');
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
        let { location, type } = node;
        let { begin, end, expression, keyword, name, operator }  = location;
        if(expression) {
          let { begin_pos, end_pos } = expression;
          const processorNode = (type) => processorList.includes(type) ? `${type}: <span class="blue">#on_${type}</span>` : type;
          treeHtml += `<li role="treeitem" aria-expanded="false" data-begin-pos="${begin_pos}" data-end-pos="${end_pos}"><span>${processorNode(node['type'])}</span>`;
        } else {
          treeHtml += `<li role="treeitem" aria-expanded="false"><span>${node['type']}</span>`;
        }
        treeHtml += `<ul>`;

        // Create type node
        if(type) {
            treeHtml += `<li role="none"><span>type: ${type}</span></li>`;
        }

        // Create location node
        if(location) {

          treeHtml += `<li role="treeitem" aria-expanded="false"><span>location</span><ul>`;

          const locationNode = (node, name) => {
            let str = '';
            let { begin_pos, end_pos } = node;
            str += `<li role="treeitem" aria-expanded="false" data-begin-pos="${begin_pos}" data-end-pos="${end_pos}"><span>${name}</span>`;
            str += `<ul>`;
            str += `<li role="none"><span>begin_pos: ${begin_pos} </span></li>`;
            str += `<li role="none"><span>end_pos: ${end_pos} </span></li>`;
            str += `</ul>`;
            str += `</li>`;
            return str;
          }

          // Create begin node
          if(begin) {
            treeHtml += locationNode(begin, "begin");
          } else {
            treeHtml += `<li role="none"><span>begin: null</span></li>`;
          }


          // Create end node
          if(end) {
            treeHtml += locationNode(end, "end");
          } else {
            treeHtml += `<li role="none"><span>end: null</span></li>`;
          }


          // Create expression node
          if(expression) {
            treeHtml += locationNode(expression, "expression");
          }

          // Create keyword node

          if(keyword) {
            treeHtml += locationNode(keyword, "keyword");
          }

          // Create name node
          if(name) {
            treeHtml += locationNode(name, "name");
          }

          // Create operator node
          if(operator) {
            treeHtml += locationNode(operator, "operator");
          } else {
            treeHtml += `<li role="none"><span>operator: null</span></li>`;
          }

          treeHtml += `</ul></li>`;
        }


        if(node.children) {
          treeHtml += `<li role="treeitem" aria-expanded="false"><span>children: [ ]</span><ul>`;
          node.children.forEach(child => {
            if(child == null) {
              treeHtml += `<li role="none"><span>nil</span></li>`;
            } else if(node['type'] === "sym") {
              treeHtml += `<li role="none"><span>:${child}</span></li>`;
            } else if(typeof child === 'object') {
              treeHtml += traverse(child);
            } else {
              treeHtml += `<li role="none"><span>${child}</span></li>`;
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

  var sizes = localStorage.getItem('split-sizes')

  if (sizes) {
        sizes = JSON.parse(sizes)
  } else {
        sizes = [50, 50] // default sizes
  }


  Split(['#split-top-row', '#split-bottom-row'], {
    sizes: sizes,
    direction: 'vertical',
    elementStyle: function(dimension, size, gutterSize) {
      return {
        'height': 'calc(50% - 48px)'
      }
    },
    gutterStyle: function(dimension, gutterSize) {
      return {
        'height': '4px'
      }
    },
    onDragEnd: function(sizes) {
              localStorage.setItem('split-sizes', JSON.stringify(sizes))
          },
  });

  Split(['#top-left-col', '#top-right-col'], {
    sizes: [50, 50],
    elementStyle: function(dimension, size, gutterSize) {
      return {
        'width': '100%',
        'overflow': 'hidden',
      }
    },
    gutterStyle: function(dimension, gutterSize) {
      return {
        'width': '4px'
      }
    }

  });


  Split(['#bottom-left-col', '#bottom-right-col'], {
    sizes: [50, 50],
    elementStyle: function(dimension, size, gutterSize) {
      return {
        'width': '100%',
      }
    },
    gutterStyle: function(dimension, gutterSize) {
      return {
        'width': '4px'
      }
    }
  });


});

*/
