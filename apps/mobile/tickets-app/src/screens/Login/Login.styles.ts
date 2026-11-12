import { StyleSheet } from 'react-native';
import { fontFamily, fontSize, fontWeight, space } from '@industry/tokens';

export const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: space[6],
    gap: space[8],
  },
  header: { alignItems: 'center', gap: space[2] },
  appTitle: {
    fontFamily: fontFamily.heading,
    fontWeight: fontWeight.heading,
    fontSize: 38,
    textAlign: 'center',
  },
  kicker: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.h6,
  },
  form: { gap: space[3] },
  helperRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  link: { fontFamily: fontFamily.body, fontSize: 15, textDecorationLine: 'underline' },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[2],
  },
  orDivider: { flex: 1, height: 1 },
  orLabel: {
    fontFamily: fontFamily.body,
    fontSize: 12,
  },
  googleMark: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleMarkLetter: {
    fontFamily: fontFamily.heading,
    fontWeight: fontWeight.heading,
    fontSize: 15,
  },
  googleLabel: {
    fontFamily: fontFamily.heading,
    fontWeight: fontWeight.heading,
    fontSize: 15,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: space[2],
  },
  footerHint: { fontFamily: fontFamily.body, fontSize: 15 },
});
