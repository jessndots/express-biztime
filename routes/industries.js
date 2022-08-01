const express = require("express");
const expressError = require('../expressError');
const router = new express.Router();
const dayjs = require("dayjs");
const db = require("../db");
const slugify = require("slugify");


router.get("/", async function(req, res, next){
    try{ 
        const results = await db.query(`
        SELECT i.code, i.industry, array_agg(c.name) AS companies
        FROM industries AS i 
        LEFT JOIN companies_industries AS ci 
        ON i.code = ci.ind_code 
        LEFT JOIN companies AS c 
        ON ci.comp_code = c.code 
        GROUP BY i.code`);
        
        if (results.rows.length === 0){
            return res.json({message: "Industries not found"})
        }

        return res.json(results.rows);}
    catch(err){
        return next(err);
    }
});


router.post("/", async function(req, res, next){
    try{
        const {code, industry} = req.body;
        const result = await db.query(`INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry`, [code, industry]);
        return res.status(201).json(result.rows[0]);
    }
    catch(err) {
        return next(err)
    }
})


router.post("/:code", async function(req, res, next){
    try {
        const {comp_code} = req.body;
        const result = await db.query('INSERT INTO companies_industries (comp_code, ind_code) VALUES ($1, $2) RETURNING comp_code, ind_code', [comp_code, req.params.code]);

        return res.status(201).json(result.rows[0]);
    }
    catch(err) {
        return next(err);
    }
})


module.exports = router;