import React from 'react';
import config from './config';

import StreamComponent from './stream-component';

export default class StdoutView extends StreamComponent {
  constructor(props) {
    super(props, 'stdout', config.api + '/machines/' + props.machine.id + '/clear-stdout');
  }
}
