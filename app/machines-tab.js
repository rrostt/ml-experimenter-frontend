import React from 'react';
import MachinesList from './machines-list';
import StdoutView from './stdout-view';
import StderrView from './stderr-view';
import AwsInstancesSidebar from './aws-instances-sidebar';
import config from './config';

export default class MachinesTab extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedMachine: undefined,
    };
  }

  machineSelected(machine) {
    this.setState({ selectedMachine: machine });
  }

  render() {
    return <div role="tabpanel" className="tab-pane outputs" id="machines">
      <div className='row'>
        <div className='col-xs-2 machines-column'>
          <div className='machines-title'>Machines</div>
          <MachinesList onSelected={(machine) => this.machineSelected(machine)}/>
          <AwsInstancesSidebar />
        </div>
        { this.state.selectedMachine ?
          <div className='col-xs-5'>
            <StdoutView machine={this.state.selectedMachine} />
          </div>
          :
          <div></div>
        }
        { this.state.selectedMachine ?
          <div className='col-xs-5'>
            <StderrView machine={this.state.selectedMachine} />
          </div>
          :
          <div></div>
        }
      </div>
    </div>;
  }
}
