const fs = require("fs");

let movies = JSON.parse(fs.readFileSync("./data/movies.json"));

module.exports.checkId = (req, res, next, value) => {
  const movie = movies.find((el) => el.id === value * 1);

  if (!movie) {
    return res.status(201).json({
      status: "fail",
      message: `there is no movie to this ID ${value}`,
    });
  }

  next();
};

module.exports.validateBody = (req, res, next) => {
  if (!req.body.name || !req.body.releaseYear) {
    return res.status(201).json({
      status: "fail",
      messege: "this is not a valid data",
    });
  }

  next();
};

module.exports.getAllMovies = (req, res) => {
  res.status(200).json({
    status: "success",
    count: movies.length,
    data: {
      movies: movies,
    },
  });
};

module.exports.getMovie = (req, res) => {
  const id = req.params.id * 1;
  console.log(id);
  const movie = movies.find((el) => el.id === id);

  res.status(200).json({
    status: "success",
    data: {
      movie: movie,
    },
  });
};

module.exports.createMovie = (req, res) => {
  const id = movies[movies.length - 1].id + 1;
  const newMovie = Object.assign({ id: id }, req.body);
  movies.push(newMovie);
  const writeNewMovie = JSON.stringify(movies);

  fs.writeFile("./data/movies.json", writeNewMovie, (err) => {
    res.status(200).json({
      status: "success",
      data: {
        movie: newMovie,
      },
    });
  });
};

module.exports.updateMovie = (req, res) => {
  const movie = movies.find((el) => el.id === req.params.id * 1);
  const updatedMovie = Object.assign(movie, req.body);
  const index = movies.indexOf(movie);

  movies.splice(index, 1, updatedMovie);

  fs.writeFile("./data/movies.json", JSON.stringify(movies), (err) => {
    res.status(200).json({
      status: "success",
      data: {
        movie: updatedMovie,
      },
    });
  });
};

module.exports.deleteMovie = (req, res) => {
  const id = req.params.id * 1;
  const movieToDelete = movies.find((el) => el.id === id);
  const index = movies.indexOf(movieToDelete);

  const deletedMovie = movies.splice(index, 1);

  fs.writeFile("./data/movies.json", JSON.stringify(movies), (err) => {
    res.status(204).json({
      status: "success",
      data: {
        movie: deletedMovie,
      },
    });
  });
};
