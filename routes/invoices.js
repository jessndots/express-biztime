const express = require("express");
const expressError = require('../expressError');
const router = new express.Router();
const dayjs = require("dayjs")
const db = require("../db")

// id, comp_Code, amt, paid, add_date, paid_date

router.get("/", async function(req, res, next){
    try{ 
        const results = await db.query(`SELECT id, comp_Code, amt, paid, paid_date FROM invoices`);
        if (results.rows.length === 0){
            return res.json({message: "There are currently no invoices"})
        }
        return res.json(results.rows);}
    catch(err){
        return next(err);
    }
});


router.get("/:id", async function(req, res, next) {
    try {
        const id = req.params.id;
        const result = await db.query(
            'SELECT id, comp_Code, amt, paid, paid_date FROM invoices WHERE id=$1', [id]);
        if (result.rows.length === 0) {
            throw new expressError(`Could not find invoice with id ${id}`, 404)
        }
        return res.json(result.rows);
    }
    catch(err){
        return next(err);
    }
})


router.post("/", async function(req, res, next){
    try{
        if (!req.body.comp_Code){
            throw new expressError(`Request must provide a valid company code.`, 404)
        }
        if (!req.body.amt){
            throw new expressError(`Request must provide a valid invoice amount`, 404)
        }
        const {comp_Code, amt, paid, paid_date} = req.body;
        const result = await db.query(`INSERT INTO invoices (comp_Code, amt, paid, paid_date) VALUES ($1, $2, $3, $4) RETURNING id, comp_Code,amt, paid, paid_date`, [comp_Code, amt, paid, paid_date]);
        return res.status(201).json(result.rows[0]);
    }
    catch(err) {
        return next(err)
    }
})


router.put("/:id", async function(req, res, next){
    try {
        const {amt, paid} = req.body;
        let paid_date;
        const check = await db.query(`SELECT amt, paid, paid_date FROM invoices WHERE id=$1`, [req.params.id])
        const inv = check.rows[0];
        if (!inv.paid && paid === true){
            paid_date = dayjs();
        } else if (inv.paid && !paid) {
            paid_date = null;
        } else {
            paid_date = inv.paid_date
        }
        const result = await db.query(`UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id=$4 RETURNING id, comp_Code, amt, paid, paid_date`, [amt, paid, paid_date, req.params.id]);
        if (result.rows.length === 0){
            throw new expressError("Invoice not found", 404);
        }
        return res.json({invoice: result.rows[0]});
    }
    catch(err){
        return next(err);
    }
})


router.delete("/:id", async function(req, res, next){
    try {
        const result = await db.query(`DELETE FROM invoices WHERE id=$1 RETURNING id, comp_Code`, [req.params.id]);
        if (result.rows.length === 0){
            throw new expressError(`Invoice not found`, 404)
        }
        return res.json({message: "Deleted"});
    }
    catch(err){
        return next(err)
    }
})


module.exports = router;