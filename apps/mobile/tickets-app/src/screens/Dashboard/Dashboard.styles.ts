import { StyleSheet } from 'react-native';
import { fontFamily, fontSize, fontWeight, radii, space } from '@industry/tokens';

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    gap: space[4],
    paddingTop: space[4],
    paddingBottom: space[8] + 56 + space[6],
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fab: { position: 'absolute', right: space[6] },
  trailingActions: { flexDirection: 'row', alignItems: 'center' },
  trailingIconButton: { padding: space[2] },
  trailingTextButton: { paddingHorizontal: space[3], paddingVertical: space[2] },
  trailingTextButtonLabel: {
    fontFamily: fontFamily.heading,
    fontSize: 15,
    fontWeight: fontWeight.heading,
  },
  chartCard: {
    borderRadius: radii.lg,
    padding: space[4],
  },
  chartTotalText: { fontFamily: fontFamily.body, fontSize: 19 },
  sectionLabelBlock: { marginBottom: space[3] },
  sectionLabelCount: { fontFamily: fontFamily.body, fontSize: 12 },
  recentList: { gap: space[3] },
  recentItem: { gap: space[1] },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: space[2],
  },
  recentTitle: {
    fontFamily: fontFamily.heading,
    flex: 1,
    fontSize: fontSize.h5,
    fontWeight: fontWeight.heading,
  },
  recentMeta: { fontFamily: fontFamily.body, fontSize: 12 },
  statCardWrapper: { marginLeft: space[2] },
  sectionPad: { paddingHorizontal: space[4] },
  listHeaderSpacer: { width: space[2] },
  listFooterSpacer: { width: space[4] },
  emptyState: { marginHorizontal: space[4] },
});
