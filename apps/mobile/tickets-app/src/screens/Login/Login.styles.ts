import { StyleSheet } from 'react-native';
import { fontFamily, fontWeight, space } from '@industry/tokens';

export const styles = StyleSheet.create({
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
  footer: { gap: space[4] },
  divider: { height: 1 },
  footerHint: { textAlign: 'center', fontSize: 13 },
});
