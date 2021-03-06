import React, { Component } from 'react';
import { connect } from 'react-redux';
import s from './styles.css';

import notify from '../../../utils/notifications';

import { get } from '../../../utils/fetch';

import Spinner from '../../common/Spinner';
import Globals from '../../../locales/globals';

const KycFailedStatus = 'failed';

class Verification extends Component {
  constructor(props) {
    super(props);

    this.state = {
      timestamp: '',
      message: '',
      reference: '',
      signature: '',
      status_code: ''
    };
  }

  kycInit = () => {
    get('/kyc/init').then(({ message }) => {
      this.setState({ message });
    });
  }

  componentDidMount() {
    this.kycInit();
  }

  componentDidUpdate(prevProps) {
    const { newKycStatus } = this.props;
    const { oldKycStatus } = prevProps;

    if (oldKycStatus !== newKycStatus && newKycStatus === KycFailedStatus) {
      this.kycInit();
    }
  }

  render() {
    const { kycStatus } = this.props;

    const renderPage = () => {
      switch (kycStatus) {
        case 'verified':
          return renderSuccess();
        case KycFailedStatus:
          return renderFailed();
        case 'pending':
          return renderPending();
        default:
          return renderPlugin();
      }
    };

    const renderFailed = () => (
      <div className={s.status}>
        <div className={s.title}>Verification failure.</div>
        <div className={s.text}>
          We were unable to match your account information
          automatically with your uploaded documents.
          Please {this.state.message ? 'try again or ' : ''}
          contact {Globals.companyName} support for help.<br/><br/>
          <a href={`mailto:${Globals.supportMail}`}>{Globals.supportMail}</a>
        </div>
        {this.state.message ? renderPlugin() : null}
      </div>
    );

    const renderSuccess = () => (
      <div className={s.status}>
        <div className={s.title}>Account verification complete</div>
        <div className={s.text}>
          Your personal data has been verified successfully,
          and you now have full access to the {Globals.companyName} token sale.
        </div>
      </div>
    );

    const renderPending = () => (
      <div className={s.status}>
        <div className={s.title}>Your account is being verified…</div>
        <div className={s.text}>
          Your documents have been successfully uploaded and are being processed now.
          This may take up to 30 minutes, please be patient and do not try to
          relaunch the verification process.
        </div>
      </div>
    );

    const renderPlugin = () => (
      <div className={s.pluginContainer}>
        {
          this.state.message
            ? <iframe style={{ width: '702px', height: '502px', border: 'none' }} src={this.state.message} id="api-frame" />
            : <div className={s.spinner}>
              <Spinner color="#f52c5a" />
            </div>
        }
      </div>
    );

    return (
      <div>
        {renderPage()}
      </div>
    );
  }
}

export default connect(
  (state) => ({
    kycStatus: state.app.app.user.kycStatus
  }),
  {
    notify
  }
)(Verification);
