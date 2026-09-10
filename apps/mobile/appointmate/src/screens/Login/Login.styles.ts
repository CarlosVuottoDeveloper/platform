import { StyleSheet } from 'react-native';
import { fontFamily, fontWeight, letterSpacing, space } from '@industry/tokens';

export const styles = StyleSheet.create({
  screen: { flex: 1 },
  keyboardView: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: space[6],
    gap: space[8],
  },
  header: { gap: space[2] },
  kicker: {
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  appTitle: {
    fontFamily: fontFamily.heading,
    fontWeight: fontWeight.heading,
    fontSize: 38,
    letterSpacing: letterSpacing.heading,
  },
  form: { gap: space[3] },
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
  googleCaption: { textAlign: 'center', fontSize: 13 },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[2],
  },
  orDivider: { flex: 1, height: 1 },
  orLabel: {
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  link: { fontSize: 15, textDecorationLine: 'underline' },
  footer: { gap: space[4] },
  divider: { height: 1 },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: space[2],
  },
  footerHint: { fontSize: 15 },
});
