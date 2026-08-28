import type {ComponentProps, ReactNode} from 'react';
import {Cube, Desktop, Robot, TerminalWindow} from '@phosphor-icons/react';

export type ProductIconName = 'terminal' | 'robot' | 'desktop' | 'cube';

const iconComponents = {
  terminal: TerminalWindow,
  robot: Robot,
  desktop: Desktop,
  cube: Cube,
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
