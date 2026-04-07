import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000
const ACCESS_CODE = process.env.ACCESS_CODE

app.use(express.json())
app.use(express.static(join(__dirname, 'dist')))

app.post('/api/auth', (req, res) => {
  const { password } = req.body
  if (password === ACCESS_CODE) {
    res.json({ success: true })
  } else {
    res.status(401).json({ success: false })
  }
})

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
