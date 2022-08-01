/** BizTime express application. */


const express = require("express");

const app = express();
const ExpressError = require("./expressError")

const db = require("./db")

app.use(express.json());

const companyRoutes = require('./routes/companies.js')
app.use("/companies", companyRoutes);

const invoiceRoutes = require(`./routes/invoices.js`);
app.use(`/invoices`, invoiceRoutes);

const industryRoutes = require(`./routes/industries.js`);
app.use(`/industries`, industryRoutes)


/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
  });
});


module.exports = app;
