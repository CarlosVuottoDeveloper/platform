import { StyleSheet } from 'react-native';
import { space } from '@industry/tokens';

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { gap: space[4], padding: space[6] },
  intro: { fontSize: 15, lineHeight: 22 },
  sectionLabelBlock: { gap: space[2], marginTop: space[2] },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  sectionHairline: { height: 1 },
  roleRow: { flexDirection: 'row', gap: space[3] },
  roleButton: { flex: 1 },
  roleHint: { fontSize: 13, lineHeight: 19 },
  adminTag: {
    borderWidth: 1,
    paddingHorizontal: space[3],
    paddingVertical: space[1],
  },
  adminTagText: { fontSize: 13 },
  bottomBarButton: { flex: 1 },
});
