const functions = require('firebase-functions')

const admin = require('firebase-admin')

var serviceAccount = require('./serviceAccountKey.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const express = require('express')
const cors = require('cors')

//main app
const app = express()
app.use(cors({ origin: true }))

//main database referance

const db = admin.firestore()

//routes
app.get('/', (req, res) => {
  return res.status(200).send('Api funcionando.')
  
})

//Auth

app.post('/autenticate', (req, res) => {
  (async () => {
    try {
      db.collection('userDetails').endBefore({
        email: req.body.email,
        password: req.body.password
      })

      return res.status(200).send({ status: 'Sucess', data: response })
    } catch (error) {
      console.log(error)
      return res
        .status(500)
        .send({ status: 'Failed', msg: 'Não foi possivel salvar os dados' })
    }
  })()
})


//create => post()

app.post('/users/create', (req, res) => {
  (async () => {
    try {
      await db.collection('userDetails').doc(`/${Date.now()}/`).create({
        id: Date.now(),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password
      })

      return res
        .status(200)
        .send({ status: 'Sucess', msg: 'Usuario cadastrado' })
    } catch (error) {
      console.log(error)
      return res
        .status(500)
        .send({ status: 'Failed', msg: 'Não foi possivel salvar os dados' })
    }
  })()
})

//get => get()
//pegar os dados de um unico usuario por id
app.get('/api/get/:id', (req, res) => {
  ;(async () => {
    try {
      const reqUser = db.collection('userDetails').doc(req.params.id)
      let userDetails = await reqUser.get()
      let response = userDetails.data()

      return res.status(200).send({ status: 'Sucess', data: response })
    } catch (error) {
      console.log(error)
      return res
        .status(500)
        .send({ status: 'Failed', msg: 'Usuário não encontrado' })
    }
  })()
})

//pegar todos os dados do banco

app.get('/api/getAll', (req, res) => {
  ;(async () => {
    try {
      const query = db.collection('userDetails')
      let response = []

      await query.get().then(data => {
        let docs = data.docs

        docs.map(doc => {
          const selectedItem = {
            firstName: doc.data().firstName,
            lastName: doc.data().lastName,
            email: doc.data().email,
            password: doc.data().password
          }

          response.push(selectedItem)
        })
        return response
      })

      return res.status(200).send({ status: 'Secess', data: response })
    } catch (error) {
      console.log(error)
      return res
        .status(500)
        .send({ status: 'Failed', msg: 'Nenhum arquivo encontrado' })
    }
  })()
})

//update => put()

app.put('/users/update/:id', (req, res) => {
  ;(async () => {
    try {
      const reqUser = db.collection('userDetails').doc(req.params.id)
      await reqUser.update({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password
      })

      return res.status(200).send({ status: 'Secess', msg: 'Dados alterados.' })
    } catch (error) {
      console.log(error)
      return res
        .status(500)
        .send({ status: 'Failed', msg: 'Não foi possivel atualizar os dados' })
    }
  })()
})

//delete => delete()

app.delete('/users/delete/:id', (req, res) => {
  ;(async () => {
    try {
      const reqUser = db.collection('userDetails').doc(req.params.id)
      await reqUser.delete()

      return res.status(200).send({ status: 'Secess', msg: 'Dados deletados.' })
    } catch (error) {
      console.log(error)
      return res
        .status(500)
        .send({ status: 'Failed', msg: 'Não foi possivel deletar os dados' })
    }
  })()
})

//exports the api to firebase cloud functions

exports.app = functions.https.onRequest(app)
