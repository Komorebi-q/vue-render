function render(vnode, container) {
  const preVNode = container.vnode;

  if (preVNode == null) {
    if (vnode) {
      mount(vnode, container);
      container.vnode = vnode;
    }
  } else {
    if (vnode) {
      patch(preVNode, vnode, container);
      container.vnode = vnode;
    } else {
      container.removeChild(preVNode);
      container.vnode = null;
    }
  }
}

// ========================== mount ==========================

function mount(vnode, container, isSVG) {
  const { flags } = vnode;
  console.log(vnode);

  if (flags & VNodeFlags.ELEMENT) {
    mountElement(vnode, container, isSVG);
  } else if (flags & VNodeFlags.COMPONENT) {
    // 挂载组件
    mountComponent(vnode, container, isSVG);
  } else if (flags & VNodeFlags.TEXT) {
    // 挂载纯文本

    mountText(vnode, container);
  } else if (flags & VNodeFlags.FRAGMENT) {
    // 挂载 Fragment
    mountFragment(vnode, container, isSVG);
  } else if (flags & VNodeFlags.PORTAL) {
    // 挂载 Portal
    mountPortal(vnode, container, isSVG);
  }
}

function mountElement(vnode, container, isSVG) {
  isSVG = isSVG || vnode.flags & VNodeFlags.ELEMENT_SVG;

  const el = isSVG
    ? document.createElementNS('http://www.w3.org/2000/svg', vnode.tag)
    : document.createElement(vnode.tag);
  const childFlags = vnode.childFlags;

  vnode.el = el;

  if (vnode.data != null) {
    for (const [key, prop] of Object.entries(vnode.data)) {
      patchData(vnode.el, key, null, prop);
    }
  }

  if (vnode.children != null) {
    if (childFlags !== ChildrenFlags.NO_CHILDREN) {
      if (childFlags & ChildrenFlags.SINGLE_VNODE) {
        mount(vnode.children, el, isSVG);
      } else if (childFlags & ChildrenFlags.MULTIPLE_CHILDREN) {
        for (const [i, child] of vnode.children.entries()) {
          mount(child, el, isSVG);
        }
      }
    }
  }

  container.appendChild(el);
}

function mountText(vnode, container) {
  const el = document.createTextNode(vnode.children);

  vnode.el = el;
  container.appendChild(el);
}

function mountFragment(vnode, container, isSVG) {
  const { children, childFlags } = vnode;

  const fnMap = new Map();

  fnMap.set('single', () => {
    mount(children, container, isSVG);
  });
  fnMap.set('no', () => {
    const emptyVNode = createTextNode('');

    mountText(emptyVNode, container);
  });
  fnMap.set('multi', () => {
    for (const child of children) {
      mount(child, container, isSVG);
    }
  });

  if (ChildrenFlags.SINGLE_VNODE & childFlags) {
    fnMap.get('no')();
  } else if (ChildrenFlags.NO_CHILDREN & childFlags) {
    fnMap.get('single')();
  } else if (ChildrenFlags.MULTIPLE_CHILDREN & childFlags) {
    fnMap.get('multi')();
  }
}

function mountPortal(vnode, container) {
  const { tag, children, childFlags } = vnode;
  const target = typeof tag === 'string' ? document.querySelector(tag) : tag;
  const placeholder = createTextVNode('');
  const fnMap = new Map();

  fnMap.set('single', () => {
    mount(children, target);
  });
  fnMap.set('multi', () => {
    for (const child of children) {
      mount(child, target);
    }
  });

  if (ChildrenFlags.SINGLE_VNODE & childFlags) {
    fnMap.get('single')();
  } else if (ChildrenFlags.MULTIPLE_CHILDREN & childFlags) {
    fnMap.get('multi')();
  }

  mountText(placeholder, container);

  vnode.el = placeholder;
}

function mountComponent(vnode, container, isSVG) {
  const { flags } = vnode;

  if (flags & VNodeFlags.COMPONENT_FUNCTIONAL) {
    mountFunctionalComponent(vnode, container, isSVG);
  } else if (flags & VNodeFlags.COMPONENT_STATEFUL) {
    mountStatefulComponent(vnode, container, isSVG);
  }
}

function mountFunctionalComponent(vnode, container, isSvg) {
  const $vnode = vnode.tag();

  mount($vnode, container, isSvg);
  vnode.el = $vnode.el;
}

function mountStatefulComponent(vnode, container, isSVG) {
  const instance = new vnode.tag();
  instance.$vnode = instance.render();

  mount(instance.$vnode, container, isSVG);
  instance.$el = vnode.el = instance.$vnode.el;
}

// ========================== mount ==========================

// ========================== patch ==========================

function patch(preVNode, nextVNode, container) {
  const preFlags = preVNode.flags;
  const nextFlags = nextVNode.flags;

  if (preFlags !== nextFlags) {
    replaceVNode(preVNode, nextVNode, container);
  } else if (nextFlags & VNodeFlags.ELEMENT) {
    patchElement(preVNode, nextVNode, container);
  } else if (nextFlags & VNodeFlags.TEXT) {
    patchText(preVNode, nextVNode, container);
  } else if (nextFlags & VNodeFlags.FRAGMENT) {
    patchFragment(preVNode, nextVNode, container);
  } else if (nextFlags & VNodeFlags.PORTAL) {
    patchPortal(preVNode, nextVNode, container);
  } else if (nextFlags & VNodeFlags.COMPONENT) {
    patchComponent(preVNode, nextVNode, container);
  }
}

function replaceVNode(preVNode, nextVNode, container) {
  container.removeChild(preVNode.el);

  mount(nextVNode);
}

function patchElement(preVNode, nextVNode, container) {
  if (preVNode.tag !== nextVNode.tag) {
    replaceVNode(preVNode, nextVNode, container);

    return;
  }

  const el = (nextVNode.el = preVNode.el);
  const preData = preVNode.data || {};
  const nextData = nextVNode.data || {};

  for (const [key, prop] of Object.entries(nextData)) {
    patchData(el, key, preData[key], prop);
  }

  for (const [key, prop] of Object.entries(preData)) {
    if (preData && !nextData.hasOwnProperty(key)) {
      patchData(el, key, prop, null);
    }
  }

  patchChildren(
    preVNode.childFlags,
    nextVNode.childFlags,
    preVNode.children,
    preVNode.children,
    el
  );
}

function patchChildren(preFlags, nextFlags, preChildren, nextChildren) {}

// ========================== patch ==========================
