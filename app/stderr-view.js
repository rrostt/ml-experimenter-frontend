import React from 'react';
import config from './config';

import StreamComponent from './stream-component';

export default class StderrView extends StreamComponent {
  constructor(props) {
    super(props, 'stderr', config.api + '/machines/' + props.machine.id + '/clear-stderr');
  }
}
