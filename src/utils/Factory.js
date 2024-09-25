const expressAsyncHandler = require("express-async-handler");
const ApiError = require("./ApiError");
const ApiFeatures = require("./ApiFeatures");

exports.deleteDocument = (model) =>
  expressAsyncHandler(async (req, res, next) => {
    const document = await model.findById(req.params.id);
    if (!document) {
      next(new ApiError("No document found with that ID", 404));
    }
    await document.remove();
    res.status(204).end();
  });

exports.updateDocument = (model) =>
  expressAsyncHandler(async (req, res, next) => {
    const document = await model.findById(req.params.id);
    if (!document) {
      next(new ApiError("No document found with that ID", 404));
    }
    Object.keys(req.body).forEach((key) => {
      document[key] = req.body[key];
    });
    await document.save();
    res.json(document);
  });

exports.createDocument = (model) =>
  expressAsyncHandler(async (req, res) => {
    const document = await model.create(req.body);
    res.status(201).json(document);
  });

exports.getDocument = (model) =>
  expressAsyncHandler(async (req, res, next) => {
    const document = await model.findById(req.params.id);
    if (!document) {
      next(new ApiError("No document found with that ID", 404));
    }
    res.json(document);
  });

exports.getAllDocuments = (model) =>
  expressAsyncHandler(async (req, res) => {
    const { mongooseQuery, pagination } = new ApiFeatures(
      model.find(),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const documents = await mongooseQuery;
    res.json({ documents, pagination });
  });
