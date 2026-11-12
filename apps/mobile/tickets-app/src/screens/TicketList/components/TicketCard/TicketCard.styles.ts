import { StyleSheet } from 'react-native';
import { fontSize, fontWeight, space } from '@industry/tokens';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: space[2],
  },
  title: { flex: 1, fontSize: fontSize.h5, fontWeight: fontWeight.heading },
  meta: { fontSize: 12 },
});
