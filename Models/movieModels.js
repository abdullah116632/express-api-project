const mongoose = require("mongoose");

const movieSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name field is required"],
        unique: true
    },
    description: String,
    duration: {
        type: Number,
        required: true,
    },
    ratings: {
        type: Number,
        default: 1
    }
})

const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;