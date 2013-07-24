require('./js/parallax')()

var levelUser = require('level-user')
var commonStuff = require('./js/common')

var user = levelUser({dbName: 'blocks', baseURL: "http://wzrd.in:9000" })

user.getSession(function(err, session) {
  user.session = session
  commonStuff(user)
})
