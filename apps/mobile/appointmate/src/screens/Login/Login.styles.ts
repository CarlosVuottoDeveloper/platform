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
  header: { alignItems: 'center', gap: space[2] },
  appTitle: {
    fontFamily: fontFamily.heading,
    fontWeight: fontWeight.heading,
    fontSize: 30,
    letterSpacing: letterSpacing.heading,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  kicker: {
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  form: { gap: space[3] },
  helperRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  link: { fontSize: 15, textDecorationLine: 'underline' },
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
  footerHint: { fontSize: 15 },
});
