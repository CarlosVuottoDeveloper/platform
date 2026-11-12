import { StyleSheet } from 'react-native';
import { fontSize, radii, space } from '@industry/tokens';

export const styles = StyleSheet.create({
  grid: { gap: space[2], marginHorizontal: space[6] },
  row: { flexDirection: 'row', gap: space[2] },
  cell: { flex: 1, padding: space[3], gap: space[1], borderRadius: radii.md },
  cellLabel: { fontSize: fontSize.h6, letterSpacing: 1, textTransform: 'uppercase' },
  cellValue: { fontSize: 15 },
});
