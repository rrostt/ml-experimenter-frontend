import config from './config';
import request from 'superagent';

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

  postFiles: function (url, files) {
    var params = getParams('POST', url, {});

    var req = request.post(params.url);
    req.set('Authorization', params.headers.Authorization);
    files.forEach((file)=> {
      req.attach(file.name, file);
    });

    return new Promise((resolve, reject) => {
      req.end((err, response) => {
        console.log('upload done?');
        if (err) {
          reject(err);
        } else {
          var result = response.text;

          try {
            result = JSON.parse(response.text);
          } catch (e) {}

          resolve(result);
        }
      });
    });
  },
};
