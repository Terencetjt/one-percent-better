import React from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../theme/tokens';
import { Text } from './Text';

export function SectionLabel({
  children,
  trailing,
}: {
  children: string;
  trailing?: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      <Text variant="label">{children.toUpperCase()}</Text>
      {trailing ? <View>{trailing}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
});
