const express = require('express')
const router = express.Router()
const models = require('../db/db')
const mysqls = require('mysql')
const sqlMap = require('../db/sqlMap')

const conn = mysqls.createConnection(models.mysql)

conn.connect()

let jsonWrite = function (res, ret) {
  if (typeof ret === 'undefined') {
    res.send('err')
  } else {
    res.send(ret)
  }
}

let dateStr = function (str) {
  return new Date(str.slice(0, 7))
}
router.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,username');
  next()
})
router.post('/addUser', (req, res) => {
    let sql = sqlMap.user.add
    let params = req.body
    conn.query(sql, [params.name, params.account, params.pass, params.checkPass,
        params.email, params.phone, params.card, dateStr(params.birth), params.sex], function (err, result) {
        if (err) {
            console.log(err)
        }
        if (result) {
            jsonWrite(res, result)
        }
    })

})

/* GET home page. */
router.post('/login', function (req, res) {
  let sqlName = sqlMap.user.select_name
  let params = req.body
  let keywords = JSON.parse(Object.keys(params)[0])
  if (keywords.name) {
    sqlName += " where username ='" + keywords.name + "'"
    console.log(sqlName)
  }
  conn.query(sqlName, keywords.name, function (err, result) {
    if (err) {
      console.log(err)
    }
    if (result[0] === undefined) {
      res.send('-1')
    } else {
      let resultArray = result[0]
      if (resultArray.password === keywords.password) {
        jsonWrite(res, result)
      } else {
        res.send('0')
      }
    }
  })
})

router.get('/getUser', (req, res) => {
    let sql_name = sqlMap.user.select_name;
    let params = req.body
    if (params.name) {
        sql_name += "where username ="+params.name
    }
    conn.query(sql_name, params.name, function(err, result){
        if (err) {
            console.log(err)
        }
        if (result[0] === undefined) {
            res.send('-1')
        } else {
            jsonWrite(res, result)
        }
    })
})

router.post('/updateUser', (req, res) => {
    let sql_update = sqlMap.user.update_user
    let params = req.body
    if(params.id) {
        sql_update += "email = " + params.email +
            ",phone = " +params.phone +
            ",card = " +params.card +
            ",birth = " +params.birth +
            ",sex = " + params.sex +
            " where id = " + params.id
    }
    conn.query(sql_update, params.id, function (err, result) {
        if (err) {
            console.log(err)
        }
        if (result.affectedRows === undefined) {
            res.send('更新失败，请联系管理员')
        } else {
            res.send('ok')
        }
    })
})

module.exports = router
