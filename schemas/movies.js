const z = require('zod');

// validar los datos recibidos
// si se pasa una propiedad que no esta en el schema, la ignora
const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Title must be a string',
    required_error: 'Title is required'
  }),
  year: z.number().int().min(1888).max(2023),
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().min(1).max(10).default(5),
  poster: z.string().url({
    message: 'Poster must be a valid URL'
  }),
  genre: z.array(
    z.enum([
      'Action',
      'Adventure',
      'Comedy',
      'Crime',
      'Drama',
      'Fantasy',
      'Horror',
      'Thriller',
      'Sci-Fi'
    ]),
    {
      required_error: 'Genre is required',
      invalid_type_error: 'Genre must be an array of enum Genre'
    }
  )
});

// funcion para validar el objeto recibido
function validateMovie(object) {
  // para validar el objeto
  return movieSchema.safeParse(object);
}

function validatePartialMovie(object) {
  // partial() permite que las propiedades del objeto sean opcionales
  // pero las que estan deben cumplir con el schema
  return movieSchema.partial().safeParse(object);
}

module.exports = {
  validateMovie,
  validatePartialMovie
};
