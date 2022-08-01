const express = require("express");
const expressError = require('../expressError');
const slugify = require("slugify");
const router = new express.Router();
const db = require("../db")


router.get("/", async function(req, res, next){
    try{ 
        const results = await db.query(`SELECT code, name, description FROM companies`);
        return res.json(results.rows);}
    catch(err){
        return next(err);
    }
});


router.get("/:code", async function(req, res, next) {
    try {
        const compResp = await db.query(
            'SELECT c.code, c.name, c.description, i.industry FROM companies AS c LEFT JOIN companies_industries AS ci ON c.code = ci.comp_code LEFT JOIN industries AS i ON ci.ind_code = i.code WHERE c.code=$1', [req.params.code]);
        let industries = compResp.rows.map(i=>i.industry);
        const invResp = await db.query(`SELECT id, amt, paid, add_date, paid_date FROM invoices WHERE comp_code=$1`, [req.params.code]);
        if (compResp.rows.length === 0) {
            throw new expressError(`Company not found`, 404)
        }
        let comp = compResp.rows[0];
        comp.invoices = invResp.rows;
        
        return res.json(comp);
    }
    catch(err){
        return next(err);
    }
})


router.post("/", async function(req, res, next){
    try{
        const {name, description} = req.body;
        const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, [slugify(name), name, description]);
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