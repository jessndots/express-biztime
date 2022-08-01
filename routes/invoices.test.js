process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let testCompany;
let testInvoice;
beforeAll(async function(){
    await db.query(`DELETE FROM companies`);
    await db.query(`DELETE FROM invoices`);
})

beforeEach(async function(){
    const compResult = await db.query(`INSERT INTO companies (code, name, description) VALUES ('test', 'Test Company', 'This is just a test company') RETURNING code, name, description`);
    testCompany = compResult.rows[0];
    const invResult = await db.query(`INSERT INTO invoices (comp_Code, amt, paid, paid_date)
    VALUES ('test', 100, false, null) RETURNING id, comp_Code, amt, paid, paid_date`)
    testInvoice = invResult.rows[0];

})

afterEach(async function(){
    await db.query(`DELETE FROM companies`);
    await db.query(`DELETE FROM invoices`);
})

afterAll(async function(){
    await db.end();
})


describe(`GET /invoices`, function(){
    test(`Gets a list of invoices`, async function(){
        const response = await request(app).get(`/invoices`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([testInvoice])
    })
})

describe(`GET /invoices/:id`, function(){
    test(`Gets a single invoice`, async function(){
        const response = await request(app).get(`/invoices/${testInvoice.id}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([testInvoice])
    });
    test(`Responds with 404 if can't find invoice`, async function(){
        const response = await request(app).get(`/invoices/99`);
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({"error": {
            "message": "Could not find invoice with id 99", "status": 404}})
    })
})

describe(`POST /invoices`, function(){
    test(`Creates a new invoice`, async function(){
        const response = await request(app).post(`/invoices/`).send({comp_Code: 'test', amt: 420.69, paid: false, paid_date: null});
        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({"id": expect.any(Number), "comp_code": "test", "amt": 420.69, "paid": false, "paid_date": null});
    });
    test(`Responds with 404 if empty request`, async function(){
        const response = await request(app).post(`/invoices/`).send({});
        expect(response.statusCode).toEqual(404);

    })
})

describe(`PUT /invoices/:id`, function(){
    test(`Updates a single invoice`, async function(){
        const response = await request(app).put(`/invoices/${testInvoice.id}`).send({amt: 69.69, paid: true});
        // expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({invoice: {id: expect.any(Number), comp_code: 'test', amt: 69.69, paid: true, paid_date: expect.stringContaining('2022-')}});
    })
    // test(`Responds with 404 if can't find invoice`, async function(){
    //     const response = await request(app).put(`/invoices/99`).send({comp_Code: 'test', amt: 69.69, paid: true, paid_date: '07/31/22'});
    //     // expect(response.statusCode).toEqual(404);
    //     expect(response.body).toEqual({"error": {"message": "Invoice not found", "status": 404}})
    // })
})

describe(`DELETE /invoices/:id`, function(){
    test('Deletes a single invoice', async function(){
        const response = await request(app).delete(`/invoices/${testInvoice.id}`);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({message: 'Deleted'});
    })
    test(`Responds with 404 if can't find invoice`, async function(){
        const response = await request(app).delete(`/invoices/99`)
        expect(response.statusCode).toEqual(404);
        expect(response.body).toEqual({"error": {"message": "Invoice not found", "status": 404}})
    })
})