// esta es la version de la app usando la libreria cors

const express = require('express');
const crypto = require('node:crypto');
const cors = require('cors');
const movies = require('./movies.json');
const { validateMovie, validatePartialMovie } = require('./schemas/movies');

// Inicializar express
const app = express();

// captura la request y detecta si tiene que hacer la transformacion
// de JSON a string y agregar la cabecera Content-Type: application/json
app.use(express.json());

// habilitar cors con la configuracion por defecto
// que acepta cualquier origen
// app.use(cors());

// habilitar cors con configuracion personalizada
app.use(
  cors({
    origin: (origin, callback) => {
      const ACCEPTED_ORIGINS = [
        'http://127.0.0.1:5500',
        'http://localhost:5500',
        'http://localhost:1234',
        'https://movies.com',
        'https://midu.dev'
      ];

      if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    }
  })
);

// deshabilitar la cabecera X-Powered-By por seguridad
// esta la agrega express por defecto
app.disable('x-powered-by');

// definir la funcion que se ejecuta cuando llega una request
// con el metodo GET y la ruta indicada
// Todos los recursos que sean MOVIES se identifican con /movies
app.get('/movies', (req, res) => {
  // req.query es un objeto con los parametros de la query string
  const { genre } = req.query;
  if (genre) {
    const filteredMovies = movies.filter((movie) =>
      movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
    return res.json(filteredMovies);
  }
  // para enviar un JSON, express se encarga de convertirlo a string
  // y de agregar la cabecera Content-Type: application/json
  res.json(movies);
});

// :id es un segmento dinamico, el id es un parametro de la url
app.get('/movies/:id', (req, res) => {
  // req.params es un objeto con los parametros de la ruta
  // en este caso, el id
  const { id } = req.params;
  const movie = movies.find((movie) => movie.id === id);

  if (movie) return res.json(movie);
  res.status(404).json({ message: 'Movie not found' });
});

// Todos los recursos que sean MOVIES se identifican con /movies
// crear un recurso
app.post('/movies', (req, res) => {
  // req.body es un objeto con los datos enviados en el body
  // validar los datos recibidos con zod
  const result = validateMovie(req.body);

  if (!result.success) {
    // 400 Bad Request
    return res.status(400).json({ error: JSON.parse(result.error.message) });
  }

  const newMovie = {
    // generar un id unico con la libreria nativa crypto
    id: crypto.randomUUID(),
    // podemos devolver los datos ya validados, no va a dejar pasar
    // datos que no cumplan con el schema
    ...result.data
  };

  // esto no seria REST porque estamos guardando
  // el estado de la aplicacion en memoria
  // req.body deberíamos guardarlo en base de datos
  movies.push(newMovie);
  // 201 Created
  // al devolver el recurso creado, se actualiza la caché del navegador
  res.status(201).json(newMovie);
});

// Todos los recursos que sean MOVIES se identifican con /movies
// eliminar un recurso
app.delete('/movies/:id', (req, res) => {
  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' });
  }

  movies.splice(movieIndex, 1);

  return res.json({ message: 'Movie deleted' });
});

// Todos los recursos que sean MOVIES se identifican con /movies
// actualizar un recurso
app.patch('/movies/:id', (req, res) => {
  const { id } = req.params;
  const result = validatePartialMovie(req.body);

  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) });
  }

  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' });
  }

  const updatedMovie = {
    ...movies[movieIndex],
    ...result.data
  };
  movies[movieIndex] = updatedMovie;

  return res.json(updatedMovie);
});

// cuando se haga un despliegue en produccion, el puerto lo va a indicar
// el proveedor de hosting en la variable de entorno PORT
// por eso es importante dejarlo de esta forma
const PORT = process.env.PORT ?? 1234;

// la aplicacion escucha en el puerto indicado
app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`);
});
