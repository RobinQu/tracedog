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

    it 'should instrument', (done)->
      xtrace.instrument()
