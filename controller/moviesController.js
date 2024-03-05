const Movie = require("../Models/movieModels")


module.exports.getHighestRated = (req, res, next) => {
  req.query.limit = "5",
  req.query.sort = "-ratings"

  next()
}

module.exports.getAllMovies = async (req, res) => {
  try{
    //*******************exclude some field from query object */
    const excludeField = ["sort", "page", "limit", "fields"];
    const queryObj = {...req.query};

    excludeField.forEach((el) => {
      delete queryObj[el]
    })

    // const movies = await Movie.find(queryObj)

    //*************************************************** */
    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
    const queryBy = JSON.parse(queryStr);

    let query = Movie.find(queryBy)

    // sorting logic

    if(req.query.sort){
      const sortBy = req.query.sort.split(",").join(" ")
      query = query.sort(sortBy)
    }else{
      query = query.sort('createdAt')
    }

    //limiting fields
    if(req.query.fields){
      const fields = req.query.fields.split(",").join(" ");
      query.select(fields)
    }else{
      query.select("-__v");
    }

    // pagination
    const page = req.query.page || 1;
    const limit = req.query.limit*1 || 10;
    const skip = (page-1)*limit;
    query = query.skip(skip).limit(limit)

    if(req.query.page){
      const moviesCount = await Movie.countDocuments();
      if(skip >= moviesCount){
        throw new Error("This page is not found");
      }
    }

    const movies = await query

    //******************************************************** */


    // const movies = await Movie.find()
    //                         .where("duration")
    //                         .gte(req.query.duration.gte)
    //                         .where("ratings")
    //                         .gte(req.query.ratings.gte)
    //                         .where("price")
    //                         .lte(req.query.price.lte)

    res.status(200).json({
      status: "success",
      count: movies.length,
      data: {
        movies
      }
    })
  }catch(err){
    res.status(404).json({
      status: "fail",
      message: err.message
    })
  }
};

module.exports.getMovie = async (req, res) => {
  try{
    const movie = await Movie.findById(req.params.id)

    res.status(200).json({
      status: "success",
      data: {
        movie
      }
    })
  }catch(err){
    res.status(404).json({
      status: "fail",
      message: err.message
    })
  }
};

module.exports.createMovie = async (req, res) => {
  try{
    const movie = await Movie.create(req.body)

    res.status(201).json({
      status: "success",
      data: {
        movie
      }
    })
  }catch(err){
    res.status(400).json({
      status: "fail",
      message: err.message
    })
  }
};

module.exports.updateMovie = async (req, res) => {
  try{
    const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidator: true})

    res.status(200).json({
      status: "success",
      data: {
        movie: updatedMovie
      }
    })
  }catch(err){
    res.status(400).json({
      status: "fail",
      message: err.message
    })
  }
};

module.exports.deleteMovie = async(req, res) => {
  try{
    await Movie.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: "success",
      data: null
    })
  }catch(err){
    res.status(400).json({
      status: "fail",
      message: err.message
    })
  }
};
