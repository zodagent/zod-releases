// Splash screen: greeting time, braille progress animation. Stays visible until
// the app module has finished loading and Alpine has booted — signaled via
// window.__zodAppReady — so the user never sees a half-rendered app. A hard
// timeout force-reveals the app if the module fails to boot. Kept as an external
// classic script so the production Content-Security-Policy can ban inline
// scripts entirely.

(function () {
  var splashTime = document.querySelector('.splash-time')
  if (splashTime) splashTime.textContent = new Date().toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })

  var brailleCells = document.querySelectorAll('.splash-braille')
  var brailleChars = ['\u2800', '\u2804', '\u2806', '\u2826', '\u2836', '\u2837', '\u283f', '\u28ff']
  var duration = 2400
  var start = performance.now()

  function animateBraille() {
    var elapsed = performance.now() - start
    var progress = Math.min(elapsed / duration, 1)
    for (var i = 0; i < brailleCells.length; i++) {
      var cellStart = (i / brailleCells.length) * 0.5
      var cellEnd = cellStart + 0.5
      var cellProgress = Math.max(0, Math.min(1, (progress - cellStart) / (cellEnd - cellStart)))
      if (cellProgress > 0) {
        var idx = Math.min(Math.floor(cellProgress * brailleChars.length), brailleChars.length - 1)
        brailleCells[i].textContent = brailleChars[idx]
        brailleCells[i].style.opacity = Math.min(0.15 + cellProgress * 0.85, 1)
      }
    }
    if (progress < 1) requestAnimationFrame(animateBraille)
  }
  requestAnimationFrame(animateBraille)

  var MIN_SHOW = 2000      // never flash the splash away faster than this
  var HARD_TIMEOUT = 20000 // if the app never signals ready, bail out anyway
  var bootStart = performance.now()
  var done = false

  function reveal() {
    if (done) return
    done = true
    var splash = document.getElementById('splash')
    if (!splash) return
    splash.classList.add('splash-fade')
    setTimeout(function () {
      splash.style.display = 'none'
    }, 500)
  }

  function forceReveal() {
    var app = document.getElementById('app')
    if (app && app.hasAttribute('x-cloak')) app.removeAttribute('x-cloak')
    reveal()
  }

  function poll() {
    if (!document.getElementById('splash')) return
    var elapsed = performance.now() - bootStart
    if (window.__zodAppReady === true && elapsed >= MIN_SHOW) return reveal()
    if (elapsed >= HARD_TIMEOUT) return forceReveal()
    setTimeout(poll, 100)
  }
  poll()
})()