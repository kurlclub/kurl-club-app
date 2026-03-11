const InfoCard = ({
  amount,
  paidCount,
  totalCount,
  isPaid,
}: {
  amount: string;
  paidCount: number;
  totalCount: number;
  isPaid?: boolean;
}) => {
  return (
    <div
      className="rounded-lg w-full border border-white/30 px-4 py-4 flex flex-col 
bg-linear-to-l from-[#90A8ED]/30 to-[#11141C] relative"
    >
      <div className="flex items-center gap-2">
        <span className="text-secondary-blue-200 text-[13px] leading-normal uppercase">
          {isPaid ? 'Total paid' : 'Total pending'}
        </span>
        <span
          className={`w-2.5 h-2.5 rounded-[3px] block ${isPaid ? 'bg-neutral-green-400' : 'bg-alert-red-400'}`}
        />
      </div>
      <span className="text-[40px] leading-normal mt-1">{amount}</span>
      <span className="text-secondary-blue-200/70 text-[14px] leading-normal mt-3">
        {paidCount}/{totalCount} people paid
      </span>
    </div>
  );
};

const CardWrapper = () => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <InfoCard amount="₹1,13,000" paidCount={5} totalCount={10} isPaid />
      <InfoCard amount="₹1,13,000" paidCount={5} totalCount={10} />
    </div>
  );
};

export default CardWrapper;
