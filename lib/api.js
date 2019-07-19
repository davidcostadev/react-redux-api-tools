function buildRequest(url, requestData) {
  const request = new Request(url, { ...requestData });
  return request;
}

function fetchFromApi(url, requestData = { method: 'GET' }) {
  if (!requestData.headers) {
    requestData.headers = {};
  }

  if (!requestData.headers['content-type']) {
    requestData.headers['content-type'] = 'application/json';
  }

  return fetch(buildRequest(url, requestData))
    .then(response => {
      // if it's a json response, we unpack and parse it
      if (response.headers.get('content-type') === 'application/json') {
        return response.json().then(data => {
          response.data = data; // from backend response

          return Promise.resolve(response);
        });
      }

      return Promise.resolve(response);
    })
    .then(response => {
      // here, we prepare fetch to reject when the status is 4xx or above
      if (response.status >= 400) {
        return Promise.reject(response);
      }
      return Promise.resolve(response);
    });
}

export default fetchFromApi;
