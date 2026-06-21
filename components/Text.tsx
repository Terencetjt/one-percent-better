import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { typography } from '../theme/tokens';

type Variant = keyof Omit<typeof typography, 'serif' | 'sans'>;

interface TextProps extends RNTextProps {
  variant?: Variant;
  color?: string;
  align?: TextStyle['textAlign'];
}

/**
 * Typed text component that pulls every style from the typography tokens.
 * Keeps font/size/line-height consistent and out of individual screens.
 */
export function Text({
  variant = 'body',
  color,
  align,
  style,
  ...rest
}: TextProps) {
  const base = typography[variant] as TextStyle;
  return (
    <RNText
      style={[base, color ? { color } : null, align ? { textAlign: align } : null, style]}
      {...rest}
    />
  );
}
