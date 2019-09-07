import processorList from './processorList';

function getFromLine(editor, begin) {
  let index = 0;

  const doc = editor.getDoc();
  const totalLines = doc.lineCount();

  let pos = 0;
  for (index = 0; index < totalLines; index++) { // eslint-disable-line
    const lineLength = doc.getLine(index).length + 1; // Adding 1 for new line
    if (begin < pos + lineLength) {
      break;
    } else {
      pos += lineLength;
    }
  }

  const line = index;
  const ch = Math.abs(pos - begin);
  return { line, ch };
}

function getEndLine(editor, begin, end) {
  let index = 0;

  const doc = editor.getDoc();
  const totalLines = doc.lineCount();

  let pos = 0;
  for (index = 0; index < totalLines; index++) { // eslint-disable-line
    const lineLength = doc.getLine(index).length + 1; // Adding 1 for new line
    pos += lineLength;
    if (end < pos) {
      break;
    }
  }

  const line = index;
  const ch = Math.abs(begin - end);
  return { line, ch };
}

// https://davidwalsh.name/javascript-debounce-function
function debounce(func, wait, immediate) {
  let timeout;
  return function () { // eslint-disable-line
    const context = this; const
      args = arguments;// eslint-disable-line
    const later = function () { // eslint-disable-line
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

function initTree() {
  const trees = document.querySelectorAll('[role="tree"]');

  for (let i = 0; i < trees.length; i++) {
    const t = new TreeLinks(trees[i]);
    t.init();
  }
}

function buildTreeView(ast) {
  const treeData = JSON.parse(ast);
  // console.log(treeData);

  function traverse(node) {
    let treeHtml = '';
    if (node) {
      const { location, type } = node;
      const {
        begin, end, expression, keyword, name, operator,
      } = location;
      if (expression) {
        const { begin_pos, end_pos } = expression; // eslint-disable-line
        const processorNode = (t) => (processorList.includes(t) ? `${t}: <span class="blue">#on_${t}</span>` : t);
        treeHtml += `<li role="treeitem" aria-expanded="false" data-begin-pos="${begin_pos}" data-end-pos="${end_pos}"><span>${processorNode(node.type)}</span>`; // eslint-disable-line
      } else {
        treeHtml += `<li role="treeitem" aria-expanded="false"><span>${node.type}</span>`;
      }
      treeHtml += '<ul>';

      // Create type node
      if (type) {
        treeHtml += `<li role="none"><span>type: ${type}</span></li>`;
      }

      // Create location node
      if (location) {
        treeHtml += '<li role="treeitem" aria-expanded="false"><span>location</span><ul>';

        const locationNode = (_node, _name) => {
          let str = '';
          const { begin_pos, end_pos } = _node;
          str += `<li role="treeitem" aria-expanded="false" data-begin-pos="${begin_pos}" data-end-pos="${end_pos}"><span>${_name}</span>`;
          str += '<ul>';
          str += `<li role="none"><span>begin_pos: ${begin_pos} </span></li>`;
          str += `<li role="none"><span>end_pos: ${end_pos} </span></li>`;
          str += '</ul>';
          str += '</li>';
          return str;
        };

        // Create begin node
        if (begin) {
          treeHtml += locationNode(begin, 'begin');
        } else {
          treeHtml += '<li role="none"><span>begin: null</span></li>';
        }

        // Create end node
        if (end) {
          treeHtml += locationNode(end, 'end');
        } else {
          treeHtml += '<li role="none"><span>end: null</span></li>';
        }

        // Create expression node
        if (expression) {
          treeHtml += locationNode(expression, 'expression');
        }

        // Create keyword node

        if (keyword) {
          treeHtml += locationNode(keyword, 'keyword');
        }

        // Create name node
        if (name) {
          treeHtml += locationNode(name, 'name');
        }

        // Create operator node
        if (operator) {
          treeHtml += locationNode(operator, 'operator');
        } else {
          treeHtml += '<li role="none"><span>operator: null</span></li>';
        }

        treeHtml += '</ul></li>';
      }

      if (node.children) {
        treeHtml += '<li role="treeitem" aria-expanded="false"><span>children: [ ]</span><ul>';
        node.children.forEach((child) => {
          if (child == null) {
            treeHtml += '<li role="none"><span>nil</span></li>';
          } else if (node.type === 'sym') {
            treeHtml += `<li role="none"><span>:${child}</span></li>`;
          } else if (typeof child === 'object') {
            treeHtml += traverse(child);
          } else {
            treeHtml += `<li role="none"><span>${child}</span></li>`;
          }
        });

        treeHtml += '</ul></li>';
      }
      treeHtml += '</ul>';
      treeHtml += '</li>';
    }

    return treeHtml;
  }

  document.getElementById('ast-tree').innerHTML = traverse(treeData);

  initTree();
}

function indentCode(ed) {
  ed.setSelection({
    line: ed.firstLine(),
    ch: 0,
    sticky: null,
  }, {
    line: ed.lastLine(),
    ch: 0,
    sticky: null,
  },
  { scroll: false });
  // auto indent the selection
  ed.indentSelection('smart');
  ed.setCursor({ line: ed.firstLine(), ch: 0 });
}


export {
  getFromLine,
  getEndLine,
  debounce,
  buildTreeView,
  indentCode,
};
