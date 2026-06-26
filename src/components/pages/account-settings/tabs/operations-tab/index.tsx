import InvoiceSettings from '../business-profile-tab/invoice-settings';
import MemberActivity from './member-activity';
import NotificationPreferences from './notification-preferences';

const OperationsTab = () => {
  return (
    <div className="space-y-6">
      <MemberActivity />
      <NotificationPreferences />
      <InvoiceSettings />
    </div>
  );
};

export default OperationsTab;
