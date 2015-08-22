expect = require('chai').expect

describe 'Layer', ->

  xtrace = require('..')
  xtrace()
  Layer = xtrace.Layer

  it 'should record sync calls', (done)->
    # ctx = xtrace.Context.get()
    setTimeout done, 100

    outer = new Layer('outer', null, foo: 'bar')
    outer.run ->
      inner = Layer.last.descend('inner', cow: 'carl')
      inner.run -> console.log 'over'

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


  it.only 'should record sync call within async call', (done)->
    setTimeout done, 100

    outer = new Layer('outer', null, foo: 'bar')
    outer.run (wrap)->
      cb = wrap((e, res)->
          expect(e).not.to.be.ok
          expect(res).to.be.ok
          expect(res).to.equal('world')

          inner = Layer.last.descend('inner', cow: 'carl')
          inner.run ->
        )

      process.nextTick ->
        cb(null, 'world')
