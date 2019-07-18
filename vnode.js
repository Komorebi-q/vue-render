const textVNode = {
  tag: null,
  data: null,
  children: '文本内容',
  flags: VNodeFlags.TEXT
};
const componentVNode = {
  tag: COMPONENT,
  data: null,
  flags: VNodeFlags.COMPONENT
};
const fragmentVNode = {
  tag: FRAGMENT,
  data: null,
  children: [],
  flags: VNodeFlags.FRAGMENT
};
const portalVNode = {
  tag: PORTAL,
  data: {
    target: '#portal-container'
  },
  children: [],
  flags: VNodeFlags.PORTAL
};

const vnode = {
  isVNode: true,
  tag: 'div',
  el: 'element',
  flags: 'flags',
  data: {} || null, // VNodeData
  children:
    [] || textVNode | fragmentVNode || componentVNode || portalVNode || null,
  childrenFlags: 'childrenFlags'
};

function normalizeVNodes(children) {
  const newChildren = [];

  for (const [i, child] of children.entries()) {
    if (child.key == null) {
      child.key = `|${i}`;
    }

    newChildren.push(child);
  }

  return newChildren;
}

function createTextVNode(text) {
  return {
    isVNode: true,
    flags: VNodeFlags.TEXT,
    tag: null,
    data: null,
    children: text,
    childFlags: ChildrenFlags.NO_CHILDREN,
    el: null
  };
}

function h(tag, data = null, children = []) {
  let flags;
  let childFlags;
  // flags
  if (typeof tag === 'string') {
    if (tag === 'svg') {
      flags = VNodeFlags.ELEMENT_SVG;
    } else {
      flags = VNodeFlags.ELEMENT_HTML;
    }
  } else if (tag === FRAGMENT) {
    flags = VNodeFlags.FRAGMENT;
  } else if (tag === PORTAL) {
    flags = VNodeFlags.PORTAL;
    tag = data && data.target;
  } else {
    if (tag != null && typeof tag === 'object') {
      // vue2
      flags = tag.functional
        ? VNodeFlags.COMPONENT_STATEFUL_NORMAL
        : VNodeFlags.COMPONENT_STATEFUL_NORMAL;
    } else if (typeof tag === 'function') {
      // vue3
      flags =
        tag.prototype && tag.prototype.render
          ? VNodeFlags.COMPONENT_STATEFUL_NORMAL // 有状态组件
          : VNodeFlags.COMPONENT_FUNCTIONAL;
    }
  }

  // childFlags;

  if (Array.isArray(children)) {
    if (children.length === 0) {
      childFlags = ChildrenFlags.NO_CHILDREN;
    } else if (children.length === 1) {
      childFlags = ChildrenFlags.SINGLE_VNODE;
      children = children[0];
    } else if (children.length > 1) {
      childFlags = ChildrenFlags.KEYED_VNODES;
      children = normalizeVNodes(children);
    }
  } else {
    if (children == null) {
      childFlags = ChildrenFlags.NO_CHILDREN;
    } else if (children.isVNode) {
      childFlags = ChildrenFlags.SINGLE_VNODE;
    } else {
      childFlags = ChildrenFlags.SINGLE_VNODE;
      children = createTextVNode(children + '');
    }
  }

  return {
    isVNode: true,
    tag,
    flags,
    data,
    el: null,
    childFlags,
    children
  };
}
