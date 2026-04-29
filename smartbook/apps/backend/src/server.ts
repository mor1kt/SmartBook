import 'dotenv/config';
import app from './app.js';
import { env } from './db/env.js';

// Используем порт от Render или из конфига
const port = Number(process.env.PORT || env.PORT || 3000);

// Добавляем обработчик корня (лучше перенести в app.js, но можно и тут до listen)
app.get('/', (req, res) => {
  res.send('Smartbook Backend is running!');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
