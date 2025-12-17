import React from 'react';

import InvoiceSettings from '../business-profile-tab/invoice-settings';
import NotificationPreferences from './notification-preferences';
import SetBuffer from './set-buffer';

const OperationsTab = () => {
  return (
    <div className="space-y-6">
      <SetBuffer />
      <NotificationPreferences />
      <InvoiceSettings />
    </div>
  );
};

export default OperationsTab;
