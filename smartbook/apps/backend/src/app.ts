import cors from 'cors'
import express from 'express'

import globalRoutes from './routes/global.routes.js'
import publicRoutes from './routes/public.routes.js'

const app = express()

app.use(cors({
  origin: 'https://smartbook9.onrender.com', // Адрес твоего фронтенда
  credentials: true
}));

app.use(express.json());

app.use('/api', globalRoutes)
app.use('/c/:slug', publicRoutes)

export default app
