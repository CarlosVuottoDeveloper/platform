import { StyleSheet } from 'react-native';
import { fontFamily, fontWeight, space } from '@industry/tokens';

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  keyboardView: { flex: 1 },
  container: { paddingTop: space[4], gap: space[3], flexGrow: 1, paddingBottom: space[8] },
  paddedRow: { paddingHorizontal: space[6] },
  badgeRow: {
    flexDirection: 'row',
    gap: space[2],
    paddingHorizontal: space[6],
  },
  title: {
    fontSize: 26,
    fontFamily: fontFamily.heading,
    fontWeight: fontWeight.heading,
    paddingHorizontal: space[6],
  },
  titleEditing: { fontSize: 19, fontWeight: '600', paddingHorizontal: space[6] },
  description: {
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: space[6],
  },
  sectionLabelBlock: { gap: space[2], paddingHorizontal: space[6], marginTop: space[2] },
  sectionLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHairline: { height: 1 },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  sectionLabelCount: { fontSize: 12 },
  emptyComments: {
    fontSize: 13,
    paddingHorizontal: space[6],
  },
  diffGrid: { gap: space[1] },
  diffRow: {
    flexDirection: 'row',
    gap: space[3],
    paddingVertical: space[2],
    borderBottomWidth: 1,
  },
  diffLabel: { width: 88, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  diffValue: { flex: 1, fontSize: 15 },
});
