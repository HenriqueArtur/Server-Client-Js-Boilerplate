const axios = require('axios')

export async function _get({url, route, auth}) {
  const query = {
    method: "get",
    url: url + route,
    headers: {
      authorization: auth
    }
  }

  return await request(query)
}

export async function _post({url, route, auth, body}) {
  const query = {
    method: "post",
    url: url + route,
    headers: {
      authorization: auth
    },
    data: body
  }

  return await request(query)
}

export async function _put({url, route, auth, body}) {
  const query = {
    method: "put",
    url: url + route,
    headers: {
      authorization: auth
    },
    data: body
  }

  return await request(query)
}

export async function _delete({ url, route, auth, body }) {
  const query = {
    method: "delete",
    url: url + route,
    headers: {
      authorization: auth
    },
    data: body
  }
  return await request(query)
}

async function request(query = {}) {
  return await axios(query)
}