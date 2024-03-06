class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {

    const excludeField = ["sort", "page", "limit", "fields"];
    const queryObj = {...this.queryStr};

    excludeField.forEach((el) => {
      delete queryObj[el]
    })

    let queryString = JSON.stringify(queryObj);

    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const queryBy = JSON.parse(queryString);

    this.query = this.query.find(queryBy);

    return this;
  }

  sort(){
    if(this.queryStr.sort){
        const sortBy = this.queryStr.sort.split(",").join(" ")
        this.query = this.query.sort(sortBy)
      }else{
        this.query = this.query.sort('createdAt')
      }

      return this;
  }

  limitFields(){
    if(this.queryStr.fields){
        const fields = this.queryStr.fields.split(",").join(" ");
        this.query.select(fields)
      }else{
        this.query.select("-__v");
      }

      return this;
  }

  paginate(){
    const page = this.queryStr.page || 1;
    const limit = this.queryStr.limit*1 || 10;
    const skip = (page-1)*limit;
    this.query = this.query.skip(skip).limit(limit)

    // if(this.queryStr.page){
    //   const moviesCount = await Movie.countDocuments();
    //   if(skip >= moviesCount){
    //     throw new Error("This page is not found");
    //   }
    // }

    return this;
  }
}

module.exports = ApiFeatures;
