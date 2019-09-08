/* eslint no-console:0 */
/* globals CodeMirror $ Split */

import {
  getFromLine,
  getEndLine,
  debounce,
  buildTreeView,
  indentCode,
} from './utils';

console.log('Hello World from Webpacker');
document.addEventListener('turbolinks:load', () => {
  const markers = [];

  const editorOptions = {
    mode: 'text/x-ruby',
    matchBrackets: true,
    indentUnit: 2,
    lineNumbers: true,
    theme: 'solarized',
    styleSelectedText: true,
  };

  const astEditorOptions = {
    mode: 'text/x-ruby',
    matchBrackets: true,
    indentUnit: 2,
    theme: 'solarized',
    readOnly: true,
  };


  const editor = CodeMirror.fromTextArea(document.getElementById('editor'), editorOptions);
  const transformEditor = CodeMirror.fromTextArea(document.getElementById('transform-editor'), editorOptions);
  const outputEditor = CodeMirror.fromTextArea(document.getElementById('output-editor'), editorOptions);
  const astEditor = CodeMirror.fromTextArea(document.getElementById('ast-editor'), astEditorOptions);


  function indentAll() {
    indentCode(editor);
    indentCode(transformEditor);
    indentCode(outputEditor);
  }


  function updateAst(code, transform) {
    $.ajax({
      url: '/ast',
      type: 'post',
      data: { code, transform },
      success(data) {
        astEditor.setValue(data.ast);
        buildTreeView(data.treeData);
        outputEditor.setValue(data.output);
      },
      error() {},
    });
  }

  function updateOutput(code, transform) {
    $.ajax({
      url: '/ast',
      type: 'post',
      data: { code, transform },
      success(data) {
        outputEditor.setValue(data.output);
      },
      error() {},
    });
  }


  updateAst(editor.getValue(), transformEditor.getValue());

  indentAll();


  editor.on('change', debounce((cm) => {
    const code = cm.getValue();
    const transform = transformEditor.getValue();
    updateAst(code, transform);
  }, 250));

  editor.on('cursorActivity', (e) => {
    const { line } = e.doc.getCursor(); // Cursor line
    const { ch } = e.doc.getCursor(); // Cursor character

    const doc = editor.getDoc();
    const totalLines = doc.lineCount();

    let pos = 0;
    for (index = 0; index < line; index++) {
      const lineLength = doc.getLine(index).length + 1; // Adding 1 for new line

      pos += lineLength;
    }

    pos += ch;

    console.log(pos);

    const nodes = Array.from(document.querySelectorAll('li')).filter((el) => {
      const { beginPos, endPos } = el.dataset;
      return pos > beginPos && pos < endPos;
    });

    nodes.forEach((node) => {
      console.log(node.attributes['aria-expanded']);
      node.attributes['aria-expanded'] = 'true';
    });


    console.log(nodes);
  });


  transformEditor.on('change', debounce((cm) => {
    const transform = cm.getValue();
    const code = editor.getValue();
    updateOutput(code, transform);
  }, 250));

  $('#create-gist').click(function () {
    const _self = this;
    _self.disabled = true;
    $.ajax({
      url: '/gist',
      type: 'post',
      data: { code: editor.getValue(), transform: transformEditor.getValue() },
      success(data) {
        window.alert(data.message);
        _self.disabled = false;
      },
      error(data) {
        window.alert('Gist creation failed');
        _self.disabled = false;
      },
    });
  });

  $('#switch-theme').on('click', (e) => {
    const theme = e.target.checked ? 'solarized dark' : 'solarized';
    editor.setOption('theme', theme);
    astEditor.setOption('theme', theme);
    transformEditor.setOption('theme', theme);
    outputEditor.setOption('theme', theme);

    const $primarynav = document.getElementById('primary-nav');

    if (e.target.checked) {
      $primarynav.classList.replace('navbar-light', 'navbar-dark');
      $primarynav.classList.replace('bg-light', 'bg-dark');
      document.body.classList.add('dark-theme');
    } else {
      $primarynav.classList.replace('navbar-dark', 'navbar-light');
      $primarynav.classList.replace('bg-dark', 'bg-light');
      document.body.classList.remove('dark-theme');
    }
  });

  $(document).on('mouseover', '[role="treeitem"]', (event) => {
    const { beginPos, endPos } = event.currentTarget.dataset;
    // Clearing and pushing markers
    markers.forEach((marker) => marker.clear());
    if (beginPos && endPos) {
      const markFrom = getFromLine(editor, beginPos);
      const markTo = getEndLine(editor, beginPos, endPos);
      markTo.ch = endPos + markFrom.ch;

      const currentMark = editor.markText(markFrom, markTo, { className: 'styled-background' });
      markers.push(currentMark);
    }

    event.stopPropagation();
  });

  $(document).on('mouseleave', '[role="treeitem"]', () => {
    // Clearing and pushing markers
    markers.forEach((marker) => marker.clear());
  });

  /*

  let sizes = localStorage.getItem('split-sizes');

  if (sizes) {
    sizes = JSON.parse(sizes);
  } else {
    sizes = [50, 50]; // default sizes
  }


  Split(['#split-top-row', '#split-bottom-row'], {
    sizes,
    direction: 'vertical',
    elementStyle(dimension, size, gutterSize) {
      return {
        height: 'calc(50% - 48px)',
      };
    },
    gutterStyle(dimension, gutterSize) {
      return {
        height: '4px',
      };
    },
    onDragEnd(sizes) {
      localStorage.setItem('split-sizes', JSON.stringify(sizes));
    },
  });

  Split(['#top-left-col', '#top-right-col'], {
    sizes: [50, 50],
    elementStyle(dimension, size, gutterSize) {
      return {
        width: '100%',
        overflow: 'hidden',
      };
    },
    gutterStyle(dimension, gutterSize) {
      return {
        width: '4px',
      };
    },

  });


  Split(['#bottom-left-col', '#bottom-right-col'], {
    sizes: [50, 50],
    elementStyle(dimension, size, gutterSize) {
      return {
        width: '100%',
      };
    },
    gutterStyle(dimension, gutterSize) {
      return {
        width: '4px',
      };
    },
  });
  */
});
