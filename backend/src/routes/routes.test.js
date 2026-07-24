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
  validateAccount: jest.fn().mockReturnValue([]),
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

// Access the mocked validateAccount to control per test
const { validateAccount } = require('../utils/validators');

// 2. Import your routes
const customerRouter = require('./customers');
const searchRouter = require('./search');
const dashboardRouter = require('./dashboard');
const accountsRouter = require('./accounts');
const { errorHandler } = require('../middleware/errorHandler');

// 3. Create a test app
const app = express();
app.use(express.json());
app.use('/api/customers', customerRouter);
app.use('/api/search', searchRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/accounts', accountsRouter);
app.use(errorHandler);

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

test('GET /api/customers?type=individual', async()=>{
  pool.query.mockResolvedValue([[{id:1, first_name:'mahmut'}]]);

  const res = await request(app).get('/api/customers?type=individual');

  expect(pool.query).toHaveBeenCalledWith(
  expect.stringContaining('AND c.customer_type = ?'),
  expect.arrayContaining(['individual']));
});

test('GET /api/customers?search=Murtaza', async()=>{
  pool.query.mockResolvedValue([[{ id: 5, first_name: 'Murtaza' }]]);
  const res = await request(app).get('/api/customers/?search=murtaza');
  expect(pool.query).toHaveBeenCalledWith(
  expect.stringContaining('c.first_name LIKE ? OR c.last_name LIKE ? OR c.customer_no LIKE ?'),
  ['%murtaza%', '%murtaza%', '%murtaza%']
);

})

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
});

test('PUT /api/customers/:id updates a customer (individual)', async () => {
  const conn = mockconnection();

  // 1. Check existing customer
  conn.query.mockResolvedValueOnce([[{ id: 5, customer_type: 'individual', first_name: 'Old' }]]);
  // 2. UPDATE base customers table
  conn.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
  // 3. DELETE old corporate data (switching/keeping individual type)
  conn.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
  // 4. INSERT ... ON DUPLICATE KEY UPDATE individual_customers
  conn.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
  // 5. SELECT full joined record after update
  conn.query.mockResolvedValueOnce([[{
    id: 5, customer_no: 'M-00005', customer_type: 'individual',
    first_name: 'Updated', last_name: 'Yılmaz',
    title: null, address: 'Ankara', phone: '555', email: 'updated@x.com',
    tc_kimlik_no: '12345678901', father_name: 'Ali', mother_name: 'Ayşe',
    birth_date: '2000-01-01', birth_place: 'Istanbul',
    gender: 'E', education_level: null, marital_status: null,
    is_public: null, tax_id_no: null,
  }]]);

  const res = await request(app)
    .put('/api/customers/5')
    .send({
      customer_type: 'individual',
      first_name: 'Updated',
      last_name: 'Yılmaz',
      phone: '555',
      email: 'updated@x.com',
      tc_kimlik_no: '12345678901',
      gender: 'E',
      birth_date: '2000-01-01',
      birth_place: 'Istanbul',
    });

  expect(res.status).toBe(200);
  expect(res.body.first_name).toBe('Updated');
  expect(res.body.id).toBe(5);
  expect(conn.beginTransaction).toHaveBeenCalled();
  expect(conn.commit).toHaveBeenCalled();
  expect(conn.release).toHaveBeenCalled();
});

test('PUT /api/customers/:id returns 404 when customer not found', async () => {
  const conn = mockconnection();

  // 1. Check existing customer → empty result
  conn.query.mockResolvedValueOnce([[]]);

  const res = await request(app)
    .put('/api/customers/999')
    .send({
      customer_type: 'individual',
      first_name: 'X',
      last_name: 'Y',
      phone: '555',
      email: 'x@x.com',
      tc_kimlik_no: '12345678901',
      gender: 'E',
      birth_date: '2000-01-01',
      birth_place: 'Istanbul',
    });

  expect(res.status).toBe(404);
  expect(conn.rollback).toHaveBeenCalled();
  expect(conn.release).toHaveBeenCalled();
});

test('DELETE /api/customers', async()=>{
  pool.query.mockResolvedValueOnce([[{id:6, customer_type: 'individual', first_name: 'tobedeleted'}]]);
  pool.query.mockResolvedValue([{affectedRows:1}]);
  const res = await request(app).delete('/api/customers/6');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Müşteri başarıyla silindi.');
    expect(res.body.customer.id).toBe(6);
});

// ── search.js tests ──────────────────────────────────────────────

test('GET /api/search?q= returns combined results', async () => {
  pool.query.mockResolvedValueOnce([[{ id: 1, first_name: 'Ali' }]]);            // customers
  pool.query.mockResolvedValueOnce([[{ id: 10, terminal_id: 'T1' }]]);           // terminals
  pool.query.mockResolvedValueOnce([[{ id: 5, name: 'Şube' }]]);                 // workplaces

  const res = await request(app).get('/api/search?q=ali');

  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    customers: [{ id: 1, first_name: 'Ali' }],
    terminals: [{ id: 10, terminal_id: 'T1' }],
    workplaces: [{ id: 5, name: 'Şube' }],
  });
});

test('GET /api/search?q= (missing query) returns empty arrays', async () => {
  const res = await request(app).get('/api/search');

  expect(res.status).toBe(200);
  expect(res.body).toEqual({ customers: [], terminals: [] });
  expect(pool.query).not.toHaveBeenCalled();
});

test('GET /api/search?q= (whitespace only) returns empty arrays', async () => {
  const res = await request(app).get('/api/search?q=   ');

  expect(res.status).toBe(200);
  expect(res.body).toEqual({ customers: [], terminals: [] });
  expect(pool.query).not.toHaveBeenCalled();
});

test('GET /api/search?q= handles DB error', async () => {
  pool.query.mockRejectedValue(new Error('DB down'));

  const res = await request(app).get('/api/search?q=ali');

  expect(res.status).toBe(500);
});

// ── dashboard.js tests ──────────────────────────────────────────────

test('GET /api/dashboard/stats returns all dashboard statistics', async () => {
  pool.query.mockResolvedValueOnce([[{ count: 4 }]]);   // open terminals
  pool.query.mockResolvedValueOnce([[{ total: 12500.75 }]]); // blocked amount
  pool.query.mockResolvedValueOnce([[{ count: 3 }]]);   // today's customers
  pool.query.mockResolvedValueOnce([[{ count: 42 }]]);  // total customers
  pool.query.mockResolvedValueOnce([[{ count: 10 }]]);  // total terminals
  pool.query.mockResolvedValueOnce([[{ count: 7 }]]);   // total workplaces

  const res = await request(app).get('/api/dashboard/stats');

  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    openTerminals: 4,
    totalBlockedAmount: 12500.75,
    todayCustomers: 3,
    totalCustomers: 42,
    totalTerminals: 10,
    totalWorkplaces: 7,
  });
});

test('GET /api/dashboard/stats returns zeros for empty database', async () => {
  pool.query.mockResolvedValueOnce([[{ count: 0 }]]);   // open terminals
  pool.query.mockResolvedValueOnce([[{ total: 0 }]]);   // blocked amount
  pool.query.mockResolvedValueOnce([[{ count: 0 }]]);   // today's customers
  pool.query.mockResolvedValueOnce([[{ count: 0 }]]);   // total customers
  pool.query.mockResolvedValueOnce([[{ count: 0 }]]);   // total terminals
  pool.query.mockResolvedValueOnce([[{ count: 0 }]]);   // total workplaces

  const res = await request(app).get('/api/dashboard/stats');

  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    openTerminals: 0,
    totalBlockedAmount: 0,
    todayCustomers: 0,
    totalCustomers: 0,
    totalTerminals: 0,
    totalWorkplaces: 0,
  });
});

test('GET /api/dashboard/stats handles database error', async () => {
  pool.query.mockRejectedValue(new Error('DB connection lost'));

  const res = await request(app).get('/api/dashboard/stats');

  expect(res.status).toBe(500);
});

// ── accounts.js tests ──────────────────────────────────────────────

// GET /api/accounts/customers/:customerId/accounts
test('GET /api/accounts/customers/:customerId/accounts returns account list', async () => {
  pool.query.mockResolvedValue([[{ id: 1, customer_id: 5, account_name: 'Vadesiz TL' }]]);

  const res = await request(app).get('/api/accounts/customers/5/accounts');

  expect(res.status).toBe(200);
  expect(res.body).toEqual([{ id: 1, customer_id: 5, account_name: 'Vadesiz TL' }]);
});

test('GET /api/accounts/customers/:customerId/accounts handles DB error', async () => {
  pool.query.mockRejectedValue(new Error('DB down'));

  const res = await request(app).get('/api/accounts/customers/5/accounts');

  expect(res.status).toBe(500);
});

// GET /api/accounts/
test('GET /api/accounts/ returns all accounts with customer info', async () => {
  pool.query.mockResolvedValue([[
    { id: 1, account_name: 'Vadesiz TL', customer_no: 'M-00001', first_name: 'Ali', last_name: 'Yılmaz' },
  ]]);

  const res = await request(app).get('/api/accounts/');

  expect(res.status).toBe(200);
  expect(res.body).toEqual([
    { id: 1, account_name: 'Vadesiz TL', customer_no: 'M-00001', first_name: 'Ali', last_name: 'Yılmaz' },
  ]);
});

test('GET /api/accounts/ handles DB error', async () => {
  pool.query.mockRejectedValue(new Error('DB down'));

  const res = await request(app).get('/api/accounts/');

  expect(res.status).toBe(500);
});

// GET /api/accounts/:id
test('GET /api/accounts/:id returns single account', async () => {
  pool.query.mockResolvedValue([[{ id: 10, account_name: 'Vadesiz TL', status: 'open' }]]);

  const res = await request(app).get('/api/accounts/10');

  expect(res.status).toBe(200);
  expect(res.body).toEqual({ id: 10, account_name: 'Vadesiz TL', status: 'open' });
});

test('GET /api/accounts/:id returns 404 when not found', async () => {
  pool.query.mockResolvedValue([[]]);

  const res = await request(app).get('/api/accounts/999');

  expect(res.status).toBe(404);
});

// POST /api/accounts/customers/:customerId/accounts
test('POST /api/accounts/customers/:customerId/accounts creates account', async () => {
  // Customer exists check
  pool.query.mockResolvedValueOnce([[{ id: 5 }]]);
  // INSERT
  pool.query.mockResolvedValueOnce([{ insertId: 20 }]);
  // SELECT inserted row
  pool.query.mockResolvedValueOnce([[{ id: 20, customer_id: 5, account_name: 'Vadesiz TL', status: 'open', currency_code: 'TRY' }]]);

  const res = await request(app)
    .post('/api/accounts/customers/5/accounts')
    .send({
      account_name: 'Vadesiz TL',
      extension_no: '001',
      status: 'open',
      currency_code: 'TRY',
      balance: 1000,
      blocked_amount: 0,
      interest_rate: 5,
      iban: 'TR330006100519786457841326',
    });

  expect(res.status).toBe(201);
  expect(res.body.account_name).toBe('Vadesiz TL');
  expect(res.body.id).toBe(20);
});

test('POST /api/accounts/customers/:customerId/accounts returns 404 when customer not found', async () => {
  pool.query.mockResolvedValueOnce([[]]); // customer check fails

  const res = await request(app)
    .post('/api/accounts/customers/999/accounts')
    .send({ account_name: 'Test', currency_code: 'TRY' });

  expect(res.status).toBe(404);
});

test('POST /api/accounts/customers/:customerId/accounts returns 400 when validation fails', async () => {
  pool.query.mockResolvedValueOnce([[{ id: 5 }]]); // customer exists
  validateAccount.mockReturnValueOnce(['Hesap adı zorunludur.']);

  const res = await request(app)
    .post('/api/accounts/customers/5/accounts')
    .send({ account_name: '' });

  expect(res.status).toBe(400);
});

// PUT /api/accounts/:id
test('PUT /api/accounts/:id updates account', async () => {
  // Existing check
  pool.query.mockResolvedValueOnce([[{ id: 10, account_name: 'Old', status: 'open' }]]);
  // UPDATE
  pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
  // SELECT updated row
  pool.query.mockResolvedValueOnce([[{ id: 10, account_name: 'Updated', status: 'closed' }]]);

  const res = await request(app)
    .put('/api/accounts/10')
    .send({
      account_name: 'Updated',
      extension_no: '002',
      status: 'closed',
      currency_code: 'USD',
      balance: 500,
      blocked_amount: 100,
      interest_rate: 3,
      iban: 'TR330006100519786457841326',
    });

  expect(res.status).toBe(200);
  expect(res.body.account_name).toBe('Updated');
  expect(res.body.id).toBe(10);
});

test('PUT /api/accounts/:id returns 404 when account not found', async () => {
  pool.query.mockResolvedValueOnce([[]]); // not found

  const res = await request(app)
    .put('/api/accounts/999')
    .send({ account_name: 'Test', currency_code: 'TRY' });

  expect(res.status).toBe(404);
});

test('PUT /api/accounts/:id returns 400 when validation fails', async () => {
  pool.query.mockResolvedValueOnce([[{ id: 10, account_name: 'Old' }]]); // exists
  validateAccount.mockReturnValueOnce(['Hesap adı zorunludur.']);

  const res = await request(app)
    .put('/api/accounts/10')
    .send({ account_name: '' });

  expect(res.status).toBe(400);
});

// DELETE /api/accounts/:id
test('DELETE /api/accounts/:id soft-deletes account', async () => {
  pool.query.mockResolvedValueOnce([[{ id: 15, account_name: 'ToDelete' }]]); // SELECT
  pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE SET deleted_at

  const res = await request(app).delete('/api/accounts/15');

  expect(res.status).toBe(200);
  expect(res.body.message).toBe('Hesap başarıyla silindi.');
  expect(res.body.account.id).toBe(15);
});

test('DELETE /api/accounts/:id returns 404 when account not found', async () => {
  pool.query.mockResolvedValueOnce([[]]); // not found

  const res = await request(app).delete('/api/accounts/999');

  expect(res.status).toBe(404);
});

