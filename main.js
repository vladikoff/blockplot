require('./js/parallax')()

var levelUser = require('level-user')
var commonStuff = require('./js/common')

var user = levelUser({dbName: 'blocks', baseURL: "http://wzrd.in:9000" })

user.getProfile(function(err, profile) {
  user.profile = profile
  commonStuff(user)
})

var video = document.querySelector('video')
console.log(video)
video.onended = function () {
  console.log('ended')
  this.currentTime = 0
  this.play()
}
