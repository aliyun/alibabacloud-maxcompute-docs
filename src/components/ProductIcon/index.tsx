import type {ComponentProps, ReactNode} from 'react';
import {
  Code,
  Cube,
  Database,
  Desktop,
  FlowArrow,
  Lightning,
  Plugs,
  Robot,
  TerminalWindow,
} from '@phosphor-icons/react';

export type ProductIconName =
  | 'terminal'
  | 'robot'
  | 'desktop'
  | 'cube'
  | 'code'
  | 'database'
  | 'flow'
  | 'plug'
  | 'lightning';

const iconComponents = {
  terminal: TerminalWindow,
  robot: Robot,
  desktop: Desktop,
  cube: Cube,
  code: Code,
  database: Database,
  flow: FlowArrow,
  plug: Plugs,
  lightning: Lightning,
} as const;

type ProductIconProps = Omit<ComponentProps<typeof Cube>, 'ref'> & {
  name: ProductIconName;
};

export default function ProductIcon({
  name,
  size = 28,
  weight = 'duotone',
  ...props
}: ProductIconProps): ReactNode {
  const Icon = iconComponents[name];
  return <Icon aria-hidden="true" size={size} weight={weight} {...props} />;
}
