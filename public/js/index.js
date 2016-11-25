var selectedClient;
var currentFile;
var socket = io();

socket.on('connect', function () {
  console.log('connected');
  socket.emit('ui-connected', 'ask4it');
});

socket.on('disconnect', function () {
  console.log('user disconnected');
});

socket.on('machines', function (machines) {
  console.log('machines', machines);
  renderMachines(machines);
});

socket.on('machine-state', function (state) {
  console.log('machine state', state);
  $('[client-id=' + state.id + ']').replaceWith(renderClient(state));

  if (selectedClient && state.id === selectedClient.id) {
    renderOutput(state);
  }
});

var codemirror;
$(function () {
  // tabs
  $('.nav-tabs a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
  });

  // setup code window
  var $codeTextArea = $('.code');
  var width = $codeTextArea.width();
  var height = $codeTextArea.height();
  codemirror = CodeMirror.fromTextArea($codeTextArea[0],
    {
      lineNumbers: true,
      viewportMargin: Infinity,
    }
  );
  codemirror.setSize(width, height);

  codemirror.on('blur', function () {
    var input = codemirror.getValue();
    var name = $('.code').data('name');

    if (!name) return;

    $.post('/file',
      {
        name: name,
        content: input,
      }
    );
  });

  $('.files-add').click(addFile);
  $('.add-machine').click(addMachine);
  $('.aws-instances-refresh').click(refreshAwsInstances);

  loadFiles();

  loadAwsInstances();

  $.get('/machines').then(machines => {
    renderMachines(machines);
  });

  $('.clear-stdout').click(function () {
    $.get('/machines/' + selectedClient.id + '/clear-stdout');
  });

  $('.clear-stderr').click(function () {
    $.get('/machines/' + selectedClient.id + '/clear-stderr');
  });
});

function refreshAwsInstances() {
  $('.aws-instances').empty();
  loadAwsInstances();
}

function loadAwsInstances() {
  var key = getAWSAccessKey();
  var secret = getAWSSecret();

  if (!key || !secret) {
    alert('both key and secret are needed');
  }

  $.post(
    '/aws/credentials',
    {
      key: key,
      secret: secret,
    }
  ).then(function () {
    return $.get(
      '/aws/list'
    );
  }).then(function (instances) {
    console.log(instances);
    $('.aws-instances').empty();
    instances.forEach(function (instance) {
      var $e = $('<div class="aws-instance">' +
        '<div class="instance-id">' + instance.instanceId + '</div>' +
        '<div>' + instance.ip + '</div>' +
        '<div>>' + instance.state.Name + '</div>' +
        '<div class="start-machine btn btn-link">Start machine</div>' +
        '<div class="terminate-instance btn btn-link">Terminate</div>' +
        '<div class="status"></div>' +
        '</div>');
      $('.aws-instances').append($e);

      $('.start-machine', $e).click(function () {
        if (instance.state.Name !== 'running') {
          alert('instance not running yet');
          return;
        }

        startMachine(instance.instanceId);
      });

      $('.terminate-instance', $e).click(function () {
        terminateInstance(instance.instanceId);
      });

      socket.on('aws', function (data) {
        console.log('aws event', data);
        if (data.instance && data.instance.instanceId == instance.instanceId) {
          $('.status', $e).text(data.status);
        }
      });
    });
  });

  function terminateInstance(instanceId) {
    $.post(
      '/aws/terminate',
      {
        instanceId: instanceId,
      }
    ).then(loadAwsInstances);
  }

  function startMachine(instanceId) {
    $.post(
      '/aws/startMachine',
      {
        instanceId: instanceId,
      }
    ).then(function (response) {
      console.log(response);
    });
  }
}

function getAWSAccessKey() {
  var lsKey = 'aws_access_key';
  var current = localStorage.getItem(lsKey);
  var key = prompt('Get AWS Access Key ID', current);

  if (key) {
    localStorage.setItem(lsKey, key);
  }

  return key;
}

function getAWSSecret() {
  var lsKey = 'aws_secret';
  var current = localStorage.getItem(lsKey);
  var key = prompt('Get AWS Secret', current);

  if (key) {
    localStorage.setItem(lsKey, key);
  }

  return key;
}

function addMachine() {
  var key = getAWSAccessKey();
  var secret = getAWSSecret();

  if (!key || !secret) {
    alert('both key and secret are needed');
  }

  $.post(
//        '/machines/set-aws-credentials',
    '/aws/credentials',
    {
      key: key,
      secret: secret,
    }
  ).then(function () {
    return $.post(
      '/aws/launch',
      {
        ami: 'ami-f6c89585', //'ami-2b86d458',
        instanceType: 't2.micro',
      }
    );
  }).then(function (response) {
    console.log(response);
  });;
}

function addFile() {
  var name = prompt('filename');

  if (!validFilename(name)) {
    alert('not a valid filename');
    return;
  }

  $.post('/file/add', {
    name: name,
  }).then(function (response) {
    if (response.error) {
      alert(response.error);
    } else {
      loadFiles();
    }
  });
}

function validFilename(filename) {
  if (!filename || filename.length === 0) return false;

  return /^([\w][\w.]*\/)*[\w][\w.]*$/.test(filename);
}

function loadFiles() {
  $.get('/files').then(response => {
    $('.files').empty();
    response.forEach(file => {
      var $f = $('<div class="file">' + file.name + '</div>');
      $f.click(() => { loadFile(file); });
      $('.files').append($f);
    });
  });
}

function loadFile(file) {
  $.get(
    '/file',
    { name: file.name }
  ).then(content => {
    currentFile = file.name;
    codemirror.setValue(content);
    $('.code').data('name', file.name);
    $('.file-title').text(file.name);
    var $mv = $('<span class="file-rename">rename</span>');
    $mv.click(renameFile);
    var $rm = $('<span class="file-remove">delete</span>');
    $rm.click(removeFile);
    $('.file-title').append($mv);
    $('.file-title').append($rm);
  });
}

function unloadFile() {
  $('.code').data('name', '');
  $('.file-title').text('');
  codemirror.setValue('');
}

function removeFile() {
  var filename = $('.code').data('name');

  var confirmed = confirm('Delete file ' + filename);

  if (!confirmed) return;

  $.post(
    '/file/rm',
    {
      name: filename,
    }
  ).then(function (response) {
    if (response.error) {
      alert(response.error);
    } else {
      loadFiles();
      unloadFile();
    }
  });
}

function renameFile() {
  var filename = $('.code').data('name');
  var newFilename = prompt('Rename file ' + filename + ' to', filename);

  if (!validFilename(newFilename)) {
    alert('invalid filename');
    return;
  }

  $.post(
    '/file/mv',
    {
      from: filename,
      to: newFilename,
    }
  ).then(function (response) {
    if (response.error) {
      alert(response.error);
    } else {
      loadFiles();
      loadFile({ name: newFilename });
    }
  });
}

function renderMachines(machines) {
  $('.machines').empty();
  machines
    .map(machine => renderClient(machine))
    .forEach($machine => { $('.editor .machines').append($machine); });

  machines
    .map(machine => renderClient(machine))
    .forEach($machine => {
      $('.outputs .machines').append($machine);
    });
}

function renderOutput(state) {
  $('.outputs .full-stdout').text(state.stdout);
  $('.outputs .full-stderr').text(state.stderr);
  scrollToBottom($('.outputs .full-stdout'));
  scrollToBottom($('.outputs .full-stderr'));
}

function renderClient(state) {
  var $e = $(
    '<div class="client-control">' +
    '  <div class="client-id"></div>' +
    '  <div class="btn btn-link sync"><i class="ion-code-download"></i></div>' +
    '  <div class="btn btn-link run"><i class="ion-play"></i></div>' +
    '  <div class="btn btn-link stop"><i class="ion-stop"></i></div>' +
    // '  <span class="sync-progress"></span>' +
    // '  <div class="run-status"></div>' +
    '  <pre class="stdout"></pre>' +
    '  <pre class="stderr"></pre>' +
    '</div>');

  $e.attr('client-id', state.id);
  $('.client-id', $e).text(state.id);
  $('.stdout', $e).text(state.stdout);
  $('.stderr', $e).text(state.stderr);
  $('.sync-progress', $e).text(state.syncStatus);
  $('.run-status', $e).text(state.runStatus);
  $('.sync', $e).click(sync);
  $('.run', $e).click(run);
  $('.stop', $e).click(stop);
  $('.client-id', $e).click(select);
  if (state.syncStatus === 'syncing') {
    $('.sync', $e).append('...');
  }

  if (selectedClient && selectedClient.id === state.id) {
    $e.addClass('selected');
  }

  if (state.runStatus === 'idle') {
    $('.stop', $e).hide();
  } else {
    $('.run', $e).hide();
  }

  setTimeout(function () {
    scrollToBottom($('.stdout', $e));
    scrollToBottom($('.stderr', $e));
  }, 0);

  return $e;

  function select() {
    var $e = $('.client-control[client-id=' + state.id + ']');
    selectedClient = state;
    renderOutput(state);
    $('.client-control').removeClass('selected');
    $e.addClass('selected');
  }

  function sync() {
    $('.sync-progress', $e).text('...');
    $.get('/machines/' + state.id + '/sync');
  }

  function run() {
    $.get('/machines/' + state.id + '/run', { file: currentFile });
  }

  function stop() {
    $.get('/machines/' + state.id + '/stop');
  }
}

function scrollToBottom($div) {
  $div.each(function () {
    $d = $(this);
    $d[0].scrollTop = $d[0].scrollHeight;
  });
}
