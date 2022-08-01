process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let testCompany;
beforeAll(async function(){
    await db.query(`DELETE FROM companies`);
})

beforeEach(async function(){
    const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ('test', 'Test Company', 'This is just a test company') RETURNING code, name, description`);
    testCompany = result.rows[0];
})

afterEach(async function(){
    await db.query(`DELETE FROM companies`);
})

afterAll(async function(){
    await db.end();
})


describe(`GET /companies`, function(){
    test(`Gets a list of companies`, async function(){
        const response = await request(app).get(`/companies`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([testCompany])
    })
})

describe(`GET /companies/:code`, function(){
    test(`Gets a single company`, async function(){
        const response = await request(app).get(`/companies/${testCompany.code}`);
        testCompany.invoices = [];
        testCompany.industry = null;
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(testCompany)
    });
    test(`Responds with 404 if can't find company`, async function(){
        const response = await request(app).get(`/companies/missing`);
        // expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({error: {message: "Company not found", status: 404}})
    })
})

describe(`POST /companies`, function(){
    test(`Creates a new company`, async function(){
        const response = await request(app).post(`/companies/`).send({name:`Test Company 2`, description: `It's another test company`});
        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({code: expect.any(String), name:`Test Company 2`, description: `It's another test company`});
    })
})

describe(`PUT /companies/:code`, function(){
    test(`Updates a single company`, async function(){
        const response = await request(app).put(`/companies/${testCompany.code}`).send({code: testCompany.code, name: 'The Test Company', description: testCompany.description});
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({code: testCompany.code, name: 'The Test Company', description: testCompany.description});
    })
    test(`Responds with 404 if can't find company`, async function(){
        const response = await request(app).put(`/companies/fake`).send({code: testCompany.code, name: 'The Test Company', description: testCompany.description});
        expect(response.statusCode).toEqual(404);
    })
})

describe(`DELETE /companies/:code`, function(){
    test('Deletes a single company', async function(){
        const response = await request(app).delete(`/companies/${testCompany.code}`);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({message: 'Deleted'});
    })
})