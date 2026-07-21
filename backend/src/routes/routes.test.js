const request = require('supertest');
const express = require('express');

// 1. Mock the database so tests don't need a real MySQL connection
jest.mock('../config/db', () => ({
  query: jest.fn(),
  getConnection: jest.fn(),
}));
//mock tc validator bcs its tested seperately anyway
jest.mock('../utils/validators', () => ({
  validateCustomer: jest.fn().mockReturnValue([]), 
}));


//mock connection for post/put tests 
function mockconnection(){
    const conn = {query: jest.fn(),
    beginTransaction: jest.fn().mockResolvedValue(),
    commit: jest.fn().mockResolvedValue(),
    rollback: jest.fn().mockResolvedValue(),
    release: jest.fn()};
    pool.getConnection.mockResolvedValue(conn);
    return conn;
}

const pool = require('../config/db');

// 2. Import your routes
const customerRouter = require('./customers');

// 3. Create a test app
const app = express();
app.use(express.json());
app.use('/api/customers', customerRouter);

// 4. Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

test('GET /api/customers returns 200 and a list', async () => {
  
  pool.query.mockResolvedValue([[{ id: 1, first_name: 'Murtaza' }]]);

  // Act: send the request
  const res = await request(app).get('/api/customers');

  // Assert: check the result
  expect(res.status).toBe(200);
  expect(res.body).toEqual([{ id: 1, first_name: 'Murtaza' }]);
});

test('GET /api/customers/:id returns 200 and the customer', async()=>{
    pool.query.mockResolvedValue([[{ id: 5, first_name: 'Murtaza' }]]);
    const res = await request(app).get('/api/customers/5');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({id:5, first_name:'Murtaza'});
});

test('POST /api/customers creates a customer', async () =>{
    const conn = mockconnection();
    conn.query.mockResolvedValueOnce([[{new_no: 'M-00067'}]]);
    conn.query.mockResolvedValueOnce([[{insertId:13}]]);
    conn.query.mockResolvedValueOnce([[{insertId:13}]]);
    conn.query.mockResolvedValueOnce([[{id:13, first_name:'Murtaza'}]]);

    const res = await request(app).post('/api/customers').send({customer_type: 'individual',
  first_name: 'Murtaza',
  last_name: 'Yılmaz',
  phone: '555',
  email: 'x@x.com',
  tc_kimlik_no: 'whatever',
  gender: 'E',
  birth_date: '2000-01-01',
  birth_place: 'Istanbul',})
})
