import { StyleSheet } from 'react-native';
import { fontFamily, fontSize, radii, space } from '@industry/tokens';

export const styles = StyleSheet.create({
  grid: { gap: space[2], marginHorizontal: space[6] },
  row: { flexDirection: 'row', gap: space[2] },
  cell: { flex: 1, padding: space[3], gap: space[1], borderRadius: radii.md },
  cellLabel: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.h6,
  },
  cellValue: { fontFamily: fontFamily.body, fontSize: 15 },
});
