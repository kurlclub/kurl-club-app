import { useId } from 'react';
import { SVGProps } from 'react';

export const RevenueBreakdownEmptyIcon = (props: SVGProps<SVGSVGElement>) => {
  const uniqueId = useId().replace(/:/g, '');
  const gradientId = `rb-empty-grad-${uniqueId}`;
  const plusGradientId = `rb-empty-plus-grad-${uniqueId}`;
  const maskId = `rb-empty-mask-${uniqueId}`;

  return (
    <svg
      width="241"
      height="241"
      viewBox="0 0 241 241"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M120.508 -5.26722e-06C187.058 -8.17623e-06 241.008 53.9497 241.008 120.5C241.008 187.05 187.058 241 120.508 241C53.9575 241 0.00780251 187.05 0.0077996 120.5C0.00779669 53.9497 53.9575 -2.35822e-06 120.508 -5.26722e-06ZM120.508 204.85C167.093 204.85 204.858 167.085 204.858 120.5C204.858 73.9148 167.093 36.15 120.508 36.15C73.9226 36.15 36.1578 73.9148 36.1578 120.5C36.1578 167.085 73.9226 204.85 120.508 204.85Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M120.5 -5.26722e-06C93.9737 -4.10773e-06 68.1888 8.7528 47.1442 24.9009C26.0995 41.049 10.9713 63.69 4.10586 89.3123L39.0241 98.6686C43.8299 80.733 54.4197 64.8843 69.1509 53.5806C83.8821 42.277 101.932 36.15 120.5 36.15L120.5 -5.26722e-06Z"
        fill="#646569"
      />
      <circle
        cx="177.669"
        cy="204.057"
        r="34.4434"
        fill="#262930"
        stroke="#24272E"
        strokeWidth="5"
      />
      <mask
        id={maskId}
        maskUnits="userSpaceOnUse"
        x="165"
        y="192"
        width="25"
        height="25"
        style={{ maskType: 'alpha' }}
      >
        <rect x="165.668" y="192.059" width="24" height="24" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${maskId})`}>
        <path
          d="M176.668 213.059V205.059H168.668V203.059H176.668V195.059H178.668V203.059H186.668V205.059H178.668V213.059H176.668Z"
          fill={`url(#${plusGradientId})`}
        />
      </g>
      <defs>
        <linearGradient
          id={gradientId}
          x1="120.508"
          y1="-5.26722e-06"
          x2="120.508"
          y2="241"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#53555B" />
          <stop offset="1" stopColor="#24272E" />
        </linearGradient>
        <linearGradient
          id={plusGradientId}
          x1="151.097"
          y1="188.887"
          x2="185.297"
          y2="210.573"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
};
