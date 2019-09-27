import TreeitemLink from './treeitemLinks';
/*
*   This content is licensed according to the W3C Software License at
*   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
*
*   File:   TreeLinks.js
*
*   Desc:   Tree widget that implements ARIA Authoring Practices
*           for a tree being used as a file viewer
*/

/**
 * ARIA Treeview example
 * @function onload
 * @desc  after page has loaded initialize all treeitems based on the role=treeitem
 */

window.addEventListener('load', () => {


});

/*
*   @constructor
*
*   @desc
*       Tree item object for representing the state and user interactions for a
*       tree widget
*
*   @param node
*       An element with the role=tree attribute
*/

const TreeLinks = function (node) {
  // Check whether node is a DOM element
  if (typeof node !== 'object') {
    return;
  }

  this.domNode = node;

  this.treeitems = [];
  this.firstChars = [];

  this.firstTreeitem = null;
  this.lastTreeitem = null;
};

TreeLinks.prototype.init = function () {
  function findTreeitems(node, tree, group) {
    let elem = node.firstElementChild;
    let ti = group;

    while (elem) {
      if ((elem.tagName.toLowerCase() === 'li' && elem.firstElementChild.tagName.toLowerCase() === 'span') || elem.tagName.toLowerCase() === 'a') {
        ti = new TreeitemLink(elem, tree, group);
        ti.init();
        tree.treeitems.push(ti);
        tree.firstChars.push(ti.label.substring(0, 1).toLowerCase());
      }

      if (elem.firstElementChild) {
        findTreeitems(elem, tree, ti);
      }

      elem = elem.nextElementSibling;
    }
  }

  // initialize pop up menus
  if (!this.domNode.getAttribute('role')) {
    this.domNode.setAttribute('role', 'tree');
  }

  findTreeitems(this.domNode, this, false);

  this.updateVisibleTreeitems();

  this.firstTreeitem.domNode.tabIndex = 0;
};

TreeLinks.prototype.setFocusToItem = function (treeitem) {
  for (let i = 0; i < this.treeitems.length; i++) {
    const ti = this.treeitems[i];

    if (ti === treeitem) {
      ti.domNode.tabIndex = 0;
      ti.domNode.focus();
    } else {
      ti.domNode.tabIndex = -1;
    }
  }
};

TreeLinks.prototype.setFocusToNextItem = function (currentItem) {
  let nextItem = false;

  for (let i = (this.treeitems.length - 1); i >= 0; i--) {
    const ti = this.treeitems[i];
    if (ti === currentItem) {
      break;
    }
    if (ti.isVisible) {
      nextItem = ti;
    }
  }

  if (nextItem) {
    this.setFocusToItem(nextItem);
  }
};

TreeLinks.prototype.setFocusToPreviousItem = function (currentItem) {
  let prevItem = false;

  for (let i = 0; i < this.treeitems.length; i++) {
    const ti = this.treeitems[i];
    if (ti === currentItem) {
      break;
    }
    if (ti.isVisible) {
      prevItem = ti;
    }
  }

  if (prevItem) {
    this.setFocusToItem(prevItem);
  }
};

TreeLinks.prototype.setFocusToParentItem = function (currentItem) {
  if (currentItem.groupTreeitem) {
    this.setFocusToItem(currentItem.groupTreeitem);
  }
};

TreeLinks.prototype.setFocusToFirstItem = function () {
  this.setFocusToItem(this.firstTreeitem);
};

TreeLinks.prototype.setFocusToLastItem = function () {
  this.setFocusToItem(this.lastTreeitem);
};

TreeLinks.prototype.expandTreeitem = function (currentItem) {
  if (currentItem.isExpandable) {
    currentItem.domNode.setAttribute('aria-expanded', true);
    this.updateVisibleTreeitems();
  }
};

TreeLinks.prototype.expandAllSiblingItems = function (currentItem) {
  for (let i = 0; i < this.treeitems.length; i++) {
    const ti = this.treeitems[i];

    if ((ti.groupTreeitem === currentItem.groupTreeitem) && ti.isExpandable) {
      this.expandTreeitem(ti);
    }
  }
};

TreeLinks.prototype.collapseTreeitem = function (currentItem) {
  let groupTreeitem = false;

  if (currentItem.isExpanded()) {
    groupTreeitem = currentItem;
  } else {
    groupTreeitem = currentItem.groupTreeitem;
  }

  if (groupTreeitem) {
    groupTreeitem.domNode.setAttribute('aria-expanded', false);
    this.updateVisibleTreeitems();
    this.setFocusToItem(groupTreeitem);
  }
};

TreeLinks.prototype.updateVisibleTreeitems = function () {
  this.firstTreeitem = this.treeitems[0];

  for (let i = 0; i < this.treeitems.length; i++) {
    const ti = this.treeitems[i];

    let parent = ti.domNode.parentNode;

    ti.isVisible = true;

    while (parent && (parent !== this.domNode)) {
      if (parent.getAttribute('aria-expanded') == 'false') {
        ti.isVisible = false;
      }
      parent = parent.parentNode;
    }

    if (ti.isVisible) {
      this.lastTreeitem = ti;
    }
  }
};

TreeLinks.prototype.setFocusByFirstCharacter = function (currentItem, char) {
  let start;
  let index;
  char = char.toLowerCase();

  // Get start index for search based on position of currentItem
  start = this.treeitems.indexOf(currentItem) + 1;
  if (start === this.treeitems.length) {
    start = 0;
  }

  // Check remaining slots in the menu
  index = this.getIndexFirstChars(start, char);

  // If not found in remaining slots, check from beginning
  if (index === -1) {
    index = this.getIndexFirstChars(0, char);
  }

  // If match was found...
  if (index > -1) {
    this.setFocusToItem(this.treeitems[index]);
  }
};

TreeLinks.prototype.getIndexFirstChars = function (startIndex, char) {
  for (let i = startIndex; i < this.firstChars.length; i++) {
    if (this.treeitems[i].isVisible) {
      if (char === this.firstChars[i]) {
        return i;
      }
    }
  }
  return -1;
};


export default TreeLinks;
