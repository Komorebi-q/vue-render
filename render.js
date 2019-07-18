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

const domPropsRE = /\W|^(?:value|checked|selected|muted)$/;

const dataMap = new Map();
dataMap.set(undefined, (key, prop, el) => {
  // event
  let eventName;

  if (key[0] === 'o' && key[1] === 'n') {
    eventName = key.slice(2);
  } else if (key[0] === '@') {
    eventName = key.slice(1);
  }

  if (eventName) {
    el.addEventListener(eventName, prop, false);

    return;
  }

  // normal props
  if (domPropsRE.test(key)) {
    el[key] = prop;
  } else {
    el.setAttribute(key, prop);
  }
});
dataMap.set('style', (styles, el) => {
  for (let [k, s] of Object.entries(styles)) {
    if (k === 'width' || k === 'height') {
      s = `${s}px`;
    }
    el.style[k] = s;
  }
});
dataMap.set('class', (className, el) => {
  if (typeof className === 'string') {
    el.className = className;
  } else if (Array.isArray(className)) {
    el.className = className.filter(Boolean).join(' ');
  }
});

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
      if (dataMap.has(key)) {
        dataMap.get(key)(prop, el);
      } else {
        dataMap.get(undefined)(key, prop, el);
      }
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
    mountComponentFunctional(vnode, container, isSVG);
  } else if (flags & VNodeFlags.COMPONENT_STATEFUL) {
    mountComponentStateful(vnode, container, isSVG);
  }
}
