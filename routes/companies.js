const express = require("express");
const expressError = require('../expressError');
const router = new express.Router();
const db = require("../db")


router.get("/", async function(req, res, next){
    try{ 
        const results = await db.query(`SELECT code, name FROM companies`);
        return res.json(results.rows);}
    catch(err){
        return next(err);
    }
});


router.get("/:code", async function(req, res, next) {
    try {
        const companyResp = await db.query(
            'SELECT code, name FROM companies WHERE code=$1', [req.params.code]);
        const invoiceResp = await db.query(`SELECT id, amt, paid, add_date, paid_date FROM invoices WHERE comp_Code=$1`, [req.params.code])
        if (companyResp.rows.length === 0) {
            throw new expressError(`Could not find company with code: ${req.params.code}`, 404)
        }
        const company = companyResp.rows[0];
        company.invoices = invoiceResp.rows;
        
        return res.json(company);
    }
    catch(err){
        return next(err);
    }
})


router.post("/", async function(req, res, next){
    try{
        const {code, name, description} = req.body;
        const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description]);
        return res.status(201).json(result.rows[0]);
    }
    catch(err) {
        return next(err)
    }
})


router.put("/:code", async function(req, res, next){
    try {
        const result = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`, [req.body.name, req.body.description, req.params.code]);
        if (result.rows.length === 0){
            throw new expressError("Company not found", 404);
        }
        return res.json(result.rows[0]);
    }
    catch(err){
        return next(err);
    }
})


router.delete("/:code", async function(req, res, next){
    try {
        const result = await db.query(`DELETE FROM companies WHERE code=$1 RETURNING code, name`, [req.params.code]);
        if (result.rows.length === 0){
            throw new expressError(`Company not found`, 404)
        }
        return res.json({message: "Deleted"});
    }
    catch(err){
        return next(err)
    }
})


module.exports = router;