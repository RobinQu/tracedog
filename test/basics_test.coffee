expect = require('chai').expect
sinon = require('sinon')


describe 'Basics', ->

  xtrace = require '..'

  it 'should export variables', ->
    expect(typeof xtrace).to.equal('function')
    expect(xtrace.Event).to.be.ok
    expect(xtrace.Layer).to.be.ok
    expect(xtrace.Context).to.be.ok
    expect(xtrace.reporters).to.be.ok

  it 'should run bootstrap procedure', (done)->
    spy = sinon.spy();
    ctx = xtrace.Context.get();
    ctx.once('bootstrap', spy);
    ctx.once('layer:enter', spy);
    ctx.once('layer:exit', spy);
    ctx.on('event:send', spy)
    xtrace()
    setTimeout ->
      expect(spy.callCount).to.equal(5)
      ctx.removeAllListeners()
      done()
    , 1000



  describe 'xtrace.instrument()', ->

    before((done)->
      ctx = xtrace.Context.get()
      ctx.removeAllListeners()
      ctx.once('bootstrap', -> done());
      xtrace()
      )

    it 'should instrument sync function', (done)->
      ctx = xtrace.Context.get()
      spy = sinon.spy()
      checks = [
        (event)->
          expect(event.data.backtrace).to.be.ok
          expect(event.layer).to.equal('math')
          expect(event.label).to.equal('entry')
        , (layer)->
          expect(layer).to.be.an.instanceof(xtrace.Layer)
          expect(layer.name).to.equal('math')
        , (event)->
          expect(event.layer).to.equal('math')
          expect(event.label).to.equal('exit')
        , (layer)->
          expect(layer).to.be.an.instanceof(xtrace.Layer)
          expect(layer.name).to.equal('math')
        ]


      ctx.on('layer:enter', spy)
      ctx.on('layer:exit', spy)
      ctx.on('event:send', spy)

      ctx.once('layer:exit', ->
        for arg, i in spy.args
          checks[i](arg[0])
        done()
        )
      xtrace.instrument('math', ->
          for i in [0..100]
            Math.random() * Math.random()
        )
