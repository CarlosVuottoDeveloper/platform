import { StyleSheet } from 'react-native';
import { space } from '@industry/tokens';

export const styles = StyleSheet.create({
  screen: { flex: 1 },
  statusBadge: { alignSelf: 'center' },
  container: {
    padding: space[6],
    gap: space[4],
  },
  titleBlock: { gap: space[1] },
  kicker: {
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  heading: {
    fontSize: 30,
    lineHeight: 36,
  },
  updatedAt: {
    fontSize: 11,
  },
  summaryGrid: {
    gap: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 1,
  },
  summaryCell: {
    flex: 1,
    padding: space[4],
    gap: space[1],
  },
  summaryCellLabel: {
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  summaryCellValue: {
    fontSize: 15,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  fieldValue: {
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
    fontSize: 15,
  },
  listItem: {
    fontSize: 15,
  },
  bottomBarPrimary: { flex: 1 },
  bottomBarSecondary: { flex: 1 },
});
