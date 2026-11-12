import { StyleSheet } from 'react-native';
import { fontFamily, fontSize, fontWeight, radii, space } from '@industry/tokens';

export const styles = StyleSheet.create({
  commentRow: { flexDirection: 'row', gap: space[3] },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fontFamily.heading, fontSize: 12, fontWeight: fontWeight.heading },
  commentBody: { flex: 1, gap: space[1] },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  commentAuthor: { fontFamily: fontFamily.body, fontSize: 14, fontWeight: fontWeight.medium },
  commentDate: { fontFamily: fontFamily.body, fontSize: 10 },
  commentText: { fontFamily: fontFamily.body, fontSize: fontSize.body },
  deleteButton: { alignSelf: 'flex-start', borderWidth: 0 },
});
