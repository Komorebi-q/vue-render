const renderVNode = h(
  'div',
  {
    style: { backgroundColor: 'red', width: 100, height: 100 },
    class: 'container-el',
    '@click': () => {
      console.log('clicked!!!');
    }
  },
  [
    h(FRAGMENT, {}, [
      h(
        'a',
        {
          style: {
            color: 'white'
          },
          class: ['a', 'b']
        },
        'children'
      ),
      h('input', {
        type: 'checkbox',
        checked: true
      })
    ]),
    h(
      PORTAL,
      { target: '#sub-root' },
      h(FRAGMENT, {}, [
        h(
          'a',
          {
            style: {
              color: 'black'
            },
            class: ['a', 'b']
          },
          'sub root children'
        ),
        h('input', {
          type: 'checkbox',
          checked: true
        })
      ])
    )
  ]
);

const nextVNode = h(
  'div',
  {
    style: { backgroundColor: 'blue', width: 100, height: 100 },
    class: 'container-el',
    '@click': () => {
      console.log('clicked!!!');
    }
  },
  [
    h(FRAGMENT, {}, [
      h(
        'a',
        {
          style: {
            color: 'white'
          },
          class: ['a', 'b']
        },
        'children'
      ),
      h('input', {
        type: 'checkbox',
        checked: true
      })
    ]),
    h(
      PORTAL,
      { target: '#sub-root' },
      h(FRAGMENT, {}, [
        h(
          'a',
          {
            style: {
              color: 'black'
            },
            class: ['a', 'b']
          },
          'sub root children'
        ),
        h('input', {
          type: 'checkbox',
          checked: true
        })
      ])
    )
  ]
);

render(renderVNode, document.getElementById('root'));
render(nextVNode, document.getElementById('root'));
