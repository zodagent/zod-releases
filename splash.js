// Splash screen: greeting time, braille progress animation, hide after 3s.
// Kept as an external classic script so the production Content-Security-Policy
// can ban inline scripts entirely.

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

  setTimeout(function () {
    var splash = document.getElementById('splash')
    var app = document.getElementById('app')
    if (splash) splash.style.display = 'none'
    if (app) app.classList.remove('app-hidden')
  }, 3000)
})()
