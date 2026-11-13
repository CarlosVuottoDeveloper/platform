import { StyleSheet } from 'react-native';
import { fontFamily, fontSize, fontWeight, radii, space } from '@industry/tokens';

export const styles = StyleSheet.create({
  screen: { flex: 1 },
  statusBadge: { alignSelf: 'center' },
  container: {
    padding: space[6],
    gap: space[4],
  },
  titleBlock: { gap: space[1] },
  kicker: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.h6,
  },
  heading: {
    fontFamily: fontFamily.body,
    fontSize: 30,
    lineHeight: 36,
  },
  updatedAt: {
    fontFamily: fontFamily.body,
    fontSize: 11,
  },
  summaryGrid: {
    gap: space[2],
  },
  summaryCell: {
    borderRadius: radii.md,
    padding: space[4],
    gap: space[1],
  },
  summaryCellLabel: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.h6,
  },
  summaryCellValue: {
    fontFamily: fontFamily.body,
    fontSize: 15,
  },
  fieldLabel: {
    fontFamily: fontFamily.heading,
    fontSize: 13,
    fontWeight: fontWeight.heading,
  },
  fieldValue: {
    fontFamily: fontFamily.body,
    fontSize: 15,
  },
  field: {
    gap: space[1],
  },
  listItemRow: {
    flexDirection: 'row',
    gap: space[2],
  },
  listItemNumber: {
    fontFamily: fontFamily.body,
    fontSize: 15,
  },
  listItem: {
    fontFamily: fontFamily.body,
    fontSize: 15,
  },
  bottomBarPrimary: { flex: 1 },
  bottomBarSecondary: { flex: 1 },
});
