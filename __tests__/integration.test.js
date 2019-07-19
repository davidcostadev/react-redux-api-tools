import fetchFromApi from '../lib/api';
import apiMiddleware from '../lib/middleware';

describe('Integration tests', () => {
  let dispatch;
  let getState;
  let next;
  let action;

  beforeEach(() => {
    dispatch = jest.fn();
    getState = jest.fn();
    next = jest.fn();

    action = {
      types: {
        request: 'REQUEST',
        success: 'SUCCESS',
        failure: 'FAILURE',
      },
      apiCallFunction: () => fetchFromApi('/api/inventory'),
    };
  });

  it('Should work with json response', async () => {
    global.fetch.mockResponseOnce(JSON.stringify({ data: '12345' }), {
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ data: '12345' }),
    });

    const response = await apiMiddleware({ dispatch, getState })(next)(action);

    expect(dispatch).toBeCalledWith({
      extraData: {},
      type: 'REQUEST',
    });
    expect(dispatch).toBeCalledWith({
      extraData: {},
      response,
      type: 'SUCCESS',
    });
    expect(response.data).toEqual({ data: '12345' });
  });

  it('Should receive error with json response', async () => {
    global.fetch.mockResponseOnce(JSON.stringify({ message: 'Not Found Message' }), {
      headers: {
        'content-type': 'application/json',
      },
      status: 404,
      body: JSON.stringify({ message: 'Not Found Message' }),
    });

    try {
      await apiMiddleware({ dispatch, getState })(next)(action);
    } catch (error) {
      expect(error.status).toBe(404);
      expect(error.data).toEqual({
        message: 'Not Found Message',
      });
    }
  });

  it('Should work with text response', async () => {
    global.fetch.mockResponseOnce('Success Request', {
      body: 'Success Request',
    });

    const response = await apiMiddleware({ dispatch, getState })(next)(action);

    expect(response.body).toBe('Success Request');
  });

  it('Should receive error with text response', async () => {
    global.fetch.mockResponseOnce('Not Found Message', {
      status: 404,
      body: 'Not Found Message',
    });

    try {
      await apiMiddleware({ dispatch, getState })(next)(action);
    } catch (error) {
      expect(error.status).toBe(404);
      expect(error.body).toEqual('Not Found Message');
    }
  });

  it('Should work with reject on fetch', async () => {
    global.fetch.mockReject(new Error('Internal Error'));

    try {
      await apiMiddleware({ dispatch, getState })(next)(action);
    } catch (error) {
      expect(error).toEqual(new Error('Internal Error'));
    }
  });
});
