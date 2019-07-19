import fetchFromApi from '../lib/api';

describe('fetchFromApi', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('should resolve fetch and return data with error', async () => {
    const headers = new Headers({ 'Content-Type': 'text/html' });
    fetch.mockResolvedValue({
      status: 400,
      message: 'The name is empty',
      headers,
    });

    const requestData = {
      method: 'POST',
      body: { name: '' },
    };
    try {
      await fetchFromApi('http://localhost:3000/products', requestData);
    } catch (e) {
      expect(e).toEqual({
        status: 400,
        message: 'The name is empty',
        headers,
      });
    }
  });

  it('should resolve fetch and return data', async () => {
    const body = {
      data: [{ name: 'Xbox' }],
    };
    fetch.mockResponse(JSON.stringify(body), {
      headers: {
        'content-type': 'application/json',
      },
    });

    const response = await fetchFromApi('http://localhost:3000/products');
    expect(response.body).toEqual(JSON.stringify(body));
  });

  it('should define application/json as default headers', async () => {
    fetch.mockResolvedValue({
      data: [{ name: 'Xbox' }],
      headers: new Headers({ 'Content-Type': 'text/html' }),
    });
    const requestData = {};

    await fetchFromApi('http://localhost:3000/products', requestData);

    expect(requestData).toEqual({
      headers: {
        'content-type': 'application/json',
      },
    });
  });

  it('should not overwrite content type if specified in requestData', async () => {
    const body = {
      data: [{ name: 'Xbox' }],
    };
    fetch.mockResponse(JSON.stringify(body), {
      headers: {
        'content-type': 'application/json',
      },
    });
    const requestData = {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    };

    await fetchFromApi('http://localhost:3000/products', requestData);

    expect(requestData).toEqual({
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    });
  });

  it('should reject fetch and catch by error', async () => {
    fetch.mockRejectedValue(new Error('404 Not found'));
    try {
      await fetchFromApi('http://localhost:3000/products/999');
    } catch (e) {
      expect(e).toEqual(new Error('404 Not found'));
    }
  });
});
