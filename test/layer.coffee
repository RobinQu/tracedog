describe.only 'Layer', ->

  xtrace = require('..')
  xtrace()
  Layer = xtrace.Layer

  it 'should record sync calls', (done)->
    # ctx = xtrace.Context.get()
    setTimeout done, 100

    outer = new Layer('outer', null, foo: 'bar')
    outer.run ->
      inner = Layer.last.descend('inner', cow: 'carl')
      inner.run ->

  it 'should record async call within sync call', (done)->
    setTimeout done, 100

    outer = new Layer('outer', null, foo: 'bar')
    outer.run ->
      inner = Layer.last.descend('inner', cow: 'carl')
      inner.run (wrap)->
        cb = wrap((e, ret)->

          )
        process.nextTick(->
          cb(null, 'hello')
          )
