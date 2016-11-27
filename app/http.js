import config from './config';

function getParams(method, url, data) {
  if (!url.startsWith(config.api)) {
    url = config.api + url;
  }

  var params = {
    method: method,
    url: url,
    data: data,
  };

  if (localStorage.accessToken) {
    params.headers = {
      Authorization: 'Bearer ' + localStorage.accessToken,
    };
  }

  return params;
}

export default {
  get: function (url, data) {
    return $.ajax(getParams('GET', url, data));
  },

  post: function (url, data) {
    return $.ajax(getParams('POST', url, data));
  },
};
