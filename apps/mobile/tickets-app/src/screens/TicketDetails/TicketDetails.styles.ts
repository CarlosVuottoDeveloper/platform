import { StyleSheet } from 'react-native';
import { fontFamily, fontSize, fontWeight, space } from '@industry/tokens';

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
    fontSize: fontSize.h3,
    fontFamily: fontFamily.heading,
    fontWeight: fontWeight.heading,
    paddingHorizontal: space[6],
  },
  titleEditing: {
    fontFamily: fontFamily.heading,
    fontSize: 19,
    fontWeight: fontWeight.heading,
    paddingHorizontal: space[6],
  },
  description: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: space[6],
  },
  sectionLabelBlock: { paddingHorizontal: space[6], marginTop: space[2] },
  sectionLabelCount: { fontFamily: fontFamily.body, fontSize: 12 },
  emptyComments: {
    fontFamily: fontFamily.body,
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
  diffLabel: {
    fontFamily: fontFamily.body,
    width: space[12] * 2,
    fontSize: fontSize.h6,
  },
  diffValue: { fontFamily: fontFamily.body, flex: 1, fontSize: 15 },
});
