import InvoiceSettings from '../business-profile-tab/invoice-settings';
import NotificationPreferences from './notification-preferences';

const OperationsTab = () => {
  return (
    <div className="space-y-6">
      <NotificationPreferences />
      <InvoiceSettings />
    </div>
  );
};

export default OperationsTab;
