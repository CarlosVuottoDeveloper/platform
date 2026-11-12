import { StyleSheet } from 'react-native';
import { fontFamily, radii, space } from '@industry/tokens';

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { gap: space[4], padding: space[6] },
  intro: { fontFamily: fontFamily.body, fontSize: 15, lineHeight: 22 },
  sectionLabelBlock: { marginTop: space[2] },
  roleRow: { flexDirection: 'row', gap: space[3] },
  roleButton: { flex: 1 },
  roleHint: { fontFamily: fontFamily.body, fontSize: 13, lineHeight: 19 },
  adminTag: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: space[3],
    paddingVertical: space[1],
  },
  adminTagText: { fontFamily: fontFamily.body, fontSize: 13 },
  bottomBarButton: { flex: 1 },
});
