import AttendanceSettings from './attendance-settings';
import InvoiceSettings from './invoice-settings';
import MemberActivity from './member-activity';
import NotificationPreferences from './notification-preferences';

const OperationsTab = () => {
  return (
    <div className="space-y-6">
      <MemberActivity />
      <NotificationPreferences />
      <AttendanceSettings />
      <InvoiceSettings />
    </div>
  );
};

export default OperationsTab;
