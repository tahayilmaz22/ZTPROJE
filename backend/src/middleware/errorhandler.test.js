
const { errorHandler, createError } = require('./errorHandler');


test.each([
  { status: 500, msg: 'Internal Server Error', expectedStatus: 500, expectedMsg: 'Internal Server Error' },
  { status: 404, msg: 'User not found', expectedStatus: 404, expectedMsg: 'User not found' },
  { status: 401, msg: 'Unauthorized', expectedStatus: 401, expectedMsg: 'Unauthorized' },
  { status: 400, msg: undefined, expectedStatus: 400, expectedMsg: '' }, // Missing message
  { status: undefined, msg: 'Custom error', expectedStatus: undefined, expectedMsg: 'Custom error' }, // Missing status
])(
  'createError($status, $msg) should set status to $expectedStatus and message to $expectedMsg',
  ({ status, msg, expectedStatus, expectedMsg }) => {
    const error = createError(status, msg);

    expect(error).toBeInstanceOf(Error);
    expect(error.statusCode).toBe(expectedStatus);
    expect(error.message).toBe(expectedMsg);
  }
);

