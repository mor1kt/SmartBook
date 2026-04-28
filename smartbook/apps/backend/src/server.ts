import console from 'console'
import 'dotenv/config';

import app from './app.js'
import { env } from './db/env.js';

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`)
})

app.get('/', (req, res) => {
  res.send('Smartbook Backend is running!');
});
